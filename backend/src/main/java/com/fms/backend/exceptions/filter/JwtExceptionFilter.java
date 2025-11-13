package com.fms.backend.exceptions.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fms.backend.exceptions.ExceptionResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Date;

@Component
public class JwtExceptionFilter extends OncePerRequestFilter {

    private final JwtDecoder jwtDecoder;

    public JwtExceptionFilter(JwtDecoder jwtDecoder) {
        this.jwtDecoder = jwtDecoder;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        try {
            String authHeader = request.getHeader("Authorization");

            if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                jwtDecoder.decode(token);
            }

            filterChain.doFilter(request, response);

        } catch (OAuth2AuthenticationException ex) {
            handleJwtError(response, request, ex.getMessage());
        } catch (JwtException ex) {
            handleJwtError(response, request, "Invalid token: " + ex.getMessage());
        }
    }

    private void handleJwtError(HttpServletResponse response, HttpServletRequest request, String message)
            throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");

        ExceptionResponse errorResponse = new ExceptionResponse(
                new Date(),
                message,
                request.getRequestURI()
        );

        String json = new ObjectMapper().writeValueAsString(errorResponse);
        response.getWriter().write(json);
    }
}
