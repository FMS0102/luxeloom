package com.fms.backend.exceptions.validation;

public class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }
}
