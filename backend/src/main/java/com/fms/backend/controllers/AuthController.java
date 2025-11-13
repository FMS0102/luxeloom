package com.fms.backend.controllers;

import com.fms.backend.dto.auth.AuthServiceResponseDTO;
import com.fms.backend.dto.auth.LoginRequestDTO;
import com.fms.backend.dto.auth.LoginResponseDTO;
import com.fms.backend.services.auth.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @RequestBody LoginRequestDTO loginRequestDTO,
            HttpServletResponse response, HttpServletRequest request
    ) {
        AuthServiceResponseDTO authResponse = authService.login(loginRequestDTO, request);
        ResponseCookie cookie = ResponseCookie.from("refresh_token", authResponse.refreshToken())
                .httpOnly(true)
                .secure(true)
                .path("/auth")
                .maxAge(authResponse.refreshTokenExpiresIn().getEpochSecond())
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(new LoginResponseDTO(
                authResponse.accessToken(),
                authResponse.accessTokenExpiresIn()
        ));
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDTO> updateRefreshToken(
            @CookieValue(name = "refresh_token", required = false) String refreshTokenFromCookie,
            HttpServletResponse response, HttpServletRequest request
    ) {

        AuthServiceResponseDTO authResponse = authService.updateRefreshToken(refreshTokenFromCookie, request);
        ResponseCookie cookie = ResponseCookie.from("refresh_token", authResponse.refreshToken())
                .httpOnly(true)
                .secure(true)
                .path("/auth")
                .maxAge(authResponse.refreshTokenExpiresIn().getEpochSecond())
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(new LoginResponseDTO(
                authResponse.accessToken(),
                authResponse.accessTokenExpiresIn()
        ));
    }
}
