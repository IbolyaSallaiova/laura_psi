package sk.tuke.mais;

import java.time.Instant;
import sk.tuke.mais.auth.PasswordHasher;
import sk.tuke.mais.auth.Role;
import sk.tuke.mais.auth.UserAccount;
import sk.tuke.mais.auth.UserAccountRepository;
import sk.tuke.mais.data.Database;
import sk.tuke.mais.grades.Grade;
import sk.tuke.mais.grades.Subject;
import sk.tuke.mais.grades.SubjectEnrollment;

public class DataSeeder {
  private final Database database;
  private final UserAccountRepository users;
  private final PasswordHasher hasher;

  public DataSeeder(Database database, UserAccountRepository users, PasswordHasher hasher) {
    this.database = database;
    this.users = users;
    this.hasher = hasher;
  }

  public void seedIfEmpty() {
    if (!database.getUsers().isEmpty()) {
      return;
    }

    UserAccount student = new UserAccount();
    student.setUsername("student");
    student.setPasswordHash(hasher.hash("student"));
    student.setRole(Role.STUDENT);
    student.setStudentId(101L);
    student.setFullName("Ján Hrivnák");
    student.setStudyProgram("Informatika");
    student.setSemester(3);
    users.save(student);

    UserAccount student2 = new UserAccount();
    student2.setUsername("studentka");
    student2.setPasswordHash(hasher.hash("studentka"));
    student2.setRole(Role.STUDENT);
    student2.setStudentId(102L);
    student2.setFullName("Petra Bieliková");
    student2.setStudyProgram("Informatika");
    student2.setSemester(2);
    users.save(student2);

    UserAccount student3 = new UserAccount();
    student3.setUsername("student2");
    student3.setPasswordHash(hasher.hash("student2"));
    student3.setRole(Role.STUDENT);
    student3.setStudentId(103L);
    student3.setFullName("Martin Kováč");
    student3.setStudyProgram("Informatika");
    student3.setSemester(4);
    users.save(student3);

    UserAccount teacher = new UserAccount();
    teacher.setUsername("teacher");
    teacher.setPasswordHash(hasher.hash("teacher"));
    teacher.setRole(Role.TEACHER);
    teacher.setTeacherId(2L);
    teacher.setFullName("Prof. Ing. Mária Nováková");
    users.save(teacher);

    UserAccount admin = new UserAccount();
    admin.setUsername("admin");
    admin.setPasswordHash(hasher.hash("admin"));
    admin.setRole(Role.ADMIN);
    admin.setFullName("Systémový administrátor");
    users.save(admin);

    Subject programming = new Subject();
    programming.setId(database.nextSubjectId());
    programming.setCode("INF-101");
    programming.setName("Programovanie 1");
    programming.setTeacherId(teacher.getId());
    database.getSubjects().add(programming);

    Subject algorithms = new Subject();
    algorithms.setId(database.nextSubjectId());
    algorithms.setCode("INF-201");
    algorithms.setName("Algoritmy a dátové štruktúry");
    algorithms.setTeacherId(teacher.getId());
    database.getSubjects().add(algorithms);

    Subject mathematics = new Subject();
    mathematics.setId(database.nextSubjectId());
    mathematics.setCode("MAT-110");
    mathematics.setName("Diskrétna matematika");
    mathematics.setTeacherId(teacher.getId());
    database.getSubjects().add(mathematics);

    SubjectEnrollment enrollment = new SubjectEnrollment();
    enrollment.setId(database.nextEnrollmentId());
    enrollment.setSubjectId(programming.getId());
    enrollment.setStudentId(student.getId());
    database.getEnrollments().add(enrollment);

    SubjectEnrollment enrollment2 = new SubjectEnrollment();
    enrollment2.setId(database.nextEnrollmentId());
    enrollment2.setSubjectId(programming.getId());
    enrollment2.setStudentId(student2.getId());
    database.getEnrollments().add(enrollment2);

    SubjectEnrollment enrollment3 = new SubjectEnrollment();
    enrollment3.setId(database.nextEnrollmentId());
    enrollment3.setSubjectId(algorithms.getId());
    enrollment3.setStudentId(student.getId());
    database.getEnrollments().add(enrollment3);

    SubjectEnrollment enrollment4 = new SubjectEnrollment();
    enrollment4.setId(database.nextEnrollmentId());
    enrollment4.setSubjectId(algorithms.getId());
    enrollment4.setStudentId(student3.getId());
    database.getEnrollments().add(enrollment4);

    SubjectEnrollment enrollment5 = new SubjectEnrollment();
    enrollment5.setId(database.nextEnrollmentId());
    enrollment5.setSubjectId(mathematics.getId());
    enrollment5.setStudentId(student2.getId());
    database.getEnrollments().add(enrollment5);

    Grade grade = new Grade();
    grade.setId(database.nextGradeId());
    grade.setSubjectId(programming.getId());
    grade.setStudentId(student.getId());
    grade.setTeacherId(teacher.getId());
    grade.setValue(1);
    grade.setDescription("Ústna odpoveď");
    grade.setAssignedAt(Instant.now());
    database.getGrades().add(grade);

    Grade grade2 = new Grade();
    grade2.setId(database.nextGradeId());
    grade2.setSubjectId(programming.getId());
    grade2.setStudentId(student2.getId());
    grade2.setTeacherId(teacher.getId());
    grade2.setValue(2);
    grade2.setDescription("Projekt 1");
    grade2.setAssignedAt(Instant.now().minusSeconds(86_400));
    database.getGrades().add(grade2);

    Grade grade3 = new Grade();
    grade3.setId(database.nextGradeId());
    grade3.setSubjectId(algorithms.getId());
    grade3.setStudentId(student.getId());
    grade3.setTeacherId(teacher.getId());
    grade3.setValue(1);
    grade3.setDescription("Skúška");
    grade3.setAssignedAt(Instant.now().minusSeconds(172_800));
    database.getGrades().add(grade3);

    Grade grade4 = new Grade();
    grade4.setId(database.nextGradeId());
    grade4.setSubjectId(mathematics.getId());
    grade4.setStudentId(student2.getId());
    grade4.setTeacherId(teacher.getId());
    grade4.setValue(3);
    grade4.setDescription("Písomka");
    grade4.setAssignedAt(Instant.now().minusSeconds(259_200));
    database.getGrades().add(grade4);

    database.ensureSequences();
    database.save();
  }
}
