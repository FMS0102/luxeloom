package com.fms.backend.controllers;

import com.fms.backend.dto.CategoryRequestDTO;
import com.fms.backend.dto.CategoryResponseDTO;

import com.fms.backend.services.CategoryService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public ResponseEntity<CategoryResponseDTO> create(@RequestBody CategoryRequestDTO dto) {
        var response = categoryService.create(dto);
        URI location = URI.create("/api/product/" + response.id());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<CategoryResponseDTO>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok().body(categoryService.findAll(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> findCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok().body(categoryService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> updateCategory(@PathVariable Long id, @Validated @RequestBody CategoryRequestDTO dto) {
        CategoryResponseDTO updatedCategory = categoryService.update(id, dto);
        return ResponseEntity.ok(updatedCategory);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
