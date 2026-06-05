package com.focusloop.gateway.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.List;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Configuration
public class GatewaySecurityConfig {
  private static final List<String> PUBLIC_PATHS = List.of(
      "/api/v1/auth",
      "/actuator",
      "/ws/notifications"
  );

  @Bean
  GlobalFilter jwtPrincipalPropagationFilter(@Value("${security.jwt.secret}") String secret) {
    SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    return new JwtFilter(key);
  }

  @Bean
  KeyResolver userKeyResolver() {
    return exchange -> Mono.justOrEmpty(exchange.getRequest().getHeaders().getFirst("X-User-Id"))
        .switchIfEmpty(Mono.just(exchange.getRequest().getRemoteAddress() == null
            ? "anonymous"
            : exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()));
  }

  private static final class JwtFilter implements GlobalFilter, Ordered {
    private final SecretKey key;

    private JwtFilter(SecretKey key) {
      this.key = key;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
      String path = exchange.getRequest().getPath().value();
      if (PUBLIC_PATHS.stream().anyMatch(path::startsWith)) {
        return chain.filter(exchange);
      }

      String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
      if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
      }

      try {
        var claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(authHeader.substring(7)).getPayload();
        var mutated = exchange.getRequest().mutate()
            .header("X-User-Id", claims.getSubject())
            .header("X-User-Email", String.valueOf(claims.get("email")))
            .header("X-User-Country", String.valueOf(claims.get("countryCode", String.class)))
            .build();
        return chain.filter(exchange.mutate().request(mutated).build());
      } catch (RuntimeException ex) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
      }
    }

    @Override
    public int getOrder() {
      return -100;
    }
  }
}
