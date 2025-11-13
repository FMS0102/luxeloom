package com.fms.backend.dto.auth;

import com.fms.backend.models.User;

import java.time.Instant;
import java.util.Optional;

public record TokenRefreshRequestDTO(String refreshToken, Instant expirationDate, Optional<User> user) {
}
