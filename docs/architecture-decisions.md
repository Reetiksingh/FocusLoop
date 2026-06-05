# Architecture Decisions

## ADR-001: Microservices Over Monolith

FocusLoop is decomposed by business capability rather than technical layer. Auth, user profiles, focus sessions, analytics, leaderboards, and notifications each own their runtime and data access boundaries. The gateway centralizes ingress concerns without becoming a business orchestrator.

## ADR-002: PostgreSQL as System of Record

PostgreSQL stores durable identity, session, analytics, and achievement records. Redis is used for hot projections and ranking operations, not as the source of truth.

## ADR-003: Redis Sorted Sets for Leaderboards

Leaderboards require high-frequency score increments and ranked reads. Redis Sorted Sets provide `ZINCRBY`, `ZREVRANGE`, and rank lookup semantics without expensive relational aggregation.

## ADR-004: Kafka for Completion Events

Focus session completion fans out to analytics, leaderboard, achievements, and notifications. Kafka decouples session writes from downstream projection latency and allows replay-driven rebuilds.

## ADR-005: No Admin Role

Every account is a normal user. The product deliberately avoids an admin dashboard, role hierarchy, and permission management surface because they do not support the core productivity analytics identity.

## ADR-006: Gateway Principal Propagation

Internal services trust gateway-propagated identity headers in local development. Production deployments should enforce network boundaries, mTLS, or signed internal headers so service endpoints cannot be spoofed directly.
