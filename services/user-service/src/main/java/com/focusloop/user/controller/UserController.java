package com.focusloop.user.controller;

import com.focusloop.shared.dto.ApiEnvelope;
import com.focusloop.user.entity.UserProfile;
import com.focusloop.user.repository.UserProfileRepository;
import java.util.UUID;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
  private final UserProfileRepository profiles;

  public UserController(UserProfileRepository profiles) {
    this.profiles = profiles;
  }

  @GetMapping("/me")
  @Cacheable(value = "user-profile", key = "#userId")
  ApiEnvelope<UserProfile> me(@RequestHeader("X-User-Id") UUID userId) {
    return ApiEnvelope.ok(profiles.findById(userId)
        .orElseGet(() -> profiles.save(new UserProfile(userId, "FocusLoop User", "US", "UTC"))));
  }
}
