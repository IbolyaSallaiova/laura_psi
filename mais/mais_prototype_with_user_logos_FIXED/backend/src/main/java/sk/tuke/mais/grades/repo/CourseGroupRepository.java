package sk.tuke.mais.grades.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.tuke.mais.grades.model.CourseGroup;

import java.util.Optional;

public interface CourseGroupRepository extends JpaRepository<CourseGroup, Long> {
    Optional<CourseGroup> findByCode(String code);
}
