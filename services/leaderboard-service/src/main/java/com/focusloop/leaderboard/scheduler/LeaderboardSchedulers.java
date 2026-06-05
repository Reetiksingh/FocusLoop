package com.focusloop.leaderboard.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class LeaderboardSchedulers {
  private static final Logger log = LoggerFactory.getLogger(LeaderboardSchedulers.class);

  @Scheduled(cron = "0 0 0 * * MON")
  void rotateWeeklyBoards() {
    log.info("leaderboard_weekly_rotation_checkpoint");
  }

  @Scheduled(cron = "0 0 0 1 * *")
  void rotateMonthlyBoards() {
    log.info("leaderboard_monthly_rotation_checkpoint");
  }
}
