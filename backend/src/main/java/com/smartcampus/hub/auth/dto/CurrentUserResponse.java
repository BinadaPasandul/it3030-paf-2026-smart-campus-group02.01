package com.smartcampus.hub.auth.dto;

import com.smartcampus.hub.user.entity.Role;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class CurrentUserResponse {

    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private boolean active;
    private String provider;
    private String picture;
    private String phoneNumber;
    private String studentId;
    private LocalDate dateOfBirth;
    private String faculty;
    private String department;
    private String academicYear;
    private String semester;
    private boolean profileCompleted;
    private LocalDateTime createdAt;

    public CurrentUserResponse(Long id,
                               String fullName,
                               String email,
                               Role role,
                               boolean active,
                               String provider,
                               String picture,
                               String phoneNumber,
                               String studentId,
                               LocalDate dateOfBirth,
                               String faculty,
                               String department,
                               String academicYear,
                               String semester,
                               boolean profileCompleted,
                               LocalDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.active = active;
        this.provider = provider;
        this.picture = picture;
        this.phoneNumber = phoneNumber;
        this.studentId = studentId;
        this.dateOfBirth = dateOfBirth;
        this.faculty = faculty;
        this.department = department;
        this.academicYear = academicYear;
        this.semester = semester;
        this.profileCompleted = profileCompleted;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    public boolean isActive() {
        return active;
    }

    public String getProvider() {
        return provider;
    }

    public String getPicture() {
        return picture;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getStudentId() {
        return studentId;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public String getFaculty() {
        return faculty;
    }

    public String getDepartment() {
        return department;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public String getSemester() {
        return semester;
    }

    public boolean isProfileCompleted() {
        return profileCompleted;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
