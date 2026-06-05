package com.focusloop.leaderboard.dto;

import java.util.List;

public final class LeaderboardDtos {
  private LeaderboardDtos() {
  }

  public record LeaderboardEntry(String userId, long rank, double scoreSeconds) {
  }

  public record LeaderboardResponse(String scope, String period, List<LeaderboardEntry> entries) {
  }
}
