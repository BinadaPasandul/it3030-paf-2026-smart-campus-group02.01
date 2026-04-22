package com.smartcampus.hub.security;

import com.smartcampus.hub.notification.service.NotificationService;
import com.smartcampus.hub.user.entity.Role;
import com.smartcampus.hub.user.entity.User;
import com.smartcampus.hub.user.repository.UserRepository;
import com.smartcampus.hub.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();

    public CustomOAuth2UserService(UserRepository userRepository,
                                   UserService userService,
                                   NotificationService notificationService) {
        this.userRepository      = userRepository;
        this.userService         = userService;
        this.notificationService = notificationService;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauthUser = delegate.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oauthUser.getAttributes();

        String provider = registrationId.toUpperCase();
        String providerId = (String) attributes.get("sub");
        String email = (String) attributes.get("email");
        String fullName = (String) attributes.getOrDefault("name", email);

        if (email == null) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        Optional<User> existingUserOptional = Optional.<User>empty();

        if (providerId != null && !providerId.isBlank()) {
            existingUserOptional = userRepository
                    .findByProviderId(providerId)
                    .or(() -> userRepository.findByProviderAndProviderId(provider, providerId));
        }

        existingUserOptional = existingUserOptional.or(() -> userRepository.findByEmail(email));

        User user;
        boolean isNewUser;

        if (existingUserOptional.isPresent()) {
            user = existingUserOptional.get();
            if (!user.isActive()) {
                throw new OAuth2AuthenticationException("User account is deactivated");
            }
            userService.populateGoogleUser(user, fullName, provider, providerId);
            isNewUser = false;
        } else {
            user = new User();
            user.setFullName(fullName);
            user.setEmail(email);
            user.setProvider(provider);
            user.setProviderId(providerId);
            user.setRole(Role.USER);
            user.setActive(true);
            user.setProfileCompleted(false);
            isNewUser = true;
        }

        User savedUser = userRepository.save(user);

        // Fire notification after save so we have a valid savedUser.getId()
        if (isNewUser) {
            notificationService.sendWelcomeNotification(savedUser.getId(), savedUser.getFullName());
        } else {
            notificationService.sendNewLoginNotification(savedUser.getId(), resolveClientIp());
        }

        return new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_" + savedUser.getRole().name())),
                attributes,
                "email"
        );
    }

    /** Reads the client IP from the current HTTP request without extra dependencies. */
    private String resolveClientIp() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            HttpServletRequest request = attrs.getRequest();
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                return forwarded.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        } catch (Exception e) {
            return "unknown";
        }
    }
}
