package com.focusloop.auth.security;

import com.focusloop.auth.entity.UserCredential;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {
  private final SecretKey key;
  private final String issuer;
  private final Duration ttl;

  public JwtTokenService(
      @Value("${security.jwt.secret}") String secret,
      @Value("${security.jwt.issuer}") String issuer,
      @Value("${security.jwt.ttl}") Duration ttl
  ) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.issuer = issuer;
    this.ttl = ttl;
  }

  public String issue(UserCredential user) {
    Instant now = Instant.now();
    return Jwts.builder()
        .issuer(issuer)
        .subject(user.getId().toString())
        .claim("email", user.getEmail())
        .claim("countryCode", user.getCountryCode())
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plus(ttl)))
        .signWith(key)
        .compact();
  }

  public long expiresInSeconds() {
    return ttl.toSeconds();
  }
}
