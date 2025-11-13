package com.fms.backend.exceptions.auth;

public class TokenRefreshException extends RuntimeException {

    public TokenRefreshException() {
        super("Token renewal failed. Please log in again.");
    }

    public TokenRefreshException(String message) {
        super(message);
    }
}
