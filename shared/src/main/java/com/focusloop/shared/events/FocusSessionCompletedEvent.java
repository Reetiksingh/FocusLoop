package com.focusloop.shared.events;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record FocusSessionCompletedEvent(
    UUID eventId,
    UUID sessionId,
    UUID userId,
    String countryCode,
    int durationSeconds,
    int idleSeconds,
    int interruptionCount,
    int tabSwitchCount,
    double focusQualityScore,
    Instant startedAt,
    Instant completedAt,
    Map<String, Object> integritySignals
) {
  public static final String TOPIC = "focus.session.completed.v1";
}
