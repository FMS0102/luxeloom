package com.fms.backend.dto.auth;

import java.time.Instant;

public record LoginResponseDTO(String accessToken, Instant accessTokenExpiresIn) {
}
