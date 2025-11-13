package com.fms.backend.models;

import jakarta.persistence.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Table(name = "tb_sale_items")
public class SaleItem implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sale_item_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id", nullable = false)
    private Sale sale;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitAtPrice;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subTotal;

    public SaleItem() {
    }

    public SaleItem(Long id, Sale sale, Product product, Integer quantity, BigDecimal unitAtPrice, BigDecimal subTotal) {
        this.id = id;
        this.sale = sale;
        this.product = product;
        this.quantity = quantity;
        this.unitAtPrice = unitAtPrice;
        this.subTotal = subTotal;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Sale getSale() {
        return sale;
    }

    public void setSale(Sale sale) {
        this.sale = sale;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitAtPrice() {
        return unitAtPrice;
    }

    public void setUnitAtPrice(BigDecimal unitAtPrice) {
        this.unitAtPrice = unitAtPrice;
    }

    public BigDecimal getSubTotal() {
        return subTotal;
    }

    public void setSubTotal(BigDecimal subTotal) {
        this.subTotal = subTotal;
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof SaleItem saleItem)) return false;
        return Objects.equals(getId(), saleItem.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }
}
