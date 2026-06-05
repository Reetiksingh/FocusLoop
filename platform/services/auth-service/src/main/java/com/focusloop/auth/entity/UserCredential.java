package com.focusloop.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_credentials", schema = "auth")
public class UserCredential {
  @Id
  private UUID id = UUID.randomUUID();

  @Column(nullable = false, unique = true)
  private String email;

  @Column(name = "password_hash")
  private String passwordHash;

  @Column(name = "country_code", nullable = false)
  private String countryCode = "US";

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();

  protected UserCredential() {
  }

  public UserCredential(String email, String passwordHash, String countryCode) {
    this.email = email;
    this.passwordHash = passwordHash;
    this.countryCode = countryCode;
  }

  public UUID getId() {
    return id;
  }

  public String getEmail() {
    return email;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public String getCountryCode() {
    return countryCode;
  }
}
