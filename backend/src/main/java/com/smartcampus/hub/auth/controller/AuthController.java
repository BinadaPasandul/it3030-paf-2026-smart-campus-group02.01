package com.smartcampus.hub.auth.controller;

import com.smartcampus.hub.auth.dto.CurrentUserResponse;
import com.smartcampus.hub.auth.dto.LoginRequest;
import com.smartcampus.hub.auth.dto.RegisterRequest;
import com.smartcampus.hub.auth.dto.ResendVerificationRequest;
import com.smartcampus.hub.auth.dto.VerifyEmailRequest;
import com.smartcampus.hub.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public CurrentUserResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        return authService.login(request, httpRequest);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        Map<String, String> result = authService.verifyEmail(request.getEmail(), request.getCode());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request) {
        Map<String, String> result = authService.resendVerificationCode(request.getEmail());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody com.smartcampus.hub.auth.dto.ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.requestPasswordReset(request.getEmail()));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody com.smartcampus.hub.auth.dto.ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request.getEmail(), request.getCode(), request.getNewPassword()));
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request,
                       HttpServletResponse response,
                       Authentication authentication) {
        authService.logout(request, response, authentication);
    }
}
