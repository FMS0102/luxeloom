package com.fms.backend.dto;

import com.fms.backend.models.Category;

import java.math.BigDecimal;

public record ProductResponseDTO(
        String id,
        String name,
        String description,
        String color,
        Long categoryId,
        String categoryName,
        BigDecimal price,
        Integer quantityStock
) {
    public ProductResponseDTO {
    }
}
