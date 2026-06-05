package com.focusloop.session.service;

import com.focusloop.session.dto.SessionDtos.CompleteSessionRequest;
import com.focusloop.session.dto.SessionDtos.SessionResponse;
import com.focusloop.session.entity.FocusSession;
import com.focusloop.session.repository.FocusSessionRepository;
import com.focusloop.shared.events.FocusSessionCompletedEvent;
import java.util.Map;
import java.util.UUID;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FocusSessionService {
  private final FocusSessionRepository sessions;
  private final KafkaTemplate<String, FocusSessionCompletedEvent> kafka;

  public FocusSessionService(FocusSessionRepository sessions, KafkaTemplate<String, FocusSessionCompletedEvent> kafka) {
    this.sessions = sessions;
    this.kafka = kafka;
  }

  @Transactional
  public SessionResponse start(UUID userId, String countryCode, int plannedSeconds, UUID roomId) {
    sessions.findFirstByUserIdAndStatusOrderByStartedAtDesc(userId, FocusSession.Status.RUNNING)
        .ifPresent(active -> {
          throw new IllegalStateException("User already has a running focus session");
        });
    return toResponse(sessions.save(new FocusSession(userId, roomId, plannedSeconds)));
  }

  @Transactional
  public SessionResponse complete(UUID userId, UUID sessionId, String countryCode, CompleteSessionRequest request) {
    FocusSession session = sessions.findById(sessionId)
        .filter(candidate -> candidate.getUserId().equals(userId))
        .orElseThrow(() -> new IllegalArgumentException("Focus session not found"));
    session.recordIntegrity(
        request.focusedSeconds(),
        request.idleSeconds(),
        request.interruptionCount(),
        request.tabSwitchCount()
    );
    session.complete();
    FocusSession saved = sessions.save(session);
    kafka.send(FocusSessionCompletedEvent.TOPIC, userId.toString(), new FocusSessionCompletedEvent(
        UUID.randomUUID(),
        saved.getId(),
        saved.getUserId(),
        countryCode,
        saved.getFocusedSeconds(),
        saved.getIdleSeconds(),
        saved.getInterruptionCount(),
        saved.getTabSwitchCount(),
        saved.getFocusQualityScore(),
        saved.getStartedAt(),
        saved.getCompletedAt(),
        Map.of("qualityFormula", "100 - idle*0.04 - interruptions*4.5 - tabSwitches*2")
    ));
    return toResponse(saved);
  }

  private static SessionResponse toResponse(FocusSession session) {
    return new SessionResponse(
        session.getId(),
        session.getUserId(),
        session.getRoomId(),
        session.getStatus().name(),
        session.getPlannedSeconds(),
        session.getFocusedSeconds(),
        session.getFocusQualityScore(),
        session.getStartedAt(),
        session.getCompletedAt()
    );
  }
}
