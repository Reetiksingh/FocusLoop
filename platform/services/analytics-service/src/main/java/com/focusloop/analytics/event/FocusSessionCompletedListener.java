package com.focusloop.analytics.event;

import com.focusloop.analytics.service.AnalyticsProjectionService;
import com.focusloop.shared.events.FocusSessionCompletedEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class FocusSessionCompletedListener {
  private final AnalyticsProjectionService projections;

  public FocusSessionCompletedListener(AnalyticsProjectionService projections) {
    this.projections = projections;
  }

  @KafkaListener(topics = FocusSessionCompletedEvent.TOPIC, groupId = "analytics-service")
  void onCompleted(FocusSessionCompletedEvent event) {
    projections.apply(event);
  }
}
