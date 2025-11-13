package com.fms.backend.models;

import jakarta.persistence.*;

import java.io.Serializable;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "tb_categories")
public class Category implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50, unique = true)
    private String name;

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    private List<Product> products;

    public Category() {
    }

    public Category(Long id, String name, List<Product> products) {
        this.id = id;
        this.name = name;
        this.products = products;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Category category)) return false;
        return Objects.equals(getId(), category.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }
}
