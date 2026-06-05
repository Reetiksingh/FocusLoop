package com.focusloop.shared.dto;

import java.time.Instant;

public record ApiEnvelope<T>(T data, Instant timestamp) {
  public static <T> ApiEnvelope<T> ok(T data) {
    return new ApiEnvelope<>(data, Instant.now());
  }
}
