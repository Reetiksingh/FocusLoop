package com.focusloop.shared.dto;

import java.time.Instant;
import java.util.Map;

public record ErrorResponse(
    String code,
    String message,
    String path,
    Map<String, String> validation,
    Instant timestamp
) {
  public static ErrorResponse of(String code, String message, String path) {
    return new ErrorResponse(code, message, path, Map.of(), Instant.now());
  }
}
