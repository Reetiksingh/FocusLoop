package com.focusloop.auth.service;

import com.focusloop.auth.dto.AuthDtos.LoginRequest;
import com.focusloop.auth.dto.AuthDtos.RegisterRequest;
import com.focusloop.auth.dto.AuthDtos.TokenPair;
import com.focusloop.auth.entity.RefreshToken;
import com.focusloop.auth.entity.UserCredential;
import com.focusloop.auth.repository.RefreshTokenRepository;
import com.focusloop.auth.repository.UserCredentialRepository;
import com.focusloop.auth.security.JwtTokenService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
  private final UserCredentialRepository users;
  private final RefreshTokenRepository refreshTokens;
  private final PasswordEncoder passwordEncoder;
  private final JwtTokenService jwt;

  public AuthService(
      UserCredentialRepository users,
      RefreshTokenRepository refreshTokens,
      PasswordEncoder passwordEncoder,
      JwtTokenService jwt
  ) {
    this.users = users;
    this.refreshTokens = refreshTokens;
    this.passwordEncoder = passwordEncoder;
    this.jwt = jwt;
  }

  @Transactional
  public TokenPair register(RegisterRequest request) {
    users.findByEmailIgnoreCase(request.email()).ifPresent(existing -> {
      throw new IllegalArgumentException("Email is already registered");
    });
    UserCredential user = users.save(new UserCredential(
        request.email().toLowerCase(),
        passwordEncoder.encode(request.password()),
        request.countryCode().toUpperCase()
    ));
    return issuePair(user);
  }

  @Transactional
  public TokenPair login(LoginRequest request) {
    UserCredential user = users.findByEmailIgnoreCase(request.email())
        .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      throw new IllegalArgumentException("Invalid credentials");
    }
    return issuePair(user);
  }

  @Transactional
  public TokenPair refresh(String refreshToken) {
    RefreshToken stored = refreshTokens.findByTokenHash(hash(refreshToken))
        .filter(RefreshToken::isActive)
        .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));
    stored.revoke();
    UserCredential user = users.findById(stored.getUserId())
        .orElseThrow(() -> new IllegalArgumentException("User no longer exists"));
    return issuePair(user);
  }

  private TokenPair issuePair(UserCredential user) {
    String rawRefresh = UUID.randomUUID() + "." + UUID.randomUUID();
    refreshTokens.save(new RefreshToken(user.getId(), hash(rawRefresh), Instant.now().plus(Duration.ofDays(30))));
    return new TokenPair(jwt.issue(user), rawRefresh, jwt.expiresInSeconds());
  }

  private static String hash(String value) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      return Base64.getEncoder().encodeToString(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception ex) {
      throw new IllegalStateException("Unable to hash token", ex);
    }
  }
}
