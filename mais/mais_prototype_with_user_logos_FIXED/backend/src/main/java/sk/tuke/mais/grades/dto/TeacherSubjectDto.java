package sk.tuke.mais.grades.dto;

import java.util.List;

public record TeacherSubjectDto(
        Long id,
        String code,
        String name,
        MaxPointsDto maxPoints,
        List<GroupDto> groups
) {
    public record MaxPointsDto(Integer zapocet, Integer zadanie1, Integer skuska) {}

    public record GroupDto(
            Long id,
            String code,
            String label,
            String room,
            String semester,
            List<StudentGradeDto> students
    ) {}

    public record StudentGradeDto(
            Long id,
            String fullName,
            GradeValuesDto grades
    ) {}

    public record GradeValuesDto(Integer zapocet, Integer zadanie1, Integer skuska, String finalOverride) {}
}
