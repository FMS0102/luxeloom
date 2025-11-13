package com.fms.backend.exceptions.auth;

public class CustomAccessDeniedException extends RuntimeException {
    public CustomAccessDeniedException(String message) {
        super(message);
    }
}
