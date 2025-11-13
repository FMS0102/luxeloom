package com.fms.backend.dto.auth;

import java.time.Instant;

public record AuthServiceResponseDTO(
        String accessToken,
        Instant accessTokenExpiresIn,
        String refreshToken,
        Instant refreshTokenExpiresIn
) {
}
