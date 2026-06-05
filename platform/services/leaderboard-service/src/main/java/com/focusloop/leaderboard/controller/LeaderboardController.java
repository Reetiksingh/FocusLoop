package com.focusloop.leaderboard.controller;

import com.focusloop.leaderboard.dto.LeaderboardDtos.LeaderboardResponse;
import com.focusloop.leaderboard.service.LeaderboardService;
import com.focusloop.shared.dto.ApiEnvelope;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/leaderboards")
public class LeaderboardController {
  private final LeaderboardService service;

  public LeaderboardController(LeaderboardService service) {
    this.service = service;
  }

  @GetMapping
  ApiEnvelope<LeaderboardResponse> top(
      @RequestParam(defaultValue = "global") String scope,
      @RequestParam(defaultValue = "all-time") String period,
      @RequestParam(defaultValue = "50") int limit
  ) {
    return ApiEnvelope.ok(new LeaderboardResponse(scope, period, service.top(scope, period, Math.min(limit, 100))));
  }
}
