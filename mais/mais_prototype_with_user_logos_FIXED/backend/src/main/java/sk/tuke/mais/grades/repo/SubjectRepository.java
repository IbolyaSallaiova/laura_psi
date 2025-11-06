package sk.tuke.mais.grades.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.tuke.mais.grades.model.Subject;

import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByTeacher_Id(Long teacherId);
    Optional<Subject> findByCode(String code);
}
