package com.fms.backend.services;

import com.fms.backend.dto.ProductRequestDTO;
import com.fms.backend.dto.ProductResponseDTO;
import com.fms.backend.exceptions.validation.DuplicateResourceException;
import com.fms.backend.exceptions.validation.ResourceNotFoundException;
import com.fms.backend.exceptions.validation.ValidationException;
import com.fms.backend.mappers.ProductMapper;
import com.fms.backend.models.Category;
import com.fms.backend.models.Product;
import com.fms.backend.repositories.CategoryRepository;
import com.fms.backend.repositories.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, ProductMapper productMapper, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.categoryRepository = categoryRepository;
    }

    private final Logger logger = LoggerFactory.getLogger(ProductService.class);

    @Transactional(readOnly = true)
    public Page<ProductResponseDTO> findAll(int page, int size) {

        logger.info("Product Service: FindAll products.");

        var pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Product> pageMaterial = productRepository.findAll(pageable);
        var dtoList = productMapper.toDTOList(pageMaterial.getContent());

        return new PageImpl<>(dtoList, pageable, pageMaterial.getTotalElements());

    }

    @Transactional(readOnly = true)
    public ProductResponseDTO findById(Long id) {
        logger.info("Find product by id: {}", id);

        var product = productRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Produto não encontrado para esse id: " + id)
        );

        return productMapper.toDTO(product);
    }

    @Transactional(readOnly = true)
    public Product findEntityById(Long id) {
        logger.info("Find entity by id: {}", id);

        return productRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Produto não encontrado para esse id: " + id)
        );
    }

    @Transactional
    public ProductResponseDTO create(ProductRequestDTO dto) {

        logger.info("Creating product with name: {}", dto.getName());

        if (dto.getName() == null || dto.getPrice() == null || dto.getQuantityStock() == null || dto.getCategoryId() == null) {
            throw new ValidationException("Campos obrigatórios (nome, preço, estoque, ID da categoria) devem ser preenchidos na criação.");
        }

        if (productRepository.findByName(dto.getName()).isPresent()) {
            throw new DuplicateResourceException("Já existe um produto com esse nome: " + dto.getName());
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada com ID: " + dto.getCategoryId()));

        Product product = productMapper.toEntity(dto);
        product.setCreatedAt(Instant.now());
        product.setUpdatedAt(Instant.now());
        product.setCategory(category);

        productRepository.save(product);

        return productMapper.toDTO(product);
    }

    @Transactional
    public ProductResponseDTO patch(Long id, ProductRequestDTO dto) {

        logger.info("Patch product with id {}.", id);

        Product product = findEntityById(id);

        if (dto.getName() != null) {
            var existingProduct = productRepository.findByName(dto.getName());

            if (existingProduct.isPresent() && !existingProduct.get().getId().equals(id)) {
                throw new DuplicateResourceException("Já existe um produto com esse nome: " + dto.getName());
            }
        }

        productMapper.updateEntityFromDto(dto, product);

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada com id: " + dto.getCategoryId()));
            product.setCategory(category);
        }

        productMapper.updateEntityFromDto(dto, product);
        product.setUpdatedAt(Instant.now());
        productRepository.save(product);

        return productMapper.toDTO(product);
    }

    @Transactional
    public void delete(Long id) {
        logger.info("Delete product by id {}.", id);
        Product product = findEntityById(id);
        productRepository.delete(product);
    }

    @Transactional
    public void updateStock(Long productId, Integer quantity) {

        Product product = findEntityById(productId);

        int newStock = product.getQuantityStock() - quantity;

        if (newStock < 0) {
            throw new ValidationException("Quantidade insuficiente de produto: " + product.getName());
        }

        product.setQuantityStock(newStock);
        productRepository.save(product);
    }


}
