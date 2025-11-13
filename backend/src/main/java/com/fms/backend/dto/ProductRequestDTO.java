package com.fms.backend.dto;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public class ProductRequestDTO {

    @Size(max = 100, message = "O nome não pode exceder 100 caracteres.")
    private String name;

    @Size(max = 500, message = "A descrição não pode exceder 500 caracteres.")
    private String description;

    @Size(max = 50, message = "A cor deve ter no máximo 50 caracteres.")
    private String color;

    @NotNull(message = "O ID da categoria é obrigatório.")
    @Min(value = 1, message = "ID de categoria inválido.")
    private Long categoryId;

    @DecimalMin(value = "0.01", message = "O preço deve ser maior que zero.")
    private BigDecimal price;

    @Min(value = 0, message = "A quantidade em estoque não pode ser negativa.")
    private Integer quantityStock;

    public ProductRequestDTO() {
    }

    public ProductRequestDTO(String name, String description, BigDecimal price, Long categoryId, Integer quantityStock) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.categoryId = categoryId;
        this.quantityStock = quantityStock;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getQuantityStock() {
        return quantityStock;
    }

    public void setQuantityStock(Integer quantityStock) {
        this.quantityStock = quantityStock;
    }
}
