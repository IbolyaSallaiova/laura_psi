package sk.tuke.mais.grades.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.tuke.mais.grades.model.Enrollment;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByCourseGroup_Id(Long courseGroupId);
    List<Enrollment> findByStudent_Id(Long studentId);
    Optional<Enrollment> findByCourseGroup_IdAndStudent_Id(Long courseGroupId, Long studentId);
}
