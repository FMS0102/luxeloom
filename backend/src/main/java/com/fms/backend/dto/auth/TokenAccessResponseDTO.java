package com.fms.backend.dto.auth;

import java.time.Instant;

public record TokenAccessResponseDTO(String accessToken, Instant expirationDate) {
}
