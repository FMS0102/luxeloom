package com.fms.backend.exceptions.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fms.backend.exceptions.ExceptionResponse;
import com.fms.backend.exceptions.auth.CustomAuthenticationException;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Date;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException, ServletException {

        Throwable cause = authException.getCause();
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        CustomAuthenticationException customEx = new CustomAuthenticationException();

        ExceptionResponse errorResponse = new ExceptionResponse(
                new Date(),
                customEx.getMessage(),
                request.getRequestURI()
        );

        String json = new ObjectMapper().writeValueAsString(errorResponse);
        response.getWriter().write(json);
    }
}