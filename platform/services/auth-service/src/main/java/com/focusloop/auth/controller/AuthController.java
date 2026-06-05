package com.focusloop.auth.controller;

import com.focusloop.auth.dto.AuthDtos.LoginRequest;
import com.focusloop.auth.dto.AuthDtos.RefreshRequest;
import com.focusloop.auth.dto.AuthDtos.RegisterRequest;
import com.focusloop.auth.dto.AuthDtos.TokenPair;
import com.focusloop.auth.service.AuthService;
import com.focusloop.shared.dto.ApiEnvelope;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  ApiEnvelope<TokenPair> register(@Valid @RequestBody RegisterRequest request) {
    return ApiEnvelope.ok(authService.register(request));
  }

  @PostMapping("/login")
  ApiEnvelope<TokenPair> login(@Valid @RequestBody LoginRequest request) {
    return ApiEnvelope.ok(authService.login(request));
  }

  @PostMapping("/refresh")
  ApiEnvelope<TokenPair> refresh(@Valid @RequestBody RefreshRequest request) {
    return ApiEnvelope.ok(authService.refresh(request.refreshToken()));
  }
}
