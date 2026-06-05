package com.focusloop.leaderboard.service;

import com.focusloop.leaderboard.dto.LeaderboardDtos.LeaderboardEntry;
import com.focusloop.shared.events.FocusSessionCompletedEvent;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations.TypedTuple;
import org.springframework.stereotype.Service;

@Service
public class LeaderboardService {
  private final StringRedisTemplate redis;

  public LeaderboardService(StringRedisTemplate redis) {
    this.redis = redis;
  }

  public void apply(FocusSessionCompletedEvent event) {
    String userId = event.userId().toString();
    double score = event.durationSeconds();
    redis.opsForZSet().incrementScore("leaderboard:global:all-time", userId, score);
    redis.opsForZSet().incrementScore("leaderboard:global:weekly:" + weekKey(), userId, score);
    redis.opsForZSet().incrementScore("leaderboard:global:monthly:" + monthKey(), userId, score);
    redis.opsForZSet().incrementScore("leaderboard:country:" + event.countryCode() + ":all-time", userId, score);
  }

  public List<LeaderboardEntry> top(String scope, String period, int limit) {
    String key = "leaderboard:" + scope + ":" + period;
    var tuples = redis.opsForZSet().reverseRangeWithScores(key, 0, Math.max(0, limit - 1));
    List<LeaderboardEntry> entries = new ArrayList<>();
    if (tuples == null) {
      return entries;
    }
    long rank = 1;
    for (TypedTuple<String> tuple : tuples) {
      entries.add(new LeaderboardEntry(tuple.getValue(), rank++, tuple.getScore() == null ? 0 : tuple.getScore()));
    }
    return entries;
  }

  private static String weekKey() {
    LocalDate now = LocalDate.now();
    return now.getYear() + "-W" + DateTimeFormatter.ofPattern("ww").format(now);
  }

  private static String monthKey() {
    return DateTimeFormatter.ofPattern("yyyy-MM").format(LocalDate.now());
  }
}
