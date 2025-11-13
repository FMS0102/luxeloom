package com.fms.backend.repositories;

import com.fms.backend.models.Sale;
import com.fms.backend.models.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

    List<SaleItem> findAllBySaleId(Long saleId);
}
