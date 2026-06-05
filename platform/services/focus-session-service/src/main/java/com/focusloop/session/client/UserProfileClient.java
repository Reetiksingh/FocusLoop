package com.focusloop.session.client;

import java.util.UUID;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "user-service", url = "${clients.user-service.url:http://localhost:8082}")
public interface UserProfileClient {
  @GetMapping("/api/v1/users/me")
  Object currentUser(@RequestHeader("X-User-Id") UUID userId);
}
