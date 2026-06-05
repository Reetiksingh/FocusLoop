package com.focusloop.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public final class AuthDtos {
  private AuthDtos() {
  }

  public record RegisterRequest(
      @Email String email,
      @Size(min = 10, max = 128) String password,
      @NotBlank String displayName,
      @Size(min = 2, max = 2) String countryCode
  ) {
  }

  public record LoginRequest(@Email String email, @NotBlank String password) {
  }

  public record RefreshRequest(@NotBlank String refreshToken) {
  }

  public record TokenPair(String accessToken, String refreshToken, long expiresInSeconds) {
  }

  public record UserIdentity(UUID id, String email, String countryCode) {
  }
}
