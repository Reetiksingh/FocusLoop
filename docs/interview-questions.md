# Life Pro Interview Questions and Answers

## Architecture

### 1. What problem does Life Pro solve?

Life Pro solves fragmented productivity by connecting planning, execution, and reflection inside one workflow-driven system.

### 2. Why is the app workflow-driven instead of feature-driven?

A workflow-driven app keeps every feature aligned with the user journey. In Life Pro, tasks, focus sessions, journals, and stats all support Plan -> Focus -> Reflect.

### 3. Why did you choose a MERN architecture?

MERN gives one JavaScript/TypeScript-friendly stack across client and server, simplifies data modeling with MongoDB, and supports fast iteration for user-facing productivity products.

### 4. Why did you split the frontend and backend into separate runtimes?

The frontend is optimized for interaction and UI state, while the backend handles auth, persistence, security, and business rules. Separating them improves maintainability and deployability.

### 5. Why did you use Express instead of a heavier framework?

Express is lightweight, flexible, and enough for a clean REST API with middleware, auth, validation, and modular route organization.

### 6. Why did you use MongoDB for this app?

MongoDB works well for document-style user workflow data such as tasks, journals, focus sessions, and daily activity aggregates. It also supports rapid schema evolution.

### 7. What makes the project production-ready?

The app includes modular architecture, JWT auth, hashed passwords, hashed refresh tokens, protected routes, persistent session recovery, compact activity tracking, and separation of concerns.

### 8. How is the code organized for scalability?

Controllers handle HTTP concerns, services hold business logic, models represent persistence, middleware handles cross-cutting concerns, and the client is split into state, components, and API services.

### 9. Why is separation of concerns important here?

Without separation of concerns, productivity features become tightly coupled and fragile. This app depends on task, session, journal, and stats logic staying coherent as the product grows.

### 10. How would you extend the system later?

I would add notifications, analytics, recurring routines, collaboration, and test coverage without changing the core workflow contract.

## Authentication and Security

### 11. How does authentication work in Life Pro?

Users register or log in with email and password. The server returns an access token and sets a refresh token cookie. Protected API routes require the access token.

### 12. Why use bcrypt for passwords?

Bcrypt is a slow hashing algorithm designed for passwords, which makes brute-force attacks more expensive than storing plain or weakly hashed passwords.

### 13. Why use JWT access tokens?

JWT access tokens let the client authenticate API requests statelessly and efficiently across protected routes.

### 14. Why use refresh tokens as well?

Refresh tokens reduce the lifetime of access tokens while keeping the user experience smooth. They let the client recover a new access token without forcing frequent logins.

### 15. Why store the refresh token in a cookie?

An HTTP-only cookie reduces direct JavaScript access to the refresh token and makes token rotation safer than storing both tokens in localStorage.

### 16. Why hash the refresh token in the database?

Hashing refresh tokens means the raw token is never stored server-side, which reduces damage if database contents are exposed.

### 17. How do protected routes work?

The client sends a bearer access token, middleware verifies it, and the request is allowed only if the token is valid.

### 18. How does the client recover from an expired access token?

An Axios interceptor calls the refresh endpoint, stores the new access token, and retries the original request automatically.

### 19. What security middleware is used on the server?

Helmet, CORS configuration, rate limiting on auth routes, cookie parsing, and centralized error handling are included.

### 20. How would you improve auth further for production?

I would add email verification, password reset flows, refresh token rotation history, audit logging, and stronger validation.

## Database Design

### 21. What collections does the system use?

The system uses `User`, `Task`, `Journal`, `FocusSession`, and `DailyActivity`.

### 22. Why is `Journal` separate from `Task`?

Tasks represent execution units, while journals represent daily reflection and intention. They change at different rates and serve different parts of the workflow.

### 23. Why is `FocusSession` its own model?

Focus sessions are event-like records with timing, status, and persistence requirements. They should not be embedded inside tasks if we want history and resume support.

### 24. What is stored in `DailyActivity`?

It stores per-day aggregates such as completed task count, focus session count, reflection status, and a combined activity score for heatmap and streak queries.

### 25. Why use a daily aggregate model instead of calculating everything on the fly?

The aggregate model makes heatmap and streak reads cheaper and simpler, while raw models still preserve the source of truth.

### 26. How are tasks tied to a date?

Each task includes a `date` field and is indexed by `userId + date`, which aligns planning and daily views to one selected day.

### 27. Why does a task track `requiresFocus`?

Some tasks need deep work and some are instant or passive. That field lets the app distinguish between focus-driven tasks and quick completions.

### 28. Why does a task track `completedWithoutFocus`?

It makes the quick-win flow explicit, which improves analytics, UI messaging, and interview clarity around product behavior.

### 29. Why track `focusSessionCount` on the task model?

It provides fast task-level insight without requiring a full aggregation query every time the planning panel renders.

### 30. What indexes are important in this design?

`userId + date` indexes are important across tasks, journals, sessions, and daily activity because most reads are user-scoped and date-scoped.

## API Design

### 31. What are the main API groups?

The API groups are `/auth`, `/tasks`, `/sessions`, `/journal`, and `/stats`.

### 32. Why use REST here?

REST is simple, interview-friendly, and matches the domain resources of the app clearly.

### 33. What does `/auth/register` do?

It creates a user, hashes the password, issues tokens, and returns a safe user payload.

### 34. What does `/tasks` handle?

It supports listing tasks by date, creating tasks, updating task status or metadata, and deleting tasks.

### 35. What does `/sessions/active` do?

It returns the currently running or paused focus session for the user and hydrates the remaining time if necessary.

### 36. Why does the journal endpoint use a date parameter?

Reflection in Life Pro is daily, so `GET /journal/:date` and `PUT /journal/:date` map directly to the product model.

### 37. What does `/stats/summary` return?

It returns task counts, focus session counts, reflection status, and the current active streak for a selected date.

### 38. What does `/stats/heatmap` return?

It returns compact day-level activity entries with a score and activity intensity level for rendering the heatmap.

### 39. Why are stats separated from tasks and sessions?

The UI needs summary-oriented reads that are different from CRUD resource reads, so a dedicated stats boundary keeps the API cleaner.

### 40. How would you version this API in the future?

I would add a version prefix such as `/api/v1` and preserve backward compatibility during breaking changes.

## Frontend and State Management

### 41. Why use React for Life Pro?

React is well-suited for component-driven interfaces where multiple panels share state and update independently.

### 42. Why use Zustand instead of Context only?

Zustand keeps global state lightweight and avoids prop drilling or heavy reducer boilerplate while staying simple enough for interview discussion.

### 43. What state lives in the auth store?

User identity, auth status, auth mode, auth errors, and login or registration actions live in the auth store.

### 44. What state lives in the workflow store?

Selected date, tasks, journal draft, summary stats, heatmap data, active task, active session, current phase, and timer settings live in the workflow store.

### 45. Why persist only part of the workflow store in local storage?

UI preferences like selected date and timer settings are good to persist locally, but server-owned data such as tasks and sessions should come from the backend.

### 46. How does the client restore an interrupted session?

On dashboard load, the client fetches `/sessions/active` and restores the active or paused session into the workflow store.

### 47. Why is the heatmap kept compact?

The heatmap is a signal, not the main task surface. Shrinking it to a GitHub-style footprint preserves visibility without dominating the screen.

### 48. Why is the layout split into top panels and a full-width bottom panel?

Planning and reflection are context-setting activities, while focus is the main execution surface. The layout reinforces that hierarchy.

### 49. How is responsive design handled?

The dashboard uses CSS grid and responsive breakpoints so the two-panel top layout collapses cleanly on smaller screens.

### 50. Why is the UI minimal rather than feature-heavy?

This product is about discipline and flow. A minimal UI reduces friction and helps the workflow stay understandable.

## Focus System

### 51. Why does the timer allow 0 to 60 minutes?

Zero-minute sessions support instant focus logging, while 60 minutes covers deep work without overcomplicating the product.

### 52. Why also support “Mark as done without focus” if 0-minute sessions exist?

They serve different user intents. A 0-minute session still records execution inside the focus system, while quick completion skips focus entirely.

### 53. How is a focus session persisted?

The server stores the session with its status, remaining seconds, task reference, and resume timestamps in MongoDB.

### 54. How does pause and resume work?

Pause stores the remaining seconds and changes the session status. Resume reactivates the session and resets the `lastResumedAt` timestamp.

### 55. Why are break sessions modeled too?

Breaks are part of the execution workflow, not separate from it, so the system keeps them visible in the same focus engine.

### 56. How is a task connected to focus sessions?

A focus session references a task, and when the session completes it increments that task’s focus session count.

### 57. Why not auto-complete a task after every focus session?

Many meaningful tasks take multiple sessions. Tracking focus separately from task completion better matches real work.

### 58. How would you support custom Pomodoro presets later?

I would store per-user timer presets in the user profile or a settings collection and expose them through the workflow store.

### 59. How is session completion reflected in stats?

Completed focus sessions update the daily activity aggregate, which feeds both summary cards and the heatmap.

### 60. What makes the focus system interview-worthy?

It combines timer logic, persistence, resume behavior, audio controls, task linkage, and analytics inside one coherent feature.

## Sound System

### 61. Why was the original sound system unreliable?

Static prototypes often hardcode asset paths and ignore browser autoplay behavior, which causes inconsistent playback.

### 62. How is audio handled in the React version?

The focus panel uses `Audio` instances for looping ambient playback and separate preview playback, with explicit play and stop controls.

### 63. Why keep sound assets in `client/public/sounds`?

Vite serves public assets directly, which gives predictable browser paths like `/sounds/rain.mp3`.

### 64. How do you prevent ambient sound from stacking?

The UI stops any current audio before starting new playback, so only one sound source runs at a time.

### 65. How do you handle browser autoplay restrictions?

The UI exposes an explicit preview button and surfaces a message if autoplay is blocked, giving the user a direct interaction path.

## Scaling and Quality

### 66. What would you add next to improve maintainability?

I would add schema validation, service-level tests, frontend integration tests, and a shared contract layer for request and response types.

### 67. How would you deploy the backend?

I would containerize it or deploy it to a Node-friendly platform, connect a managed MongoDB instance, and inject secrets through environment variables.

### 68. How would you deploy the frontend?

I would build the Vite app into static assets and host it on a CDN-backed platform, with the API base URL configured through environment variables.

### 69. How would you observe production issues?

I would add structured logging, request tracing, client-side error reporting, uptime checks, and analytics around session usage.

### 70. How would you explain this project in one sentence during an interview?

Life Pro is a workflow-first MERN productivity system that connects daily planning, persistent focus sessions, and reflection into one scalable product architecture.
