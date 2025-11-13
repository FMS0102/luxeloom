package com.fms.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.Objects;

public class SaleItemRequestDTO {

    @NotNull(message = "O ID do produto é obrigatório.")
    @Positive(message = "O ID do produto deve ser um valor positivo.")
    private Long productId;

    @NotNull(message = "A quantidade é obrigatória.")
    @Min(value = 1, message = "A quantidade mínima de venda é 1.")
    private Integer quantity;

    public SaleItemRequestDTO() {
    }

    public SaleItemRequestDTO(Long productId, Integer quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof SaleItemRequestDTO that)) return false;
        return Objects.equals(getProductId(), that.getProductId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getProductId());
    }
}
