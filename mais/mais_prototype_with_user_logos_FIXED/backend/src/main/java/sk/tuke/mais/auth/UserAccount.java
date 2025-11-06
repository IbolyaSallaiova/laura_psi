package sk.tuke.mais.auth;
import jakarta.persistence.*;
@Entity @Table(name="user_accounts")
public class UserAccount {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(unique=true, nullable=false) private String username;
  @Column(nullable=false) private String passwordHash;
  @Enumerated(EnumType.STRING) private Role rola;
  private Long studentId; private Long teacherId;
  private String fullName; private String studyProgram; private Integer semester;
  public Long getId(){return id;} public String getUsername(){return username;} public void setUsername(String v){username=v;}
  public String getPasswordHash(){return passwordHash;} public void setPasswordHash(String v){passwordHash=v;}
  public Role getRola(){return rola;} public void setRola(Role v){rola=v;}
  public Long getStudentId(){return studentId;} public void setStudentId(Long v){studentId=v;}
  public Long getTeacherId(){return teacherId;} public void setTeacherId(Long v){teacherId=v;}
  public String getFullName(){return fullName;} public void setFullName(String v){fullName=v;}
  public String getStudyProgram(){return studyProgram;} public void setStudyProgram(String v){studyProgram=v;}
  public Integer getSemester(){return semester;} public void setSemester(Integer v){semester=v;}
}