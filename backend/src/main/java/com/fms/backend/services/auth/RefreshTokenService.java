package com.fms.backend.services.auth;

import com.fms.backend.dto.auth.TokenRefreshRequestDTO;
import com.fms.backend.exceptions.auth.TokenRefreshException;
import com.fms.backend.exceptions.validation.ResourceNotFoundException;
import com.fms.backend.models.RefreshToken;
import com.fms.backend.models.User;
import com.fms.backend.repositories.RefreshTokenRepository;
import com.fms.backend.repositories.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static com.fms.backend.utils.HttpUtils.getClientIpAddress;

@Service
public class RefreshTokenService {

    @Value("${jwt.refresh.token-expiration-minutes}")
    private Long refreshTokenExpirationMinutes;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final TokenGeneratorService tokenGeneratorService;
    private final BCryptPasswordEncoder encoder;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, UserRepository userRepository, TokenGeneratorService tokenGeneratorService, BCryptPasswordEncoder encoder) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.tokenGeneratorService = tokenGeneratorService;
        this.encoder = encoder;
    }

    private final Logger logger = LoggerFactory.getLogger(RefreshTokenService.class.getName());

    @Transactional
    public TokenRefreshRequestDTO createRefreshToken(UUID userId, HttpServletRequest request) {

        logger.info("RefreshTokenService: create refresh token");

        String tokenId = UUID.randomUUID().toString();
        String rawSecret = tokenGeneratorService.generateRefreshToken();
        String compositeToken = tokenId + "." + rawSecret;

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        String userAgent = request.getHeader("User-Agent");
        String ipAddress = getClientIpAddress(request);

        RefreshToken savedRefreshToken = saveRefreshToken(user, tokenId, rawSecret, ipAddress, userAgent);

        return new TokenRefreshRequestDTO(compositeToken,  savedRefreshToken.getExpiryDate(), Optional.empty());
    }

    private RefreshToken saveRefreshToken(User user, String tokenId, String rawSecret, String ipAddress, String userAgent) {
        String hashed = encoder.encode(rawSecret);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(tokenId);
        refreshToken.setTokenHash(hashed);
        refreshToken.setUserAgent(userAgent);
        refreshToken.setIp(ipAddress);
        refreshToken.setExpiryDate(Instant.now().plus(refreshTokenExpirationMinutes, ChronoUnit.MINUTES));

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public TokenRefreshRequestDTO revokeAndReplace(String compositeToken, HttpServletRequest request) {

        String[] parts = compositeToken.split("\\.");
        if (parts.length != 2) {
            throw new TokenRefreshException("Formato de refresh token inválido.");
        }

        String tokenId = parts[0];
        String rawSecret = parts[1];

        var refreshTokenDb = refreshTokenRepository.findByToken(tokenId).orElseThrow(
                () -> new TokenRefreshException("Refresh token não encontrado ou inválido.")
        );

        if (refreshTokenDb.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshTokenDb);
            throw new TokenRefreshException("Refresh token expirado.");
        }

        var user = refreshTokenDb.getUser();

        if (!encoder.matches(rawSecret, refreshTokenDb.getTokenHash())) {
            refreshTokenRepository.deleteAllByUserId(user.getId());
            logger.warn("Revoked all tokens for user {} due to invalid refresh token attempt.", user.getId());
            throw new TokenRefreshException("Refresh token inválido.");
        }

        refreshTokenRepository.deleteAllByUserId(user.getId());

        String userAgent = request.getHeader("User-Agent");
        String ipAddress = getClientIpAddress(request);

        String newTokenId = UUID.randomUUID().toString();
        String newRawSecret = tokenGeneratorService.generateRefreshToken();
        String newCompositeToken = tokenId + "." + newRawSecret;

        RefreshToken savedRefreshToken = saveRefreshToken(user, newTokenId, newRawSecret, ipAddress, userAgent);

        return new TokenRefreshRequestDTO(newCompositeToken,  savedRefreshToken.getExpiryDate(), Optional.of(user));
    }

    @Scheduled(cron = "${app.schedule.refresh-token-cleanup-cron}")
    @Transactional
    public void deleteExpiredTokens() {
        logger.info("Starting the scheduled cleanup of expired Refresh Tokens....");

        int deletedCount = refreshTokenRepository.deleteByExpiryDateBefore(Instant.now());

        logger.info("Scheduled cleanup completed. Total expired tokens deleted: {}", deletedCount);
    }
}
