package com.fms.backend.utils;

import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public class AuthUtils {

    public static UUID getAutenticatedUser() {
        String name = SecurityContextHolder.getContext().getAuthentication().getName();
        return UUID.fromString(name);
    }
}
