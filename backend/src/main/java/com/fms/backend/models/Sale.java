package com.fms.backend.models;

import com.fms.backend.models.enums.SaleChannel;
import jakarta.persistence.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "tb_sales")
public class Sale implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sale_id")
    private Long id;

    @Column(length = 150)
    private String client;

    @Column(nullable = false)
    private Instant saleDate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalValue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SaleChannel saleChannel;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaleItem> items;

    public Sale() {
    }

    public Sale(Long id, String client, Instant saleDate, BigDecimal totalValue, SaleChannel saleChannel, List<SaleItem> items) {
        this.id = id;
        this.client = client;
        this.saleDate = saleDate;
        this.totalValue = totalValue;
        this.saleChannel = saleChannel;
        this.items = items;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public BigDecimal getTotalValue() {
        return totalValue;
    }

    public void setTotalValue(BigDecimal totalValue) {
        this.totalValue = totalValue;
    }

    public SaleChannel getSaleChannel() {
        return saleChannel;
    }

    public void setSaleChannel(SaleChannel saleChannel) {
        this.saleChannel = saleChannel;
    }

    public List<SaleItem> getItems() {
        return items;
    }

    public void setItems(List<SaleItem> items) {
        this.items = items;
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Sale sale)) return false;
        return Objects.equals(getId(), sale.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }
}
