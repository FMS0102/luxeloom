package com.fms.backend.mappers;

import com.fms.backend.dto.ProductRequestDTO;
import com.fms.backend.dto.ProductResponseDTO;
import com.fms.backend.models.Product;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    ProductResponseDTO toDTO(Product product);

    @Mapping(target = "category", ignore = true)
    Product toEntity(ProductRequestDTO productDTO);

    @Mapping(target = "category", ignore = true)
    List<ProductResponseDTO> toDTOList(List<Product> productList);

    @Mapping(target = "category", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(ProductRequestDTO dto, @MappingTarget Product entity);

}
