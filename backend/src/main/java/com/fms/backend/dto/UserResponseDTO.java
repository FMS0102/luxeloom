package com.fms.backend.dto;

import com.fms.backend.models.Role;

import java.util.Set;

public record UserResponseDTO(
        String name,
        String email,
        Set<Role> roles
) {
}
