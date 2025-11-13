package com.fms.backend.dto;

import com.fms.backend.models.enums.SaleChannel;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record SaleResponseDTO(
        Long id,
        String client,
        Instant saleDate,
        SaleChannel saleChannel,
        BigDecimal totalValue,
        List<SaleItemResponseDTO> items
) {
}
