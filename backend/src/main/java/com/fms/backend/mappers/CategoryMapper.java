package com.fms.backend.mappers;

import com.fms.backend.dto.CategoryRequestDTO;
import com.fms.backend.dto.CategoryResponseDTO;
import com.fms.backend.models.Category;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryResponseDTO toDTO(Category category);
    Category toEntity(CategoryRequestDTO categoryDTO);
    List<CategoryResponseDTO> toDTOList(List<Category> categoryList);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(CategoryRequestDTO dto,@MappingTarget Category category);
}
