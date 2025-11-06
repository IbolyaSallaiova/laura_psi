package sk.tuke.mais.grades;

import java.io.Serializable;
import java.time.Instant;

public class Grade implements Serializable {
  private long id;
  private long subjectId;
  private long studentId;
  private long teacherId;
  private int value;
  private String description;
  private Instant assignedAt;

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

  public long getTeacherId() {
    return teacherId;
  }

  public void setTeacherId(long teacherId) {
    this.teacherId = teacherId;
  }

  public int getValue() {
    return value;
  }

  public void setValue(int value) {
    this.value = value;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public Instant getAssignedAt() {
    return assignedAt;
  }

  public void setAssignedAt(Instant assignedAt) {
    this.assignedAt = assignedAt;
  }
}
