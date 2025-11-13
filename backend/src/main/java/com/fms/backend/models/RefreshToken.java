package com.fms.backend.models;

import jakarta.persistence.*;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "tb_tokens")
public class RefreshToken implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Instant expiryDate;

    @Column(length = 255)
    private String tokenHash;

    @Column(length = 255)
    private String userAgent;

    @Column(length = 50)
    private String ip;

    public RefreshToken() {
    }

    public RefreshToken(Long id, String token, User user, Instant expiryDate, String tokenHash, String userAgent, String ip) {
        this.id = id;
        this.token = token;
        this.user = user;
        this.expiryDate = expiryDate;
        this.tokenHash = tokenHash;
        this.userAgent = userAgent;
        this.ip = ip;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Instant getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(Instant expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getIp() {
        return ip;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RefreshToken that)) return false;
        return Objects.equals(getId(), that.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }
}
