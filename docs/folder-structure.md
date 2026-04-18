# Life Pro Folder Structure

## Overview

The codebase is divided by runtime responsibility:

- `mern/client`: browser UI and interaction layer
- `mern/server`: API, auth, and persistence layer
- `docs`: explanation and interview prep

## Why This Structure Works

### Client

- `src/components/auth`: login and registration UI
- `src/components/dashboard`: workflow panels and dashboard composition
- `src/store`: Zustand stores for auth and workflow state
- `src/services`: API client and token handling
- `src/lib`: lightweight shared utilities
- `public/sounds`: browser-servable ambient audio files

This keeps UI logic, state logic, and network logic separated.

### Server

- `src/config`: environment and database setup
- `src/controllers`: request handling and response shaping
- `src/middleware`: auth and global error handling
- `src/models`: MongoDB schemas
- `src/routes`: API route wiring
- `src/services`: business logic shared across controllers
- `src/utils`: reusable helpers

This prevents route files from becoming bloated and keeps business rules testable.

## Workflow Mapping

- Planning:
  - `PlanningPanel`
  - `/tasks`
  - `Task` model
- Focus:
  - `FocusPanel`
  - `/sessions`
  - `FocusSession` model
- Reflection:
  - `ReflectionPanel`
  - `/journal`
  - `Journal` model
- Consistency:
  - `StatsHeader`
  - `/stats`
  - `DailyActivity` model
