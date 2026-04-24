package com.smartcampus.hub.config;

import com.smartcampus.hub.user.entity.Role;
import com.smartcampus.hub.user.entity.User;
import com.smartcampus.hub.user.repository.UserRepository;
import com.smartcampus.hub.user.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;

@Configuration
public class AdminSeedConfig {

    @Bean
    public CommandLineRunner seedAdminUser(UserRepository userRepository,
                                           UserService userService,
                                           @Value("${app.seed-admin.enabled:true}") boolean enabled,
                                           @Value("${app.seed-admin.full-name:System Administrator}") String fullName,
                                           @Value("${app.seed-admin.email:admin@smartcampus.com}") String email,
                                           @Value("${app.seed-admin.password:Admin@123}") String password) {
        return args -> {
            if (!enabled) {
                return;
            }

            User existingUser = userRepository.findByEmail(email).orElse(null);
            if (existingUser != null) {
                boolean changed = false;

                if (existingUser.getRole() != Role.ADMIN) {
                    existingUser.setRole(Role.ADMIN);
                    changed = true;
                }

                if (!existingUser.isProfileCompleted()) {
                    existingUser.setPhoneNumber("0700000000");
                    existingUser.setStudentId("ADMIN-0001");
                    existingUser.setDateOfBirth(LocalDate.of(1990, 1, 1));
                    existingUser.setFaculty("Administration");
                    existingUser.setDepartment("Campus Operations");
                    existingUser.setAcademicYear("Staff");
                    existingUser.setSemester("Staff");
                    existingUser.setProfileCompleted(true);
                    changed = true;
                }

                if (existingUser.getSemester() == null || existingUser.getSemester().isBlank()) {
                    existingUser.setSemester("Staff");
                    changed = true;
                }

                if (existingUser.getProvider() == null || existingUser.getProvider().isBlank()) {
                    existingUser.setProvider("LOCAL");
                    changed = true;
                }

                if (!existingUser.isEmailVerified()) {
                    existingUser.setEmailVerified(true);
                    changed = true;
                }

                if (changed) {
                    userRepository.save(existingUser);
                }
                return;
            }

            User admin = userService.createLocalUser(
                    fullName,
                    email,
                    password,
                    "0700000000",
                    "ADMIN-0001",
                    LocalDate.of(1990, 1, 1),
                    "Administration",
                    "Campus Operations",
                    "Staff",
                    "Staff",
                    Role.ADMIN,
                    true
            );
            admin.setEmailVerified(true);
            userRepository.save(admin);
        };
    }
}
