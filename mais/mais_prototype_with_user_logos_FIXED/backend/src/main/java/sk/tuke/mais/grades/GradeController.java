package sk.tuke.mais.grades;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import sk.tuke.mais.auth.UserAccount;
import sk.tuke.mais.grades.dto.SaveGradesRequest;
import sk.tuke.mais.grades.dto.StudentGradesResponse;
import sk.tuke.mais.grades.dto.TeacherSubjectDto;
import sk.tuke.mais.grades.model.CourseGroup;
import sk.tuke.mais.grades.model.Enrollment;
import sk.tuke.mais.grades.model.Student;
import sk.tuke.mais.grades.model.Subject;
import sk.tuke.mais.grades.repo.CourseGroupRepository;
import sk.tuke.mais.grades.repo.EnrollmentRepository;
import sk.tuke.mais.grades.repo.StudentRepository;
import sk.tuke.mais.grades.repo.SubjectRepository;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class GradeController {
    private final CurrentUserService currentUserService;
    private final SubjectRepository subjectRepository;
    private final CourseGroupRepository courseGroupRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;

    public GradeController(CurrentUserService currentUserService,
                           SubjectRepository subjectRepository,
                           CourseGroupRepository courseGroupRepository,
                           EnrollmentRepository enrollmentRepository,
                           StudentRepository studentRepository) {
        this.currentUserService = currentUserService;
        this.subjectRepository = subjectRepository;
        this.courseGroupRepository = courseGroupRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.studentRepository = studentRepository;
    }

    @GetMapping("/teacher/subjects")
    @Transactional(readOnly = true)
    public List<TeacherSubjectDto> teacherSubjects() {
        UserAccount teacherAccount = currentUserService.requireTeacher();
        List<Subject> subjects = subjectRepository.findByTeacher_Id(teacherAccount.getTeacherId());
        return subjects.stream().map(this::mapSubject).toList();
    }

    @PostMapping("/teacher/subjects/{subjectId}/groups/{groupId}/grades")
    @Transactional
    public TeacherSubjectDto saveGrades(@PathVariable Long subjectId,
                                        @PathVariable Long groupId,
                                        @RequestBody SaveGradesRequest request) {
        UserAccount teacher = currentUserService.requireTeacher();
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Predmet neexistuje"));
        if (subject.getTeacher() == null || !Objects.equals(subject.getTeacher().getId(), teacher.getTeacherId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Nemáte oprávnenie upravovať tento predmet");
        }
        CourseGroup group = courseGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Skupina neexistuje"));
        if (!Objects.equals(group.getSubject().getId(), subject.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Skupina nepatrí pod daný predmet");
        }

        TeacherSubjectDto.MaxPointsDto max = request.maxPoints();
        if (max != null) {
            subject.setMaxZapocet(sanitizeMax(max.zapocet()));
            subject.setMaxZadanie1(sanitizeMax(max.zadanie1()));
            subject.setMaxSkuska(sanitizeMax(max.skuska()));
        }

        Map<Long, Enrollment> enrollmentMap = enrollmentRepository.findByCourseGroup_Id(groupId).stream()
                .collect(Collectors.toMap(e -> e.getStudent().getId(), e -> e));

        List<SaveGradesRequest.StudentGradeInput> gradeInputs = Optional.ofNullable(request.grades()).orElse(List.of());
        for (SaveGradesRequest.StudentGradeInput input : gradeInputs) {
            Enrollment enrollment = enrollmentMap.get(input.studentId());
            if (enrollment == null) {
                continue;
            }
            enrollment.setZapocetPoints(clampPoints(input.zapocet(), subject.getMaxZapocet()));
            enrollment.setZadanie1Points(clampPoints(input.zadanie1(), subject.getMaxZadanie1()));
            enrollment.setSkuskaPoints(clampPoints(input.skuska(), subject.getMaxSkuska()));
            enrollment.setFinalOverride(sanitizeGrade(input.finalOverride()));
        }

        subjectRepository.save(subject);
        enrollmentRepository.saveAll(enrollmentMap.values());
        return mapSubject(subject);
    }

    @GetMapping("/student/grades")
    @Transactional(readOnly = true)
    public StudentGradesResponse studentGrades() {
        UserAccount studentAccount = currentUserService.requireStudent();
        Student student = studentRepository.findById(studentAccount.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Študent neexistuje"));
        List<Enrollment> enrollments = enrollmentRepository.findByStudent_Id(student.getId());

        Map<String, List<StudentGradesResponse.SubjectGradeDto>> bySemester = new LinkedHashMap<>();
        for (Enrollment enrollment : enrollments) {
            CourseGroup group = enrollment.getCourseGroup();
            Subject subject = group.getSubject();
            double percent = computePercent(enrollment, subject);
            String grade = resolveGrade(enrollment, percent);
            StudentGradesResponse.SubjectGradeDto dto = new StudentGradesResponse.SubjectGradeDto(
                    subject.getCode(),
                    subject.getName(),
                    percent,
                    grade,
                    enrollment.getZapocetPoints(),
                    enrollment.getZadanie1Points(),
                    enrollment.getSkuskaPoints()
            );
            String semester = Optional.ofNullable(group.getSemester()).orElse("Nezaradené");
            bySemester.computeIfAbsent(semester, k -> new ArrayList<>()).add(dto);
        }

        List<StudentGradesResponse.SemesterDto> semesters = bySemester.entrySet().stream()
                .map(e -> new StudentGradesResponse.SemesterDto(e.getKey(), e.getValue()))
                .toList();

        return new StudentGradesResponse(semesters);
    }

    private TeacherSubjectDto mapSubject(Subject subject) {
        TeacherSubjectDto.MaxPointsDto maxPointsDto = new TeacherSubjectDto.MaxPointsDto(
                subject.getMaxZapocet(),
                subject.getMaxZadanie1(),
                subject.getMaxSkuska()
        );
        List<TeacherSubjectDto.GroupDto> groups = subject.getGroups().stream()
                .map(group -> new TeacherSubjectDto.GroupDto(
                        group.getId(),
                        group.getCode(),
                        group.getLabel(),
                        group.getRoom(),
                        group.getSemester(),
                        group.getEnrollments().stream()
                                .sorted(Comparator.comparing(e -> e.getStudent().getFullName()))
                                .map(this::mapEnrollment)
                                .toList()
                ))
                .collect(Collectors.toList());
        groups.sort(Comparator.comparing(TeacherSubjectDto.GroupDto::label));
        return new TeacherSubjectDto(
                subject.getId(),
                subject.getCode(),
                subject.getName(),
                maxPointsDto,
                groups
        );
    }

    private TeacherSubjectDto.StudentGradeDto mapEnrollment(Enrollment enrollment) {
        TeacherSubjectDto.GradeValuesDto valuesDto = new TeacherSubjectDto.GradeValuesDto(
                enrollment.getZapocetPoints(),
                enrollment.getZadanie1Points(),
                enrollment.getSkuskaPoints(),
                enrollment.getFinalOverride()
        );
        Student student = enrollment.getStudent();
        return new TeacherSubjectDto.StudentGradeDto(student.getId(), student.getFullName(), valuesDto);
    }

    private Integer sanitizeMax(Integer value) {
        if (value == null) {
            return 0;
        }
        return Math.max(0, value);
    }

    private Integer clampPoints(Integer value, Integer max) {
        if (value == null) {
            return null;
        }
        int sanitized = Math.max(0, value);
        int safeMax = max == null ? sanitized : Math.max(0, max);
        return Math.min(sanitized, safeMax);
    }

    private String sanitizeGrade(String grade) {
        if (grade == null || grade.isBlank()) {
            return null;
        }
        String upper = grade.trim().toUpperCase(Locale.ROOT);
        return switch (upper) {
            case "A", "B", "C", "D", "E", "FX" -> upper;
            default -> null;
        };
    }

    private double computePercent(Enrollment enrollment, Subject subject) {
        int zapocet = Optional.ofNullable(enrollment.getZapocetPoints()).orElse(0);
        int zadanie1 = Optional.ofNullable(enrollment.getZadanie1Points()).orElse(0);
        int skuska = Optional.ofNullable(enrollment.getSkuskaPoints()).orElse(0);
        int max = Optional.ofNullable(subject.getMaxZapocet()).orElse(0)
                + Optional.ofNullable(subject.getMaxZadanie1()).orElse(0)
                + Optional.ofNullable(subject.getMaxSkuska()).orElse(0);
        if (max <= 0) {
            return 0;
        }
        return ((double) (zapocet + zadanie1 + skuska) / max) * 100.0;
    }

    private String resolveGrade(Enrollment enrollment, double percent) {
        if (enrollment.getFinalOverride() != null && !enrollment.getFinalOverride().isBlank()) {
            return enrollment.getFinalOverride();
        }
        int rounded = (int) Math.round(percent);
        if (rounded >= 91) return "A";
        if (rounded >= 81) return "B";
        if (rounded >= 73) return "C";
        if (rounded >= 66) return "D";
        if (rounded >= 60) return "E";
        return "FX";
    }
}
