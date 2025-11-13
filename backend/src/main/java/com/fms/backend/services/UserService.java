package com.fms.backend.services;

import com.fms.backend.dto.UserMeResponseDTO;
import com.fms.backend.dto.UserRequestDTO;
import com.fms.backend.dto.UserResponseDTO;
import com.fms.backend.exceptions.auth.CustomAccessDeniedException;
import com.fms.backend.exceptions.auth.CustomAuthenticationException;
import com.fms.backend.exceptions.validation.DuplicateResourceException;
import com.fms.backend.exceptions.validation.ResourceNotFoundException;
import com.fms.backend.mappers.UserMapper;
import com.fms.backend.models.Role;
import com.fms.backend.models.User;
import com.fms.backend.repositories.RoleRepository;
import com.fms.backend.repositories.UserRepository;
import com.fms.backend.utils.AuthUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    private final Logger logger = LoggerFactory.getLogger(UserService.class);

    public UserService(UserRepository userRepository, UserMapper userMapper, RoleRepository roleRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UserMeResponseDTO getAuthenticatedUser(){
        logger.info("User Service: User me.");
        UUID userId = AuthUtils.getAutenticatedUser();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado no DB."));

        return userMapper.toDtoMe(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> findAll() {
        logger.info("User Service: FindAll users.");
        return userMapper.toDTOList(userRepository.findAll());
    }

    @Transactional(readOnly = true)
    public UserResponseDTO findByEmail(String email) {
        logger.info("Find user by email.");

        var entity = userRepository.findByEmail(email).orElseThrow(
                () -> new ResourceNotFoundException("Não foram encontrados registros para esse e-mail.")
        );

        return userMapper.toDTO(entity);
    }

    @Transactional
    public UserResponseDTO create(UserRequestDTO dto) {
        logger.info("Create user.");
        var basicRole = roleRepository.findByName(Role.Values.BASIC.name());

        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Esse e-mail já está registrado.");
        }

        var entity = userMapper.toEntity(dto);
        entity.setPassword(passwordEncoder.encode(dto.getPassword()));
        entity.setRoles(Set.of(basicRole));

        return userMapper.toDTO(userRepository.save(entity));
    }

    @Transactional
    public UserResponseDTO patchUser(String email, UserRequestDTO dto) {
        logger.info("Patch user with email {}.", email);

        var userAuthenticated = userRepository.findById(
                AuthUtils.getAutenticatedUser()
        ).orElseThrow(() -> new CustomAuthenticationException("Falha na autenticação."));

        var isUserAccount = userAuthenticated.getEmail().equalsIgnoreCase(email);

        boolean isAdmin;
        isAdmin = userAuthenticated.getRoles().stream()
                .anyMatch(role -> role.getName().equalsIgnoreCase(Role.Values.ADMIN.name()));

        var user = userRepository.findByEmail(email).orElseThrow(
                () -> new ResourceNotFoundException("Usuário não encontrato para o e-mail: " + email)
        );

        if (isAdmin || isUserAccount) {

            userMapper.updateEntityFromDto(dto, user);
            userRepository.save(user);

            return userMapper.toDTO(user);
        } else {
            throw new CustomAccessDeniedException("Sem permissão para atualizar esse cadastro.");
        }
    }

    @Transactional
    public void delete(String email) {
        logger.info("Delete user by email {}.", email);
        var entity = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Não foi encontrato registro para esse e-mail."));

        entity.getRoles().clear();
        userRepository.save(entity);

        userRepository.delete(entity);
    }




}
