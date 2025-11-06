package sk.tuke.mais.grades.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.tuke.mais.grades.model.Student;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByAisId(Long aisId);
}
