package com.focusloop.notification.controller;

import com.focusloop.shared.dto.ApiEnvelope;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {
  @GetMapping
  ApiEnvelope<List<String>> recent() {
    return ApiEnvelope.ok(List.of());
  }
}
