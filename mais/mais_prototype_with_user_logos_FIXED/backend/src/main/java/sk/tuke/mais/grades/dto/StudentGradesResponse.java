package sk.tuke.mais.grades.dto;

import java.util.List;

public record StudentGradesResponse(List<SemesterDto> semesters) {
    public record SemesterDto(String label, List<SubjectGradeDto> subjects) {}

    public record SubjectGradeDto(
            String code,
            String name,
            Double percent,
            String grade,
            Integer zapocet,
            Integer zadanie1,
            Integer skuska
    ) {}
}
