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

    Subject subject = new Subject();
    subject.setId(database.nextSubjectId());
    subject.setCode("INF-101");
    subject.setName("Programovanie 1");
    subject.setTeacherId(teacher.getId());
    database.getSubjects().add(subject);

    SubjectEnrollment enrollment = new SubjectEnrollment();
    enrollment.setId(database.nextEnrollmentId());
    enrollment.setSubjectId(subject.getId());
    enrollment.setStudentId(student.getId());
    database.getEnrollments().add(enrollment);

    Grade grade = new Grade();
    grade.setId(database.nextGradeId());
    grade.setSubjectId(subject.getId());
    grade.setStudentId(student.getId());
    grade.setTeacherId(teacher.getId());
    grade.setValue(1);
    grade.setDescription("Ústna odpoveď");
    grade.setAssignedAt(Instant.now());
    database.getGrades().add(grade);

    database.ensureSequences();
    database.save();
  }
}
