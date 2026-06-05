package com.focusloop.session.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "focus_sessions", schema = "focus")
public class FocusSession {
  @Id
  private UUID id = UUID.randomUUID();

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(name = "room_id")
  private UUID roomId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Status status = Status.RUNNING;

  @Column(name = "planned_seconds", nullable = false)
  private int plannedSeconds;

  @Column(name = "focused_seconds", nullable = false)
  private int focusedSeconds;

  @Column(name = "idle_seconds", nullable = false)
  private int idleSeconds;

  @Column(name = "interruption_count", nullable = false)
  private int interruptionCount;

  @Column(name = "tab_switch_count", nullable = false)
  private int tabSwitchCount;

  @Column(name = "focus_quality_score", nullable = false)
  private double focusQualityScore = 100;

  @Column(name = "started_at", nullable = false)
  private Instant startedAt = Instant.now();

  @Column(name = "completed_at")
  private Instant completedAt;

  protected FocusSession() {
  }

  public FocusSession(UUID userId, UUID roomId, int plannedSeconds) {
    this.userId = userId;
    this.roomId = roomId;
    this.plannedSeconds = plannedSeconds;
  }

  public void recordIntegrity(int focusedSeconds, int idleSeconds, int interruptions, int tabSwitches) {
    this.focusedSeconds = focusedSeconds;
    this.idleSeconds = idleSeconds;
    this.interruptionCount = interruptions;
    this.tabSwitchCount = tabSwitches;
    double penalty = idleSeconds * 0.04 + interruptions * 4.5 + tabSwitches * 2.0;
    this.focusQualityScore = Math.max(0, Math.min(100, 100 - penalty));
  }

  public void complete() {
    this.status = Status.COMPLETED;
    this.completedAt = Instant.now();
  }

  public UUID getId() { return id; }
  public UUID getUserId() { return userId; }
  public UUID getRoomId() { return roomId; }
  public Status getStatus() { return status; }
  public int getPlannedSeconds() { return plannedSeconds; }
  public int getFocusedSeconds() { return focusedSeconds; }
  public int getIdleSeconds() { return idleSeconds; }
  public int getInterruptionCount() { return interruptionCount; }
  public int getTabSwitchCount() { return tabSwitchCount; }
  public double getFocusQualityScore() { return focusQualityScore; }
  public Instant getStartedAt() { return startedAt; }
  public Instant getCompletedAt() { return completedAt; }

  public enum Status { RUNNING, PAUSED, COMPLETED, ABANDONED }
}
