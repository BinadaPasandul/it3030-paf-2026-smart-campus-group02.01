package com.smartcampus.hub.security;

import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpStatus;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private static final String FRONTEND_BASE_URL = "http://localhost:3000";
    private final CustomOAuth2UserService customOAuth2UserService;
    private final CustomUserDetailsService customUserDetailsService;
    private final PasswordEncoder passwordEncoder;

    public SecurityConfig(CustomOAuth2UserService customOAuth2UserService,
                          CustomUserDetailsService customUserDetailsService,
                          PasswordEncoder passwordEncoder) {
        this.customOAuth2UserService = customOAuth2UserService;
        this.customUserDetailsService = customUserDetailsService;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authenticationProvider(authenticationProvider())
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .exceptionHandling(exceptions -> exceptions
                        .defaultAuthenticationEntryPointFor(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                                new AntPathRequestMatcher("/api/**")
                        )
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/error", "/webjars/**", "/oauth2/**", "/login/**", "/uploads/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/register", "/api/auth/logout").permitAll()
                        .requestMatchers("/api/users/me").authenticated()
                        // Notification endpoints — users own their notifications
                        .requestMatchers(HttpMethod.GET,    "/api/notifications/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH,  "/api/notifications/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/notifications/**").authenticated()
                        // Admin-only broadcast
                        .requestMatchers(HttpMethod.POST, "/api/admin/notifications/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .defaultSuccessUrl(FRONTEND_BASE_URL + "/home", true)
                )
                .logout(logout -> logout
                        .logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                        .logoutSuccessUrl(FRONTEND_BASE_URL)
                );

        return http.build();
    }
}
