# Life Pro MERN Architecture

## Core Principle

Life Pro is workflow-driven:

Plan -> Focus -> Reflect

Every screen, API, model, and state slice should support this loop.

## Recommended Stack

- Frontend: React + Vite + Zustand + React Router
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT access token with refresh token cookie
- Validation: Zod on client and server
- Styling: CSS modules or Tailwind if the team prefers utility-first

## Frontend Architecture

Use a page shell with four primary workflow components:

- `StatsHeader`
- `PlanningPanel`
- `ReflectionPanel`
- `FocusPanel`

Recommended client state slices:

- `auth`
- `planner`
- `focus`
- `reflection`
- `stats`
- `ui`

Zustand should own UI state and optimistic workflow state. Server data should sync through an API layer and revalidate after mutations.

## Backend Architecture

Recommended API surface:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/tasks?date=YYYY-MM-DD`
- `POST /api/tasks`
- `PATCH /api/tasks/:taskId`
- `DELETE /api/tasks/:taskId`
- `GET /api/journal/:date`
- `PUT /api/journal/:date`
- `POST /api/sessions`
- `GET /api/stats/summary?date=YYYY-MM-DD`
- `GET /api/stats/heatmap?days=90`

## MongoDB Model Direction

### User

- email
- passwordHash
- profile
- timezone

### Day

- userId
- date
- intention
- journal
- reflectionCompleted
- activityScore

### Task

- userId
- date
- title
- status
- skipFocus
- completedWithoutFocus
- focusSessionCount
- completedAt

### FocusSession

- userId
- date
- taskId
- sessionType
- durationMinutes
- startedAt
- endedAt
- completed
- ambientSound

## Scaling Notes

- Keep all records user-scoped with compound indexes on `userId + date`
- Derive streaks from stored activity score or a nightly aggregation
- Store raw events like sessions, then compute summaries for dashboards
- Keep timer state local on the client, but persist completed focus sessions to the server
- Avoid tying journal, tasks, and focus state to separate incompatible schemas

## Recommended Rollout

1. Move the current static workflow into React components.
2. Add Zustand with the same state shape already used in the rewritten browser app.
3. Add Express auth and protected routes.
4. Persist tasks, journal, and sessions in MongoDB.
5. Add daily summary aggregation and heatmap endpoints.
