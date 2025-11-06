package sk.tuke.mais.auth;
import io.jsonwebtoken.Jwts; import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value; import org.springframework.http.ResponseEntity; import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.web.bind.annotation.*;
import java.nio.charset.StandardCharsets; import java.security.Key; import java.time.Instant; import java.util.Date; import java.util.Map;
@RestController @RequestMapping("/api/auth") @CrossOrigin(origins="*",allowedHeaders="*")
public class AuthController {
  private final UserAccountRepository repo; private final PasswordEncoder encoder; @Value("${app.jwt.secret}") private String secret;
  public AuthController(UserAccountRepository repo, PasswordEncoder encoder){ this.repo=repo; this.encoder=encoder; }
  public record LoginRequest(String username,String password) {}
  public record UserDto(Long id,String username,String role,String fullName,String studyProgram,Integer semester,Long studentId,Long teacherId) {}
  public record LoginResponse(String token, UserDto user) {}
  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest req){
    var user = repo.findByUsername(req.username()).orElse(null);
    if(user==null || !encoder.matches(req.password(), user.getPasswordHash()))
      return ResponseEntity.status(401).body(Map.of("error","Invalid credentials"));
    Key key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    String jwt = Jwts.builder().setSubject(user.getUsername()).claim("uid", user.getId()).claim("role", user.getRola().name()).setIssuedAt(new Date()).setExpiration(Date.from(Instant.now().plusSeconds(60L*60*8))).signWith(key).compact();
    var dto = new UserDto(user.getId(), user.getUsername(), user.getRola().name(), user.getFullName(), user.getStudyProgram(), user.getSemester(), user.getStudentId(), user.getTeacherId());
    return ResponseEntity.ok(new LoginResponse(jwt, dto));
  }
}