package com.fms.backend.controllers;

import com.fms.backend.dto.DashboardDTO;
import com.fms.backend.dto.SaleRequestDTO;
import com.fms.backend.dto.SaleResponseDTO;
import com.fms.backend.services.SaleService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/sale")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @PostMapping
    public ResponseEntity<SaleResponseDTO> registerSale(@RequestBody SaleRequestDTO dto){
        var response = saleService.registerSale(dto);
        URI location = URI.create("/api/sale/" + response.id());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<SaleResponseDTO>> findAll(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String clientName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        return ResponseEntity.ok().body(saleService.findAll(categoryId, clientName, page, size));
    }


    @PatchMapping("/{id}")
    public ResponseEntity<SaleResponseDTO> patchSale(@PathVariable Long id, @Valid @RequestBody SaleRequestDTO dto) {
        SaleResponseDTO updatedProduct = saleService.patch(id, dto);
        return ResponseEntity.ok(updatedProduct);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SaleResponseDTO> findById(@PathVariable Long id){
        return ResponseEntity.ok().body(saleService.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<SaleResponseDTO> delete(@PathVariable Long id){
        saleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDTO> getDashboardData() {
        DashboardDTO data = saleService.getDashboardData();
        return ResponseEntity.ok(data);
    }

}
