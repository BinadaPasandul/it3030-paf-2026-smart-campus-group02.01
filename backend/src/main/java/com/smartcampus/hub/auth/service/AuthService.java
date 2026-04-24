package com.smartcampus.hub.auth.service;

import com.smartcampus.hub.auth.dto.CurrentUserResponse;
import com.smartcampus.hub.auth.dto.LoginRequest;
import com.smartcampus.hub.auth.dto.RegisterRequest;
import com.smartcampus.hub.user.dto.CompleteProfileRequest;
import com.smartcampus.hub.user.entity.Role;
import com.smartcampus.hub.user.entity.User;
import com.smartcampus.hub.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final EmailService emailService;

    public AuthService(AuthenticationManager authenticationManager,
                       UserService userService,
                       EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.emailService = emailService;
    }

    public CurrentUserResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

        return getCurrentUser(authentication);
    }

    public Map<String, String> register(RegisterRequest request) {
        User user = userService.createLocalUser(
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
                Role.USER,
                true
        );

        // Generate verification code and send email
        String code = generateVerificationCode();
        user.setVerificationCode(code);
        user.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(15));
        user.setEmailVerified(false);
        userService.saveUser(user);

        emailService.sendVerificationEmail(user.getEmail(), code, user.getFullName());

        return Map.of(
                "message", "Registration successful. Please check your email for a verification code.",
                "email", user.getEmail()
        );
    }

    public Map<String, String> verifyEmail(String email, String code) {
        User user = userService.findUserByEmail(email);

        if (user.isEmailVerified()) {
            return Map.of("message", "Email is already verified. You can log in.");
        }

        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code)) {
            throw new IllegalArgumentException("Invalid verification code.");
        }

        if (user.getVerificationCodeExpiry() != null
                && user.getVerificationCodeExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code has expired. Please request a new one.");
        }

        user.setEmailVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiry(null);
        userService.saveUser(user);

        return Map.of("message", "Email verified successfully. You can now log in.");
    }

    public Map<String, String> resendVerificationCode(String email) {
        User user = userService.findUserByEmail(email);

        if (user.isEmailVerified()) {
            return Map.of("message", "Email is already verified.");
        }

        String code = generateVerificationCode();
        user.setVerificationCode(code);
        user.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(15));
        userService.saveUser(user);

        emailService.sendVerificationEmail(user.getEmail(), code, user.getFullName());

        return Map.of("message", "A new verification code has been sent to your email.");
    }

    public CurrentUserResponse completeProfile(Authentication authentication, CompleteProfileRequest request) {
        String email = extractEmail(authentication);
        User user = userService.updateOwnProfile(email, request);
        return mapToCurrentUser(user, extractPicture(authentication));
    }

    public CurrentUserResponse getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationCredentialsNotFoundException("User is not authenticated");
        }

        String email = extractEmail(authentication);
        User user = userService.findUserByEmail(email);
        return mapToCurrentUser(user, extractPicture(authentication));
    }

    public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        new SecurityContextLogoutHandler().logout(request, response, authentication);
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000); // 6-digit code
        return String.valueOf(code);
    }

    private CurrentUserResponse mapToCurrentUser(User user, String picture) {
        return new CurrentUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                user.getProvider(),
                picture,
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

    private String extractEmail(Authentication authentication) {
        Object principal = authentication.getPrincipal();

        if (principal instanceof OAuth2User oauth2User) {
            return oauth2User.getAttribute("email");
        }

        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }

        return authentication.getName();
    }

    private String extractPicture(Authentication authentication) {
        Object principal = authentication.getPrincipal();

        if (principal instanceof OAuth2User oauth2User) {
            return oauth2User.getAttribute("picture");
        }

        return null;
    }
}
