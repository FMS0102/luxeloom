package com.fms.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CategoryRequestDTO {

    @NotBlank(message = "O nome da categoria é obrigatório.")
    @Size(max = 50, message = "O nome deve ter no máximo 50 caracteres.")
    private String name;

    public CategoryRequestDTO() {}

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
}
