package com.fms.backend.repositories;

import com.fms.backend.models.Sale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    Page<Sale> findAll(Pageable pageable);

    Page<Sale> findByClient(String name, Pageable pageable);

    @Query("SELECT DISTINCT s FROM Sale s JOIN s.items item JOIN item.product p WHERE p.category.id = :categoryId")
    Page<Sale> findSalesByProductCategory(@Param("categoryId") Long categoryId, Pageable pageable);

    // dashboard:
    @Query("SELECT s.saleChannel, COUNT(s) FROM Sale s GROUP BY s.saleChannel")
    List<Object[]> countSalesByChannel();

    @Query("SELECT p.category.name, SUM(si.quantity) FROM SaleItem si JOIN si.product p GROUP BY p.category.name")
    List<Object[]> sumItemsSoldByCategory();

    @Query("SELECT SUM(s.totalValue) FROM Sale s")
    Optional<BigDecimal> sumTotalRevenue();

    @Query("SELECT EXTRACT(YEAR FROM s.saleDate), EXTRACT(MONTH FROM s.saleDate), SUM(s.totalValue) " +
            "FROM Sale s " +
            "GROUP BY EXTRACT(YEAR FROM s.saleDate), EXTRACT(MONTH FROM s.saleDate) " +
            "ORDER BY EXTRACT(YEAR FROM s.saleDate) ASC, EXTRACT(MONTH FROM s.saleDate) ASC")
    List<Object[]> sumRevenueByMonth();
}
