package com.focusloop.shared.events;

import java.time.Instant;
import java.util.UUID;

public record AchievementUnlockedEvent(
    UUID eventId,
    UUID userId,
    String achievementCode,
    String achievementName,
    Instant unlockedAt
) {
  public static final String TOPIC = "achievement.unlocked.v1";
}
