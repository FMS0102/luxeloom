package com.fms.backend.repositories;

import com.fms.backend.models.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    void deleteAllByUserId(UUID userId);

    @Modifying
    int deleteByExpiryDateBefore(Instant expiryDate);
}
