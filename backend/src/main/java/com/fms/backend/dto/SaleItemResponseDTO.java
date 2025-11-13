package com.fms.backend.dto;

import java.math.BigDecimal;

public record SaleItemResponseDTO(
        Long productId,
        String name,
        Integer quantity,
        BigDecimal price
) {

}
