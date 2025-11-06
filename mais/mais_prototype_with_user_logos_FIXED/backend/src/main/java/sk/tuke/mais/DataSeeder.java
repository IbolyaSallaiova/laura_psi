package sk.tuke.mais;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import sk.tuke.mais.auth.Role;
import sk.tuke.mais.auth.UserAccount;
import sk.tuke.mais.auth.UserAccountRepository;
import sk.tuke.mais.grades.model.CourseGroup;
import sk.tuke.mais.grades.model.Enrollment;
import sk.tuke.mais.grades.model.Student;
import sk.tuke.mais.grades.model.Subject;
import sk.tuke.mais.grades.model.Teacher;
import sk.tuke.mais.grades.repo.CourseGroupRepository;
import sk.tuke.mais.grades.repo.EnrollmentRepository;
import sk.tuke.mais.grades.repo.StudentRepository;
import sk.tuke.mais.grades.repo.SubjectRepository;
import sk.tuke.mais.grades.repo.TeacherRepository;

@Configuration
public class DataSeeder {
    private final PasswordEncoder encoder;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final CourseGroupRepository courseGroupRepository;
    private final EnrollmentRepository enrollmentRepository;

    public DataSeeder(PasswordEncoder encoder,
                      TeacherRepository teacherRepository,
                      StudentRepository studentRepository,
                      SubjectRepository subjectRepository,
                      CourseGroupRepository courseGroupRepository,
                      EnrollmentRepository enrollmentRepository) {
        this.encoder = encoder;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.courseGroupRepository = courseGroupRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Bean
    ApplicationRunner seed(UserAccountRepository users) {
        return args -> {
            Teacher teacher = upsertTeacher(2001L, "Prof. Ing. Mária Nováková");

            Student jan = upsertStudent(101L, "Ján Hrivnák");
            Student studentB = upsertStudent(102L, "Bc. Študent B");
            Student studentC = upsertStudent(103L, "Bc. Študent C");
            Student studentD = upsertStudent(104L, "Bc. Študent D");
            Student studentE = upsertStudent(105L, "Bc. Študent E");
            Student studentF = upsertStudent(106L, "Bc. Študent F");
            Student studentG = upsertStudent(107L, "Bc. Študent G");
            Student studentH = upsertStudent(108L, "Bc. Študent H");

            Subject inf101 = upsertSubject("INF101", "Programovanie 1", teacher, 20, 30, 50);
            Subject mat101 = upsertSubject("MAT101", "Matematika 1", teacher, 20, 20, 60);
            Subject alg201 = upsertSubject("ALG201", "Algoritmy", teacher, 15, 35, 50);

            CourseGroup inf101g1 = upsertGroup(inf101, "inf101-1", "Po 08:00–09:30 (A-101)", "A-101", "2024/2025 LS");
            CourseGroup inf101g2 = upsertGroup(inf101, "inf101-2", "St 10:00–11:30 (A-102)", "A-102", "2024/2025 LS");
            CourseGroup mat101g1 = upsertGroup(mat101, "mat101-1", "Ut 09:45–11:15 (B-201)", "B-201", "2024/2025 LS");
            CourseGroup alg201g1 = upsertGroup(alg201, "alg201-1", "Št 11:30–13:00 (C-301)", "C-301", "2024/2025 ZS");

            upsertEnrollment(inf101g1, jan, 18, 25, 40, null);
            upsertEnrollment(inf101g1, studentB, 12, 22, 38, null);
            upsertEnrollment(inf101g1, studentC, 15, 28, 45, null);
            upsertEnrollment(inf101g2, studentD, null, null, null, null);
            upsertEnrollment(inf101g2, studentE, null, null, null, null);

            upsertEnrollment(mat101g1, jan, 16, 15, 48, null);
            upsertEnrollment(mat101g1, studentE, 12, 18, 44, null);

            upsertEnrollment(alg201g1, studentF, 10, 30, 35, null);
            upsertEnrollment(alg201g1, studentG, 12, 32, 40, null);
            upsertEnrollment(alg201g1, studentH, 14, 34, 42, null);

            upsertUser(users, "student", "student", Role.STUDENT, jan.getId(), null,
                    "Ján Hrivnák", "Informatika", 3);
            upsertUser(users, "teacher", "teacher", Role.TEACHER, null, teacher.getId(),
                    "Prof. Ing. Mária Nováková", null, null);
            upsertUser(users, "admin", "admin", Role.ADMIN, null, null,
                    "Systémový administrátor", null, null);
        };
    }

    private Teacher upsertTeacher(Long aisId, String fullName) {
        Teacher teacher = teacherRepository.findByAisId(aisId).orElseGet(Teacher::new);
        teacher.setAisId(aisId);
        teacher.setFullName(fullName);
        return teacherRepository.save(teacher);
    }

    private Student upsertStudent(Long aisId, String fullName) {
        Student student = studentRepository.findByAisId(aisId).orElseGet(Student::new);
        student.setAisId(aisId);
        student.setFullName(fullName);
        return studentRepository.save(student);
    }

    private Subject upsertSubject(String code, String name, Teacher teacher,
                                  Integer maxZ, Integer maxZ1, Integer maxS) {
        Subject subject = subjectRepository.findByCode(code).orElseGet(Subject::new);
        subject.setCode(code);
        subject.setName(name);
        subject.setTeacher(teacher);
        subject.setMaxZapocet(maxZ);
        subject.setMaxZadanie1(maxZ1);
        subject.setMaxSkuska(maxS);
        return subjectRepository.save(subject);
    }

    private CourseGroup upsertGroup(Subject subject, String code, String label, String room, String semester) {
        CourseGroup group = courseGroupRepository.findByCode(code).orElseGet(CourseGroup::new);
        group.setSubject(subject);
        group.setCode(code);
        group.setLabel(label);
        group.setRoom(room);
        group.setSemester(semester);
        return courseGroupRepository.save(group);
    }

    private void upsertEnrollment(CourseGroup group, Student student,
                                  Integer zapocet, Integer zadanie1, Integer skuska, String finalOverride) {
        Enrollment enrollment = enrollmentRepository
                .findByCourseGroup_IdAndStudent_Id(group.getId(), student.getId())
                .orElseGet(Enrollment::new);
        enrollment.setCourseGroup(group);
        enrollment.setStudent(student);
        enrollment.setZapocetPoints(zapocet);
        enrollment.setZadanie1Points(zadanie1);
        enrollment.setSkuskaPoints(skuska);
        enrollment.setFinalOverride(finalOverride);
        enrollmentRepository.save(enrollment);
    }

    private void upsertUser(UserAccountRepository repo,
                             String username,
                             String rawPassword,
                             Role role,
                             Long studentId,
                             Long teacherId,
                             String fullName,
                             String studyProgram,
                             Integer semester) {
        UserAccount user = repo.findByUsername(username).orElseGet(UserAccount::new);
        user.setUsername(username);
        user.setPasswordHash(encoder.encode(rawPassword));
        user.setRola(role);
        user.setStudentId(studentId);
        user.setTeacherId(teacherId);
        user.setFullName(fullName);
        user.setStudyProgram(studyProgram);
        user.setSemester(semester);
        repo.save(user);
    }
}
