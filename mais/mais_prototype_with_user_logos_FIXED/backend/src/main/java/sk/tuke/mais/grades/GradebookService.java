package sk.tuke.mais.grades;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import sk.tuke.mais.auth.Role;
import sk.tuke.mais.auth.UserAccount;
import sk.tuke.mais.auth.UserAccountRepository;
import sk.tuke.mais.data.Database;

public class GradebookService {
  private final Database database;
  private final UserAccountRepository users;

  public GradebookService(Database database, UserAccountRepository users) {
    this.database = database;
    this.users = users;
  }

  public synchronized List<Subject> subjectsForTeacher(UserAccount teacher) {
    return database.getSubjects().stream()
        .filter(subject -> subject.getTeacherId() == teacher.getId())
        .toList();
  }

  public synchronized List<Subject> subjectsForStudent(UserAccount student) {
    List<Subject> result = new ArrayList<>();
    for (SubjectEnrollment enrollment : database.getEnrollments()) {
      if (enrollment.getStudentId() == student.getId()) {
        findSubject(enrollment.getSubjectId()).ifPresent(subject -> {
          if (result.stream().noneMatch(existing -> existing.getId() == subject.getId())) {
            result.add(subject);
          }
        });
      }
    }
    return result;
  }

  public synchronized List<Subject> allSubjects() {
    return new ArrayList<>(database.getSubjects());
  }

  public synchronized Subject requireSubject(long subjectId) {
    return findSubject(subjectId)
        .orElseThrow(() -> new IllegalArgumentException("Predmet neexistuje"));
  }

  public synchronized Subject requireSubjectOwnedByTeacher(long subjectId, UserAccount teacher) {
    Subject subject = requireSubject(subjectId);
    if (subject.getTeacherId() != teacher.getId()) {
      throw new IllegalArgumentException("Predmet nepatrí učiteľovi");
    }
    return subject;
  }

  public synchronized SubjectEnrollment enrollStudent(long subjectId, long studentId, UserAccount teacher) {
    Subject subject = requireSubjectOwnedByTeacher(subjectId, teacher);
    UserAccount student = users.findById(studentId)
        .orElseThrow(() -> new IllegalArgumentException("Študent neexistuje"));
    if (student.getRole() != Role.STUDENT) {
      throw new IllegalArgumentException("Používateľ nie je študent");
    }
    for (SubjectEnrollment existing : database.getEnrollments()) {
      if (existing.getSubjectId() == subject.getId() && existing.getStudentId() == student.getId()) {
        return existing;
      }
    }
    SubjectEnrollment enrollment = new SubjectEnrollment();
    enrollment.setId(database.nextEnrollmentId());
    enrollment.setSubjectId(subject.getId());
    enrollment.setStudentId(student.getId());
    database.getEnrollments().add(enrollment);
    database.save();
    return enrollment;
  }

  public synchronized Grade createGrade(long subjectId, long studentId, int value, String description, UserAccount teacher) {
    if (value < 1 || value > 5) {
      throw new IllegalArgumentException("Známka musí byť medzi 1 a 5");
    }
    Subject subject = requireSubjectOwnedByTeacher(subjectId, teacher);
    UserAccount student = users.findById(studentId)
        .orElseThrow(() -> new IllegalArgumentException("Študent neexistuje"));
    if (!isStudentEnrolled(subject.getId(), student.getId())) {
      throw new IllegalArgumentException("Študent nie je zapísaný na predmet");
    }
    Grade grade = new Grade();
    grade.setId(database.nextGradeId());
    grade.setSubjectId(subject.getId());
    grade.setStudentId(student.getId());
    grade.setTeacherId(teacher.getId());
    grade.setValue(value);
    grade.setDescription(description);
    grade.setAssignedAt(Instant.now());
    database.getGrades().add(grade);
    database.save();
    return grade;
  }

  public synchronized List<Grade> gradesForSubjectAndUser(long subjectId, UserAccount requester) {
    Subject subject = requireSubject(subjectId);
    if (requester.getRole() == Role.TEACHER) {
      if (subject.getTeacherId() != requester.getId()) {
        throw new SecurityException("Učiteľ nemá prístup k predmetu");
      }
      return filterGrades(grade -> grade.getSubjectId() == subject.getId());
    }
    if (requester.getRole() == Role.STUDENT) {
      if (!isStudentEnrolled(subject.getId(), requester.getId())) {
        throw new SecurityException("Študent nie je zapísaný na predmet");
      }
      return filterGrades(grade -> grade.getSubjectId() == subject.getId() && grade.getStudentId() == requester.getId());
    }
    return filterGrades(grade -> grade.getSubjectId() == subject.getId());
  }

  public synchronized List<Grade> gradesForStudent(UserAccount student) {
    if (student.getRole() != Role.STUDENT) {
      throw new IllegalArgumentException("Používateľ nie je študent");
    }
    return filterGrades(grade -> grade.getStudentId() == student.getId());
  }

  public synchronized List<SubjectEnrollment> enrollmentsForSubject(Subject subject) {
    return database.getEnrollments().stream()
        .filter(enrollment -> enrollment.getSubjectId() == subject.getId())
        .toList();
  }

  public synchronized Optional<Subject> findSubject(long subjectId) {
    return database.getSubjects().stream()
        .filter(subject -> subject.getId() == subjectId)
        .findFirst();
  }

  public synchronized boolean isStudentEnrolled(long subjectId, long studentId) {
    return database.getEnrollments().stream()
        .anyMatch(enrollment -> enrollment.getSubjectId() == subjectId && enrollment.getStudentId() == studentId);
  }

  private synchronized List<Grade> filterGrades(java.util.function.Predicate<Grade> predicate) {
    return database.getGrades().stream()
        .filter(predicate)
        .sorted(Comparator.comparing(Grade::getAssignedAt).reversed())
        .toList();
  }
}
