package com.fms.backend.controllers;

import com.fms.backend.dto.ProductRequestDTO;
import com.fms.backend.dto.ProductResponseDTO;
import com.fms.backend.services.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/product")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<ProductResponseDTO> create(@RequestBody ProductRequestDTO dto){
        var response = productService.create(dto);
        URI location = URI.create("/api/product/" + response.id());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<ProductResponseDTO>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        return ResponseEntity.ok().body(productService.findAll(page, size));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> patchProduct(@PathVariable Long id, @Valid @RequestBody ProductRequestDTO dto) {
        ProductResponseDTO updatedProduct = productService.patch(id, dto);
        return ResponseEntity.ok(updatedProduct);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> findById(@PathVariable Long id){
        return ResponseEntity.ok().body(productService.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> delete(@PathVariable Long id){
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }



}
