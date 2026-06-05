package com.focusloop.session.controller;

import com.focusloop.session.dto.SessionDtos.CompleteSessionRequest;
import com.focusloop.session.dto.SessionDtos.SessionResponse;
import com.focusloop.session.dto.SessionDtos.StartSessionRequest;
import com.focusloop.session.service.FocusSessionService;
import com.focusloop.shared.dto.ApiEnvelope;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sessions")
public class FocusSessionController {
  private final FocusSessionService service;

  public FocusSessionController(FocusSessionService service) {
    this.service = service;
  }

  @PostMapping
  ApiEnvelope<SessionResponse> start(
      @RequestHeader("X-User-Id") UUID userId,
      @RequestHeader(value = "X-User-Country", defaultValue = "US") String countryCode,
      @Valid @RequestBody StartSessionRequest request
  ) {
    return ApiEnvelope.ok(service.start(userId, countryCode, request.plannedSeconds(), request.roomId()));
  }

  @PostMapping("/{sessionId}/complete")
  ApiEnvelope<SessionResponse> complete(
      @RequestHeader("X-User-Id") UUID userId,
      @RequestHeader(value = "X-User-Country", defaultValue = "US") String countryCode,
      @PathVariable UUID sessionId,
      @Valid @RequestBody CompleteSessionRequest request
  ) {
    return ApiEnvelope.ok(service.complete(userId, sessionId, countryCode, request));
  }
}
