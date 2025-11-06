package sk.tuke.mais.grades.model;

import jakarta.persistence.*;

@Entity
@Table(name = "enrollments", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"course_group_id", "student_id"})
})
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_group_id", nullable = false)
    private CourseGroup courseGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    private Integer zapocetPoints;

    private Integer zadanie1Points;

    private Integer skuskaPoints;

    @Column(length = 4)
    private String finalOverride;

    public Long getId() {
        return id;
    }

    public CourseGroup getCourseGroup() {
        return courseGroup;
    }

    public void setCourseGroup(CourseGroup courseGroup) {
        this.courseGroup = courseGroup;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public Integer getZapocetPoints() {
        return zapocetPoints;
    }

    public void setZapocetPoints(Integer zapocetPoints) {
        this.zapocetPoints = zapocetPoints;
    }

    public Integer getZadanie1Points() {
        return zadanie1Points;
    }

    public void setZadanie1Points(Integer zadanie1Points) {
        this.zadanie1Points = zadanie1Points;
    }

    public Integer getSkuskaPoints() {
        return skuskaPoints;
    }

    public void setSkuskaPoints(Integer skuskaPoints) {
        this.skuskaPoints = skuskaPoints;
    }

    public String getFinalOverride() {
        return finalOverride;
    }

    public void setFinalOverride(String finalOverride) {
        this.finalOverride = finalOverride;
    }
}
