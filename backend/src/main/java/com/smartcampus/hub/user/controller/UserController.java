package com.smartcampus.hub.user.controller;

import com.smartcampus.hub.auth.dto.CurrentUserResponse;
import com.smartcampus.hub.auth.service.AuthService;
import com.smartcampus.hub.user.dto.CompleteProfileRequest;
import com.smartcampus.hub.user.dto.CreateUserRequest;
import com.smartcampus.hub.user.dto.UpdateUserRoleRequest;
import com.smartcampus.hub.user.dto.UserResponse;
import com.smartcampus.hub.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.lang.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@Valid @RequestBody CreateUserRequest request) {
        return userService.createUser(request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/technicians")
    public List<UserResponse> getActiveTechnicians() {
        return userService.getActiveTechnicians();
    }

    @GetMapping("/me")
    public CurrentUserResponse currentUser(Authentication authentication) {
        return authService.getCurrentUser(authentication);
    }

    @PutMapping("/me/profile")
    public CurrentUserResponse completeProfile(Authentication authentication,
                                               @Valid @RequestBody CompleteProfileRequest request) {
        return authService.completeProfile(authentication, request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable @NonNull Long id) {
        return userService.getUserById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/role")
    public UserResponse updateUserRole(@PathVariable @NonNull Long id,
                                       @Valid @RequestBody UpdateUserRoleRequest request) {
        return userService.updateUserRole(id, request);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivateUser(@PathVariable @NonNull Long id) {
        userService.deactivateUser(id);
    }
}
