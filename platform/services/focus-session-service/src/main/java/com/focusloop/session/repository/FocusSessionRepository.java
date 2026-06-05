package com.focusloop.session.repository;

import com.focusloop.session.entity.FocusSession;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FocusSessionRepository extends JpaRepository<FocusSession, UUID> {
  Optional<FocusSession> findFirstByUserIdAndStatusOrderByStartedAtDesc(UUID userId, FocusSession.Status status);
}
