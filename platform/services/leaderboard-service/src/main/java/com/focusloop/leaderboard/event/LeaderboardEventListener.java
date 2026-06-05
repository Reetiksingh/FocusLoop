package com.focusloop.leaderboard.event;

import com.focusloop.leaderboard.service.LeaderboardService;
import com.focusloop.shared.events.FocusSessionCompletedEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class LeaderboardEventListener {
  private final LeaderboardService leaderboards;

  public LeaderboardEventListener(LeaderboardService leaderboards) {
    this.leaderboards = leaderboards;
  }

  @KafkaListener(topics = FocusSessionCompletedEvent.TOPIC, groupId = "leaderboard-service")
  void onCompleted(FocusSessionCompletedEvent event) {
    leaderboards.apply(event);
  }
}
