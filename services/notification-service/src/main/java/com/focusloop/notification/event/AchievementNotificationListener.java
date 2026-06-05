package com.focusloop.notification.event;

import com.focusloop.shared.events.AchievementUnlockedEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class AchievementNotificationListener {
  private final SimpMessagingTemplate messaging;

  public AchievementNotificationListener(SimpMessagingTemplate messaging) {
    this.messaging = messaging;
  }

  @KafkaListener(topics = AchievementUnlockedEvent.TOPIC, groupId = "notification-service")
  void onAchievement(AchievementUnlockedEvent event) {
    messaging.convertAndSendToUser(
        event.userId().toString(),
        "/queue/notifications",
        new NotificationPayload("ACHIEVEMENT_UNLOCKED", event.achievementName())
    );
  }

  public record NotificationPayload(String type, String message) {
  }
}
