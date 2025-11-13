package com.fms.backend.exceptions.auth;

public class CustomAuthenticationException extends RuntimeException {

    private final boolean isGeneric;

    public CustomAuthenticationException() {
        super("Authentication is required to access this resource.");
        this.isGeneric = true;
    }

    public CustomAuthenticationException(String message) {
        super(message);
        this.isGeneric = false;
    }

    public boolean isGeneric() {
        return isGeneric;
    }
}
