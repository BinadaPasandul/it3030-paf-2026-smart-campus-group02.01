package com.smartcampus.hub.user.service;

import com.smartcampus.hub.exception.DuplicateEntityException;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.notification.service.NotificationService;
import com.smartcampus.hub.user.dto.CompleteProfileRequest;
import com.smartcampus.hub.user.dto.CreateUserRequest;
import com.smartcampus.hub.user.dto.UpdateUserRoleRequest;
import com.smartcampus.hub.user.dto.UserResponse;
import com.smartcampus.hub.user.entity.Role;
import com.smartcampus.hub.user.entity.User;
import com.smartcampus.hub.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    // @Lazy prevents a circular dependency: NotificationService → UserRepository ← UserService
    private NotificationService notificationService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Autowired
    public void setNotificationService(@Lazy NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public UserResponse createUser(CreateUserRequest request) {
        User savedUser = createLocalUser(
                request.getFullName(),
                request.getEmail(),
                request.getPassword(),
                request.getPhoneNumber(),
                request.getStudentId(),
                request.getDateOfBirth(),
                request.getFaculty(),
                request.getDepartment(),
                request.getAcademicYear(),
                request.getSemester(),
                request.getRole(),
                true
        );
        return mapToResponse(savedUser);
    }

    public User createLocalUser(String fullName,
                                String email,
                                String rawPassword,
                                String phoneNumber,
                                String studentId,
                                LocalDate dateOfBirth,
                                String faculty,
                                String department,
                                String academicYear,
                                String semester,
                                Role role,
                                boolean profileCompleted) {
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEntityException("User with this email already exists");
        }

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setActive(true);
        user.setProvider("LOCAL");
        applyProfileDetails(
                user,
                fullName,
                phoneNumber,
                studentId,
                dateOfBirth,
                faculty,
                department,
                academicYear,
                semester,
                profileCompleted
        );

        return userRepository.save(user);
    }

    public User updateOwnProfile(String email, CompleteProfileRequest request) {
        User user = findUserByEmail(email);
        applyProfileDetails(
                user,
                request.getFullName(),
                request.getPhoneNumber(),
                request.getStudentId(),
                request.getDateOfBirth(),
                request.getFaculty(),
                request.getDepartment(),
                request.getAcademicYear(),
                request.getSemester(),
                true
        );
        return userRepository.save(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public UserResponse getUserById(@NonNull Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToResponse(user);
    }

    public UserResponse getUserByEmail(String email) {
        return mapToResponse(findUserByEmail(email));
    }

    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public UserResponse updateUserRole(@NonNull Long id, UpdateUserRoleRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        Role oldRole = user.getRole();
        user.setRole(request.getRole());
        User updatedUser = userRepository.save(user);

        // Notify the user only if the role actually changed
        if (oldRole != request.getRole()) {
            notificationService.sendRoleChangedNotification(
                    updatedUser.getId(),
                    oldRole.name(),
                    request.getRole().name()
            );
        }

        return mapToResponse(updatedUser);
    }

    public void deactivateUser(@NonNull Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setActive(false);
        userRepository.save(user);
    }

    public void populateGoogleUser(User user, String fullName, String provider, String providerId) {
        if (user.getFullName() == null || user.getFullName().isBlank()) {
            user.setFullName(fullName);
        }

        if (providerId != null && !providerId.isBlank()) {
            user.setProviderId(providerId);
        }

        if (user.getProvider() == null || user.getProvider().isBlank() || "GOOGLE".equalsIgnoreCase(user.getProvider())) {
            user.setProvider(provider);
        }

        user.setProfileCompleted(hasCompleteProfileDetails(user));
    }

    private UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                user.getProvider(),
                user.getPhoneNumber(),
                user.getStudentId(),
                user.getDateOfBirth(),
                user.getFaculty(),
                user.getDepartment(),
                user.getAcademicYear(),
                user.getSemester(),
                user.isProfileCompleted(),
                user.getCreatedAt()
        );
    }

    private void applyProfileDetails(User user,
                                     String fullName,
                                     String phoneNumber,
                                     String studentId,
                                     LocalDate dateOfBirth,
                                     String faculty,
                                     String department,
                                     String academicYear,
                                     String semester,
                                     boolean profileCompleted) {
        user.setFullName(fullName);
        user.setPhoneNumber(phoneNumber);
        user.setStudentId(studentId);
        user.setDateOfBirth(dateOfBirth);
        user.setFaculty(faculty);
        user.setDepartment(department);
        user.setAcademicYear(academicYear);
        user.setSemester(semester);
        user.setProfileCompleted(profileCompleted);
    }

    private boolean hasCompleteProfileDetails(User user) {
        return hasText(user.getFullName())
                && hasText(user.getPhoneNumber())
                && hasText(user.getStudentId())
                && user.getDateOfBirth() != null
                && hasText(user.getFaculty())
                && hasText(user.getDepartment())
                && hasText(user.getAcademicYear())
                && hasText(user.getSemester());
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
