# API Design

## Auth

`POST /api/v1/auth/register`

```json
{
  "email": "user@example.com",
  "password": "minimum-10-chars",
  "displayName": "Mira",
  "countryCode": "IN"
}
```

`POST /api/v1/auth/login`

```json
{
  "email": "user@example.com",
  "password": "minimum-10-chars"
}
```

`POST /api/v1/auth/refresh`

```json
{
  "refreshToken": "opaque-refresh-token"
}
```

## Sessions

`POST /api/v1/sessions`

```json
{
  "plannedSeconds": 5400,
  "roomId": "6d503d1f-1131-4c2a-9a93-b8b6dcf8db02"
}
```

`POST /api/v1/sessions/{sessionId}/complete`

```json
{
  "focusedSeconds": 5100,
  "idleSeconds": 120,
  "interruptionCount": 2,
  "tabSwitchCount": 3
}
```

## Analytics

`GET /api/v1/analytics/daily?date=2026-05-28`

`GET /api/v1/analytics/insights`

## Leaderboards

`GET /api/v1/leaderboards?scope=global&period=all-time&limit=50`

Supported scope examples:

- `global`
- `country:US`
- `country:IN`

Supported periods:

- `all-time`
- `weekly:{yyyy-Www}`
- `monthly:{yyyy-MM}`
