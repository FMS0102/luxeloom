package com.fms.backend.mappers;

import com.fms.backend.dto.UserMeResponseDTO;
import com.fms.backend.dto.UserRequestDTO;
import com.fms.backend.dto.UserResponseDTO;
import com.fms.backend.models.User;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponseDTO toDTO(User user);
    User toEntity(UserRequestDTO userRequestDTO);
    List<UserResponseDTO> toDTOList(List<User> userList);
    UserMeResponseDTO toDtoMe(User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(UserRequestDTO dto, @MappingTarget User entity);
}
