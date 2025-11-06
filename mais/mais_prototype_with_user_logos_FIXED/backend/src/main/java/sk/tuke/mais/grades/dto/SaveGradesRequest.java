package sk.tuke.mais.grades.dto;

import java.util.List;

public record SaveGradesRequest(
        TeacherSubjectDto.MaxPointsDto maxPoints,
        List<StudentGradeInput> grades
) {
    public record StudentGradeInput(
            Long studentId,
            Integer zapocet,
            Integer zadanie1,
            Integer skuska,
            String finalOverride
    ) {}
}
