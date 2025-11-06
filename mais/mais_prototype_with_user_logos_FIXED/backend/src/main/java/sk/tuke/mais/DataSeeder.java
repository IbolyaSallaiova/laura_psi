package sk.tuke.mais;
import org.springframework.boot.ApplicationRunner; import org.springframework.context.annotation.Bean; import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; import org.springframework.security.crypto.password.PasswordEncoder;
import sk.tuke.mais.auth.Role; import sk.tuke.mais.auth.UserAccount; import sk.tuke.mais.auth.UserAccountRepository;
@Configuration
public class DataSeeder {
  private final PasswordEncoder encoder; public DataSeeder(PasswordEncoder encoder){ this.encoder=encoder; }
  @Bean ApplicationRunner seed(UserAccountRepository repo){ return args -> {
    upsert(repo,"student","student",Role.STUDENT,101L,null,"Ján Hrivnák","Informatika",3);
    upsert(repo,"teacher","teacher",Role.TEACHER,null,2L,"Prof. Ing. Mária Nováková",null,null);
    upsert(repo,"admin","admin",Role.ADMIN,null,null,"Systémový administrátor",null,null);
  }; }
  private void upsert(UserAccountRepository repo,String username,String rawPass,Role role,Long studentId,Long teacherId,String fullName,String studyProgram,Integer semester){
    var user = repo.findByUsername(username).orElseGet(UserAccount::new);
    user.setUsername(username); user.setPasswordHash(new BCryptPasswordEncoder().encode(rawPass)); user.setRola(role);
    user.setStudentId(studentId); user.setTeacherId(teacherId); user.setFullName(fullName); user.setStudyProgram(studyProgram); user.setSemester(semester);
    repo.save(user);
  }
}