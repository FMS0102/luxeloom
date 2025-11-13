package com.fms.backend.exceptions.handler;

import com.fms.backend.exceptions.ExceptionResponse;
import com.fms.backend.exceptions.auth.CustomAccessDeniedException;
import com.fms.backend.exceptions.auth.CustomAuthenticationException;
import com.fms.backend.exceptions.auth.TokenRefreshException;
import com.fms.backend.exceptions.validation.DuplicateResourceException;
import com.fms.backend.exceptions.validation.ResourceNotFoundException;
import com.fms.backend.exceptions.validation.ValidationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalResponseHandler {

    @ExceptionHandler(CustomAuthenticationException.class)
    public final ResponseEntity<ExceptionResponse> handleAuthenticationException(CustomAuthenticationException ex, WebRequest request) {
        String message = ex.isGeneric() ? "Unauthorized access." : ex.getMessage();
        ExceptionResponse response = new ExceptionResponse(
                new Date(),
                message,
                request.getDescription(false));
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(CustomAccessDeniedException.class)
    public ResponseEntity<ExceptionResponse> handleCustomAccessDeniedException(CustomAccessDeniedException ex, WebRequest request) {
        ExceptionResponse response = new ExceptionResponse(
                new Date(),
                ex.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(TokenRefreshException.class)
    public ResponseEntity<ExceptionResponse> tokenRefreshException(TokenRefreshException ex, WebRequest request) {
        ExceptionResponse response = new ExceptionResponse(
                new Date(),
                ex.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ExceptionResponse> resourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        ExceptionResponse response = new ExceptionResponse(
                new Date(),
                ex.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ExceptionResponse> duplicateResourceException(DuplicateResourceException ex, WebRequest request) {
        ExceptionResponse response = new ExceptionResponse(
                new Date(),
                ex.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ExceptionResponse> validationException(ValidationException ex, WebRequest request) {
        ExceptionResponse response = new ExceptionResponse(
                new Date(),
                ex.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

}
