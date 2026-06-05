package com.focusloop.auth.repository;

import com.focusloop.auth.entity.UserCredential;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserCredentialRepository extends JpaRepository<UserCredential, UUID> {
  Optional<UserCredential> findByEmailIgnoreCase(String email);
}
