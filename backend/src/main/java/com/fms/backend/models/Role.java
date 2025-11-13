package com.fms.backend.models;

import jakarta.persistence.*;

import java.io.Serializable;

@Entity
@Table(name = "tb_roles")
public class Role implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Long roleId;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    public Long getRoleId() {
        return roleId;
    }

    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public enum Values {
        ADMIN(1L),
        BASIC(2L);

        Long roleId;

        Values(long roleId) {
            this.roleId = roleId;
        }

        public long getRoleId() {
            return roleId;
        }

    }
}