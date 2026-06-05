package com.focusloop.session.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.Instant;
import java.util.UUID;

public final class SessionDtos {
  private SessionDtos() {
  }

  public record StartSessionRequest(@Min(300) @Max(14400) int plannedSeconds, UUID roomId) {
  }

  public record CompleteSessionRequest(
      @Min(0) int focusedSeconds,
      @Min(0) int idleSeconds,
      @Min(0) int interruptionCount,
      @Min(0) int tabSwitchCount
  ) {
  }

  public record SessionResponse(
      UUID id,
      UUID userId,
      UUID roomId,
      String status,
      int plannedSeconds,
      int focusedSeconds,
      double focusQualityScore,
      Instant startedAt,
      Instant completedAt
  ) {
  }
}
