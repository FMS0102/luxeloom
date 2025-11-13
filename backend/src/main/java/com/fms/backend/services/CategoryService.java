package com.fms.backend.services;

import com.fms.backend.dto.CategoryRequestDTO;
import com.fms.backend.dto.CategoryResponseDTO;
import com.fms.backend.exceptions.validation.DuplicateResourceException;
import com.fms.backend.exceptions.validation.ResourceNotFoundException;
import com.fms.backend.exceptions.validation.ValidationException;
import com.fms.backend.mappers.CategoryMapper;
import com.fms.backend.models.Category;
import com.fms.backend.repositories.CategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    private final Logger logger = LoggerFactory.getLogger(CategoryService.class);

    public CategoryService(CategoryRepository categoryRepository, CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
    }

    @Transactional(readOnly = true)
    public Page<CategoryResponseDTO> findAll(int page, int size) {
        logger.info("Category Service: FindAll categories.");

        var pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Category> pageMaterial = categoryRepository.findAll(pageable);
        var dtoList = categoryMapper.toDTOList(pageMaterial.getContent());

        return new PageImpl<>(dtoList, pageable, pageMaterial.getTotalElements());
    }

    @Transactional(readOnly = true)
    public CategoryResponseDTO findById(Long id) {
        logger.info("Find category by id: {}", id);

        var entity = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada com ID: " + id));

        return categoryMapper.toDTO(entity);
    }

    private Category findEntityById(Long id) {
        logger.info("Find category entity by id: {}", id);

        return categoryRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Venda não encontrada para esse id: " + id)
        );
    }

    @Transactional
    public CategoryResponseDTO create(CategoryRequestDTO dto) {
        logger.info("Creating category with name: {}", dto.getName());

        if (categoryRepository.findByName(dto.getName()).isPresent()) {
            throw new DuplicateResourceException("Já existe uma categoria com esse nome: " + dto.getName());
        }

        Category category = categoryMapper.toEntity(dto);
        categoryRepository.save(category);

        return categoryMapper.toDTO(category);
    }

    @Transactional
    public CategoryResponseDTO update(Long id, CategoryRequestDTO dto) {
        logger.info("Patch category with id {}.", id);

        Category category = findEntityById(id);

        if (dto.getName() != null) {
            var existingProduct = categoryRepository.findByName(dto.getName());

            if (existingProduct.isPresent() && !existingProduct.get().getId().equals(id)) {
                throw new DuplicateResourceException("Já existe um produto com esse nome: " + dto.getName());
            }
        }

        categoryMapper.updateEntityFromDto(dto, category);
        categoryRepository.save(category);

        return categoryMapper.toDTO(category);
    }

    @Transactional
    public void delete(Long id) {
        logger.info("Delete category by id {}.", id);
        Category category = findEntityById(id);
        if (category.getProducts() != null && !category.getProducts().isEmpty()) {
            throw new ValidationException("Não é possível eliminar a categoria que está vinculada a aglum produto.");
        }

        categoryRepository.delete(category);
    }



}
