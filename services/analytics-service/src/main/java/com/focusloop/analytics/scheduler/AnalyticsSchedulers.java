package com.focusloop.analytics.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AnalyticsSchedulers {
  private static final Logger log = LoggerFactory.getLogger(AnalyticsSchedulers.class);

  @Scheduled(cron = "0 5 0 * * *")
  void recalculateStreaks() {
    log.info("scheduled_streak_recalculation_started");
  }

  @Scheduled(cron = "0 0 8 * * MON")
  void createWeeklySummaries() {
    log.info("scheduled_weekly_productivity_summaries_started");
  }
}
