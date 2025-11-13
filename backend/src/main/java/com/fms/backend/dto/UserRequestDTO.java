package com.fms.backend.dto;

import com.fms.backend.models.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.util.Set;

public class UserRequestDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "O nome é obrigatório.")
    String name;

    @NotBlank(message = "O e-mail é obrigatório.")
    @Email(message = "O e-mail deve ser válido.")
    String email;

    @NotBlank(message = "A senha é obrigatória.")
    @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres.")
    String password;

    private Set<Role> roles;

    public UserRequestDTO() {
    }

    public UserRequestDTO(String name, String email, String password, Set<Role> roles) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.roles = roles;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }
}
