package com.fms.backend.controllers;

import com.fms.backend.dto.UserMeResponseDTO;
import com.fms.backend.dto.UserRequestDTO;
import com.fms.backend.dto.UserResponseDTO;
import com.fms.backend.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('SCOPE_BASIC') or hasAuthority('SCOPE_ADMIN')")
    public ResponseEntity<UserMeResponseDTO> getAuthenticatedUser(){
        return ResponseEntity.ok().body(userService.getAuthenticatedUser());
    }

    @PostMapping()
    public ResponseEntity<UserResponseDTO> create(@Validated @RequestBody UserRequestDTO userDTO){
        return ResponseEntity.ok().body(userService.create(userDTO));
    }

    @GetMapping()
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ResponseEntity<List<UserResponseDTO>> findAll(){
        return ResponseEntity.ok().body(userService.findAll());
    }

    @PatchMapping(value = "/{email}")
    public ResponseEntity<UserResponseDTO> patchUser(@PathVariable("email") String email, @RequestBody UserRequestDTO userDTO){
        return ResponseEntity.ok().body(userService.patchUser(email,userDTO));
    }

    @GetMapping(value = "/{email}")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ResponseEntity<UserResponseDTO> findByEmail(@PathVariable("email") String email){
        return ResponseEntity.ok().body(userService.findByEmail(email));
    }

    @DeleteMapping(value = "/{email}")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ResponseEntity<?> delete(@PathVariable("email") String email) {
        userService.delete(email);
        return ResponseEntity.noContent().build();
    }
}
