package sk.tuke.mais.grades.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.tuke.mais.grades.model.Teacher;

import java.util.Optional;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByAisId(Long aisId);
}
