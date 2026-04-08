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

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;

    public AuthService(AuthenticationManager authenticationManager, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
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

    public CurrentUserResponse register(RegisterRequest request) {
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

        return mapToCurrentUser(user, null);
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
