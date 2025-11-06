package sk.tuke.mais.data;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import sk.tuke.mais.auth.UserAccount;
import sk.tuke.mais.grades.Grade;
import sk.tuke.mais.grades.Subject;
import sk.tuke.mais.grades.SubjectEnrollment;
import sk.tuke.mais.util.IdGenerator;

public class Database implements Serializable {
  private final List<UserAccount> users = new ArrayList<>();
  private final List<Subject> subjects = new ArrayList<>();
  private final List<SubjectEnrollment> enrollments = new ArrayList<>();
  private final List<Grade> grades = new ArrayList<>();

  private IdGenerator userSeq = new IdGenerator(0);
  private IdGenerator subjectSeq = new IdGenerator(0);
  private IdGenerator enrollmentSeq = new IdGenerator(0);
  private IdGenerator gradeSeq = new IdGenerator(0);

  private transient Path file;

  public static Database open(Path file) {
    if (Files.exists(file)) {
      try (ObjectInputStream in = new ObjectInputStream(new FileInputStream(file.toFile()))) {
        Database db = (Database) in.readObject();
        db.file = file;
        return db;
      } catch (Exception e) {
        throw new IllegalStateException("Unable to read database", e);
      }
    }
    Database db = new Database();
    db.file = file;
    return db;
  }

  public synchronized void save() {
    if (file == null) {
      throw new IllegalStateException("Database file not configured");
    }
    try {
      Path parent = file.getParent();
      if (parent != null) {
        Files.createDirectories(parent);
      }
    } catch (IOException e) {
      throw new IllegalStateException("Unable to create database directory", e);
    }
    try (ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream(file.toFile()))) {
      out.writeObject(this);
    } catch (IOException e) {
      throw new IllegalStateException("Unable to save database", e);
    }
  }

  public synchronized List<UserAccount> getUsers() {
    return users;
  }

  public synchronized List<Subject> getSubjects() {
    return subjects;
  }

  public synchronized List<SubjectEnrollment> getEnrollments() {
    return enrollments;
  }

  public synchronized List<Grade> getGrades() {
    return grades;
  }

  public synchronized long nextUserId() {
    return userSeq.next();
  }

  public synchronized long nextSubjectId() {
    return subjectSeq.next();
  }

  public synchronized long nextEnrollmentId() {
    return enrollmentSeq.next();
  }

  public synchronized long nextGradeId() {
    return gradeSeq.next();
  }

  public synchronized void ensureSequences() {
    userSeq = new IdGenerator(users.stream().mapToLong(UserAccount::getId).max().orElse(0L));
    subjectSeq = new IdGenerator(subjects.stream().mapToLong(Subject::getId).max().orElse(0L));
    enrollmentSeq = new IdGenerator(enrollments.stream().mapToLong(SubjectEnrollment::getId).max().orElse(0L));
    gradeSeq = new IdGenerator(grades.stream().mapToLong(Grade::getId).max().orElse(0L));
  }
}
