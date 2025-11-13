package com.fms.backend.dto.auth;

import java.time.Instant;

public record TokenRefreshResponseDTO(String refreshToken, Instant expirationDate) {
}
