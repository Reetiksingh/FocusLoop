package com.focusloop.shared.security;

import java.util.UUID;

public record AuthenticatedUser(UUID id, String email, String countryCode) {
}
