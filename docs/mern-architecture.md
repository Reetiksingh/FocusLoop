# Life Pro MERN Architecture

## Product Principle

Life Pro is workflow-driven, not feature-driven:

Plan -> Focus -> Reflect

Every API, model, state slice, and component exists to reinforce that loop.

## Runtime Split

- `mern/client`: React application powered by Zustand and Vite
- `mern/server`: Express API with MongoDB persistence and JWT-based auth
- `docs`: Architecture notes, structure explanation, and interview prep

## Frontend Decisions

- React handles UI composition and rendering
- Zustand owns workflow state and persisted UI preferences
- Axios centralizes API calls and token refresh logic
- The UI is intentionally organized into:
  - `StatsHeader`
  - `PlanningPanel`
  - `ReflectionPanel`
  - `FocusPanel`

## Backend Decisions

- Express is split into routes, controllers, services, middleware, and models
- Authentication uses:
  - short-lived access token
  - refresh token cookie
  - protected route middleware
- MongoDB stores user-scoped workflow data
- `DailyActivity` keeps the heatmap and streak logic simple to query

## Persistence Strategy

- User identity persists through JWT + refresh cookie
- Workflow data persists in MongoDB
- UI preferences persist in Zustand local storage
- Active or paused focus sessions persist in MongoDB so users can resume after refresh

## Session Resume Strategy

- A focus session is stored with `status`, `remainingSeconds`, and `lastResumedAt`
- On `GET /sessions/active`, the server hydrates the remaining time
- If a running session has already elapsed, the server completes it and returns no active session

## Security Notes

- Passwords are hashed with bcrypt
- Refresh tokens are hashed before storage
- Protected routes require a bearer access token
- Helmet, CORS, and rate limiting are included in the server app setup

## Suggested Next Steps

1. Install dependencies in `mern/client` and `mern/server`
2. Set server environment values from `mern/server/.env.example`
3. Start MongoDB locally
4. Run server and client together
5. Add tests, deployment config, and stricter request validation before shipping publicly
