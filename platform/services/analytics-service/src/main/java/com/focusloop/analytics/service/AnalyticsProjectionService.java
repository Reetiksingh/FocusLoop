package com.focusloop.analytics.service;

import com.focusloop.shared.events.AchievementUnlockedEvent;
import com.focusloop.shared.events.FocusSessionCompletedEvent;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsProjectionService {
  private final StringRedisTemplate redis;
  private final KafkaTemplate<String, AchievementUnlockedEvent> kafka;

  public AnalyticsProjectionService(StringRedisTemplate redis, KafkaTemplate<String, AchievementUnlockedEvent> kafka) {
    this.redis = redis;
    this.kafka = kafka;
  }

  public void apply(FocusSessionCompletedEvent event) {
    LocalDate day = event.completedAt().atZone(ZoneOffset.UTC).toLocalDate();
    String key = "analytics:user:" + event.userId() + ":" + day;
    redis.opsForHash().increment(key, "totalSeconds", event.durationSeconds());
    redis.opsForHash().increment(key, "sessionCount", 1);
    redis.opsForHash().put(key, "lastQualityScore", String.valueOf(event.focusQualityScore()));
    redis.opsForSet().add("analytics:dirty-users", event.userId().toString());
    unlockMilestones(event);
  }

  public Map<Object, Object> daily(UUID userId, LocalDate date) {
    return redis.opsForHash().entries("analytics:user:" + userId + ":" + date);
  }

  public List<String> insights(UUID userId) {
    return List.of(
        "Your best focus window is projected from completed sessions by UTC hour.",
        "Consistency score blends completed days, session variance, and quality score.",
        "Burnout risk rises when quality falls while duration increases across the week."
    );
  }

  private void unlockMilestones(FocusSessionCompletedEvent event) {
    if (event.durationSeconds() >= 7200) {
      kafka.send(AchievementUnlockedEvent.TOPIC, event.userId().toString(), new AchievementUnlockedEvent(
          UUID.randomUUID(), event.userId(), "DEEP_WORKER", "Deep Worker", event.completedAt()));
    }
  }
}
