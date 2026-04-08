package com.smartcampus.hub.auth.controller;

import com.smartcampus.hub.auth.dto.CurrentUserResponse;
import com.smartcampus.hub.auth.dto.LoginRequest;
import com.smartcampus.hub.auth.dto.RegisterRequest;
import com.smartcampus.hub.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
    public CurrentUserResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request,
                       HttpServletResponse response,
                       Authentication authentication) {
        authService.logout(request, response, authentication);
    }
}
