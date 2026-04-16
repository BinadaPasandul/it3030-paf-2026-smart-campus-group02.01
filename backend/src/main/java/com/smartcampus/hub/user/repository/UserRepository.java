package com.smartcampus.hub.user.repository;

import com.smartcampus.hub.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
    Optional<User> findByProviderId(String providerId);
    boolean existsByEmail(String email);
    /** Used by the notification broadcast to send alerts to all active users. */
    List<User> findByActiveTrue();
}
