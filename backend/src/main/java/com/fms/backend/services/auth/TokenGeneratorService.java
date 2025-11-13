package com.fms.backend.services.auth;

import com.fms.backend.dto.auth.TokenAccessResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;

@Service
public class TokenGeneratorService {

    @Value("${jwt.public.token-expiration-minutes}")
    private long accessTokenExpirationMinutes;

    private final JwtEncoder jwtEncoder;

    public TokenGeneratorService(JwtEncoder jwtEncoder) {
        this.jwtEncoder = jwtEncoder;
    }

    public TokenAccessResponseDTO generateAccessToken(UUID userId, String username, String scopes) {

        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("portfolio")
                .issuedAt(now)
                .expiresAt(now.plus(accessTokenExpirationMinutes, ChronoUnit.MINUTES))
                .subject(userId.toString())
                .claim("username", username)
                .claim("scope", scopes)
                .build();

        return new TokenAccessResponseDTO(
                jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue(),
                jwtEncoder.encode(JwtEncoderParameters.from(claims)).getExpiresAt()
        );
    }

    public String generateRefreshToken() {
        return UUID.randomUUID() + "-" + randomExtraRefreshToken();
    }

    private static String randomExtraRefreshToken() {
        byte[] bytes = new byte[16];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

}
