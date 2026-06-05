package com.focusloop.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_profiles", schema = "identity")
public class UserProfile {
  @Id
  @Column(name = "user_id")
  private UUID userId;

  @Column(name = "display_name", nullable = false)
  private String displayName;

  @Column(name = "avatar_url")
  private String avatarUrl;

  @Column(name = "country_code", nullable = false)
  private String countryCode = "US";

  @Column(nullable = false)
  private String timezone = "UTC";

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt = Instant.now();

  protected UserProfile() {
  }

  public UserProfile(UUID userId, String displayName, String countryCode, String timezone) {
    this.userId = userId;
    this.displayName = displayName;
    this.countryCode = countryCode;
    this.timezone = timezone;
  }

  public UUID getUserId() { return userId; }
  public String getDisplayName() { return displayName; }
  public String getAvatarUrl() { return avatarUrl; }
  public String getCountryCode() { return countryCode; }
  public String getTimezone() { return timezone; }
  public Instant getUpdatedAt() { return updatedAt; }
}
