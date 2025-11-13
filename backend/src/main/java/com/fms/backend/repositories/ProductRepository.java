package com.fms.backend.repositories;

import com.fms.backend.models.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByName(String name);

    Page<Product> findByCategory(String category, Pageable pageable);

    Page<Product> findAll(Pageable pageable);
}
