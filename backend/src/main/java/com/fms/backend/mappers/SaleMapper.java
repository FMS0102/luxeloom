package com.fms.backend.mappers;

import com.fms.backend.dto.SaleItemResponseDTO;
import com.fms.backend.dto.SaleRequestDTO;
import com.fms.backend.dto.SaleResponseDTO;
import com.fms.backend.models.Sale;
import com.fms.backend.models.SaleItem;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SaleMapper {
    SaleResponseDTO toDTO(Sale sale);
    Sale toEntity(SaleRequestDTO saleDTO);
    List<SaleResponseDTO> toDTOList(List<Sale> saleList);

    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.name", target = "name")
    @Mapping(source = "unitAtPrice", target = "price")
    SaleItemResponseDTO toItemResponseDTO(SaleItem saleItem);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(SaleRequestDTO dto, @MappingTarget Sale entity);

}
