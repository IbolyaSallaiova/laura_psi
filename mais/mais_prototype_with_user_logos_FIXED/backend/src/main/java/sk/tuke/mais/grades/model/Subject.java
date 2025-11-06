package sk.tuke.mais.grades.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "subjects")
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @Column(name = "max_zapocet")
    private Integer maxZapocet;

    @Column(name = "max_zadanie1")
    private Integer maxZadanie1;

    @Column(name = "max_skuska")
    private Integer maxSkuska;

    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourseGroup> groups = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Teacher getTeacher() {
        return teacher;
    }

    public void setTeacher(Teacher teacher) {
        this.teacher = teacher;
    }

    public Integer getMaxZapocet() {
        return maxZapocet;
    }

    public void setMaxZapocet(Integer maxZapocet) {
        this.maxZapocet = maxZapocet;
    }

    public Integer getMaxZadanie1() {
        return maxZadanie1;
    }

    public void setMaxZadanie1(Integer maxZadanie1) {
        this.maxZadanie1 = maxZadanie1;
    }

    public Integer getMaxSkuska() {
        return maxSkuska;
    }

    public void setMaxSkuska(Integer maxSkuska) {
        this.maxSkuska = maxSkuska;
    }

    public List<CourseGroup> getGroups() {
        return groups;
    }
}
