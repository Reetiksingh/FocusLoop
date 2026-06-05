package com.focusloop.session.websocket;

import java.time.Instant;
import java.util.UUID;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class FocusRoomController {
  @MessageMapping("/rooms/{roomId}/presence")
  @SendTo("/topic/rooms/{roomId}/presence")
  RoomPresence publishPresence(@DestinationVariable UUID roomId, @Payload RoomPresence presence) {
    return new RoomPresence(roomId, presence.userId(), presence.displayName(), presence.state(), Instant.now());
  }

  public record RoomPresence(UUID roomId, UUID userId, String displayName, String state, Instant observedAt) {
  }
}
