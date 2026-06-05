package com.focusloop.analytics.controller;

import com.focusloop.analytics.service.AnalyticsProjectionService;
import com.focusloop.shared.dto.ApiEnvelope;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {
  private final AnalyticsProjectionService analytics;

  public AnalyticsController(AnalyticsProjectionService analytics) {
    this.analytics = analytics;
  }

  @GetMapping("/daily")
  ApiEnvelope<Map<Object, Object>> daily(@RequestHeader("X-User-Id") UUID userId, @RequestParam LocalDate date) {
    return ApiEnvelope.ok(analytics.daily(userId, date));
  }

  @GetMapping("/insights")
  ApiEnvelope<?> insights(@RequestHeader("X-User-Id") UUID userId) {
    return ApiEnvelope.ok(analytics.insights(userId));
  }
}
