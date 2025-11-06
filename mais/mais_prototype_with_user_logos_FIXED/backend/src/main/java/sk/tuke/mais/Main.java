package sk.tuke.mais;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import sk.tuke.mais.auth.PasswordHasher;
import sk.tuke.mais.auth.Role;
import sk.tuke.mais.auth.TokenService;
import sk.tuke.mais.auth.UserAccount;
import sk.tuke.mais.auth.UserAccountRepository;
import sk.tuke.mais.data.Database;
import sk.tuke.mais.grades.Grade;
import sk.tuke.mais.grades.GradebookService;
import sk.tuke.mais.grades.Subject;
import sk.tuke.mais.http.HttpException;
import sk.tuke.mais.http.Json;
import sk.tuke.mais.http.RouteHandler;
import sk.tuke.mais.http.SimpleRouter;

public class Main {
  public static void main(String[] args) throws Exception {
    int port = Integer.parseInt(System.getProperty("mais.port", System.getenv().getOrDefault("PORT", "8080")));
    String secret = System.getProperty("mais.secret", "change_me_change_me_change_me_change_me");
    Path dataPath = Path.of(System.getProperty("mais.data", "mais-gradebook.db"));

    Database database = Database.open(dataPath);
    database.ensureSequences();
    PasswordHasher hasher = new PasswordHasher();
    UserAccountRepository users = new UserAccountRepository(database);
    GradebookService gradebookService = new GradebookService(database, users);
    DataSeeder seeder = new DataSeeder(database, users, hasher);
    seeder.seedIfEmpty();

    TokenService tokens = new TokenService(secret);

    HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
    SimpleRouter router = new SimpleRouter();

    router.add("POST", "/api/auth/login", (exchange, params) -> {
      Map<String, Object> body = readJson(exchange);
      String username = (String) body.get("username");
      String password = (String) body.get("password");
      if (username == null || password == null) {
        throw new HttpException(400, "Používateľské meno a heslo sú povinné");
      }
      UserAccount user = users.findByUsername(username)
          .filter(acc -> hasher.matches(password, acc.getPasswordHash()))
          .orElseThrow(() -> new HttpException(401, "Nesprávne prihlasovacie údaje"));
      Instant expiresAt = Instant.now().plus(Duration.ofHours(8));
      String token = tokens.generateToken(user, expiresAt);
      Map<String, Object> response = new HashMap<>();
      response.put("token", token);
      response.put("user", userDto(user));
      sendJson(exchange, 200, response);
    });

    router.add("GET", "/api/subjects", requireUser(tokens, users, (exchange, params, user) -> {
      List<Subject> subjects = switch (user.getRole()) {
        case TEACHER -> gradebookService.subjectsForTeacher(user);
        case STUDENT -> gradebookService.subjectsForStudent(user);
        default -> gradebookService.allSubjects();
      };
      List<Map<String, Object>> payload = subjects.stream()
          .map(subject -> subjectDto(subject, user, gradebookService, users))
          .toList();
      sendJson(exchange, 200, payload);
    }));

    router.add("POST", "/api/subjects/:subjectId/enrollments", requireUser(tokens, users, (exchange, params, user) -> {
      if (user.getRole() != Role.TEACHER) {
        throw new HttpException(403, "Len učiteľ môže zapisovať študentov");
      }
      long subjectId = parseId(params.get("subjectId"));
      Map<String, Object> body = readJson(exchange);
      Object studentIdRaw = body.get("studentId");
      if (!(studentIdRaw instanceof Number number)) {
        throw new HttpException(400, "Identifikátor študenta je povinný");
      }
      gradebookService.enrollStudent(subjectId, number.longValue(), user);
      Subject subject = gradebookService.requireSubjectOwnedByTeacher(subjectId, user);
      sendJson(exchange, 201, subjectDto(subject, user, gradebookService, users));
    }));

    router.add("POST", "/api/subjects/:subjectId/grades", requireUser(tokens, users, (exchange, params, user) -> {
      if (user.getRole() != Role.TEACHER) {
        throw new HttpException(403, "Len učiteľ môže zapisovať známky");
      }
      long subjectId = parseId(params.get("subjectId"));
      Map<String, Object> body = readJson(exchange);
      Object studentIdRaw = body.get("studentId");
      Object valueRaw = body.get("value");
      String description = body.get("description") instanceof String s ? s : null;
      if (!(studentIdRaw instanceof Number number)) {
        throw new HttpException(400, "Identifikátor študenta je povinný");
      }
      if (!(valueRaw instanceof Number valueNumber)) {
        throw new HttpException(400, "Hodnota známky je povinná");
      }
      Grade grade = gradebookService.createGrade(subjectId, number.longValue(), valueNumber.intValue(), description, user);
      sendJson(exchange, 201, gradeDto(grade, users, gradebookService));
    }));

    router.add("GET", "/api/subjects/:subjectId/grades", requireUser(tokens, users, (exchange, params, user) -> {
      long subjectId = parseId(params.get("subjectId"));
      List<Map<String, Object>> payload = gradebookService.gradesForSubjectAndUser(subjectId, user).stream()
          .map(grade -> gradeDto(grade, users, gradebookService))
          .toList();
      sendJson(exchange, 200, payload);
    }));

    router.add("GET", "/api/grades/me", requireUser(tokens, users, (exchange, params, user) -> {
      if (user.getRole() != Role.STUDENT) {
        throw new HttpException(403, "Len študent môže zobraziť svoje známky");
      }
      List<Map<String, Object>> payload = gradebookService.gradesForStudent(user).stream()
          .map(grade -> gradeDto(grade, users, gradebookService))
          .toList();
      sendJson(exchange, 200, payload);
    }));

    server.createContext("/", exchange -> {
      try {
        addCorsHeaders(exchange);
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
          exchange.sendResponseHeaders(204, -1);
          return;
        }
        router.handle(exchange);
      } catch (HttpException ex) {
        sendJson(exchange, ex.getStatus(), Map.of("error", ex.getMessage()));
      } catch (IllegalArgumentException ex) {
        sendJson(exchange, 400, Map.of("error", ex.getMessage()));
      } catch (SecurityException ex) {
        sendJson(exchange, 403, Map.of("error", ex.getMessage()));
      } catch (Exception ex) {
        ex.printStackTrace();
        sendJson(exchange, 500, Map.of("error", "Neočakávaná chyba"));
      } finally {
        exchange.close();
      }
    });

    server.start();
    System.out.println("Gradebook backend started on port " + port);
  }

  private static RouteHandler requireUser(TokenService tokens, UserAccountRepository users, AuthenticatedHandler handler) {
    return (exchange, params) -> {
      String auth = exchange.getRequestHeaders().getFirst("Authorization");
      if (auth == null || !auth.startsWith("Bearer ")) {
        throw new HttpException(401, "Prihlásenie je povinné");
      }
      String token = auth.substring("Bearer ".length());
      TokenService.TokenPayload payload = tokens.parseToken(token)
          .orElseThrow(() -> new HttpException(401, "Neplatný token"));
      UserAccount user = users.findByUsername(payload.username())
          .orElseThrow(() -> new HttpException(401, "Používateľ neexistuje"));
      handler.handle(exchange, params, user);
    };
  }

  private static Map<String, Object> userDto(UserAccount user) {
    Map<String, Object> dto = new HashMap<>();
    dto.put("id", user.getId());
    dto.put("username", user.getUsername());
    dto.put("role", user.getRole().name());
    dto.put("fullName", user.getFullName());
    dto.put("studyProgram", user.getStudyProgram());
    dto.put("semester", user.getSemester());
    dto.put("studentId", user.getStudentId());
    dto.put("teacherId", user.getTeacherId());
    return dto;
  }

  private static Map<String, Object> subjectDto(Subject subject, UserAccount viewer, GradebookService service, UserAccountRepository users) {
    Map<String, Object> dto = new HashMap<>();
    dto.put("id", subject.getId());
    dto.put("code", subject.getCode());
    dto.put("name", subject.getName());
    users.findById(subject.getTeacherId()).ifPresent(teacher -> dto.put("teacher", Map.of(
        "id", teacher.getId(),
        "username", teacher.getUsername(),
        "fullName", teacher.getFullName()
    )));
    List<Map<String, Object>> students = service.enrollmentsForSubject(subject).stream()
        .map(enrollment -> users.findById(enrollment.getStudentId())
            .map(student -> Map.of(
                "id", student.getId(),
                "username", student.getUsername(),
                "fullName", student.getFullName()
            ))
            .orElse(null))
        .filter(map -> map != null)
        .toList();
    if (viewer.getRole() == Role.STUDENT) {
      students = students.stream()
          .filter(student -> student.get("id").equals(viewer.getId()))
          .toList();
    }
    dto.put("students", students);
    return dto;
  }

  private static Map<String, Object> gradeDto(Grade grade, UserAccountRepository users, GradebookService service) {
    Map<String, Object> dto = new HashMap<>();
    dto.put("id", grade.getId());
    dto.put("value", grade.getValue());
    dto.put("description", grade.getDescription());
    if (grade.getAssignedAt() != null) {
      dto.put("assignedAt", grade.getAssignedAt().toString());
    }
    service.findSubject(grade.getSubjectId()).ifPresent(subject -> {
      dto.put("subjectId", subject.getId());
      dto.put("subjectName", subject.getName());
    });
    users.findById(grade.getStudentId()).ifPresent(student -> {
      dto.put("studentId", student.getId());
      dto.put("studentName", student.getFullName());
    });
    users.findById(grade.getTeacherId()).ifPresent(teacher -> {
      dto.put("teacherId", teacher.getId());
      dto.put("teacherName", teacher.getFullName());
    });
    return dto;
  }

  private static Map<String, Object> readJson(HttpExchange exchange) throws IOException {
    byte[] body = exchange.getRequestBody().readAllBytes();
    String json = new String(body, StandardCharsets.UTF_8);
    if (json.isBlank()) {
      return Map.of();
    }
    return Json.parseObject(json);
  }

  private static long parseId(String value) {
    try {
      return Long.parseLong(value);
    } catch (NumberFormatException e) {
      throw new HttpException(400, "Neplatný identifikátor");
    }
  }

  private static void sendJson(HttpExchange exchange, int status, Object payload) throws IOException {
    byte[] bytes = Json.stringify(payload).getBytes(StandardCharsets.UTF_8);
    Headers headers = exchange.getResponseHeaders();
    addCorsHeaders(exchange);
    headers.set("Content-Type", "application/json; charset=utf-8");
    exchange.sendResponseHeaders(status, bytes.length);
    try (OutputStream os = exchange.getResponseBody()) {
      os.write(bytes);
    }
  }

  private static void addCorsHeaders(HttpExchange exchange) {
    Headers headers = exchange.getResponseHeaders();
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE");
  }

  @FunctionalInterface
  private interface AuthenticatedHandler {
    void handle(HttpExchange exchange, Map<String, String> params, UserAccount user) throws IOException;
  }
}
