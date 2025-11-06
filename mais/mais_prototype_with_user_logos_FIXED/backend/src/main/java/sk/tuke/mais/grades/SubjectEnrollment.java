package sk.tuke.mais.grades;

import java.io.Serializable;

public class SubjectEnrollment implements Serializable {
  private long id;
  private long subjectId;
  private long studentId;

  public long getId() {
    return id;
  }

  public void setId(long id) {
    this.id = id;
  }

  public long getSubjectId() {
    return subjectId;
  }

  public void setSubjectId(long subjectId) {
    this.subjectId = subjectId;
  }

  public long getStudentId() {
    return studentId;
  }

  public void setStudentId(long studentId) {
    this.studentId = studentId;
  }
}
