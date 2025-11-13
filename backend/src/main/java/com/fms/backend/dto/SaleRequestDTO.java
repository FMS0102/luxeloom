package com.fms.backend.dto;

import com.fms.backend.models.enums.SaleChannel;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

public class SaleRequestDTO {

    @Size(max = 100, message = "O nome do cliente deve ter no máximo 100 caracteres.")
    private String client;

    @NotNull(message = "O canal de venda é obrigatório.")
    private SaleChannel saleChannel;

    @NotNull(message = "A data de venda é obrigatória.")
    private Instant saleDate;

    @NotEmpty(message = "A venda deve conter pelo menos um item.")
    @Valid
    private List<SaleItemRequestDTO> items;

    public SaleRequestDTO() {
    }

    public SaleRequestDTO(String client, SaleChannel saleChannel, List<SaleItemRequestDTO> items) {
        this.client = client;
        this.saleChannel = saleChannel;
        this.items = items;
    }

    public String getClient() {
        return client;
    }

    public void setClient(String client) {
        this.client = client;
    }

    public Instant getSaleDate() {
        return saleDate;
    }

    public void setSaleDate(Instant saleDate) {
        this.saleDate = saleDate;
    }

    public SaleChannel getSaleChannel() {
        return saleChannel;
    }

    public void setSaleChannel(SaleChannel saleChannel) {
        this.saleChannel = saleChannel;
    }

    public List<SaleItemRequestDTO> getItems() {
        return items;
    }

    public void setItems(List<SaleItemRequestDTO> items) {
        this.items = items;
    }

}
