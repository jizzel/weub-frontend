# Weub Frontend Development Guidelines

## Overview

Weub is a minimal video-sharing application enabling anonymous users to upload, search, and stream videos in adaptive quality. This document outlines best practices, component architecture, integration flows, and conventions to ensure consistent, efficient, and scalable frontend development using Angular 20, Tailwind CSS, and hls.js.

## Current Project State

The project is currently in its initial setup phase with a basic Angular 20 application structure. The guidelines below represent the target architecture and best practices to be implemented as the project evolves.

## Recommended Folder Structure

The project should follow a modular and feature-driven structure:

* `core/`: Cross-cutting concerns (API, services, interceptors, constants, models, etc.)
* `shared/`: UI components, directives, pipes, and validators reusable across features
* `features/`: Feature-based modules like upload, video list, video detail, playback
* `layout/`: App layout components like header/footer wrappers
* `assets/`: Images, icons, and stylesheets
* `environments/`: Environment-specific config

Follow this structure strictly for scalability and maintainability.

## Functional Requirements Coverage

| Feature              | Recommended Location in Codebase               |
| -------------------- | ---------------------------------------------- |
| Video Upload         | `features/video-upload/`                       |
| Transcoding Feedback | `video-detail > processing-status.component`   |
| Video Listing/Search | `features/video-list/`                         |
| Video Playback (HLS) | `features/video-player/`                       |
| Adaptive Streaming   | `video-player/hls-player` + `quality-selector` |
| System Status        | `features/system-stats/`                       |

## Backend API Integration

Base URL should be configured from `environment.ts`.

### Upload

* Endpoint: `POST /videos/upload`
* Service: `upload.service.ts`
* UI: `upload-form.component`

### Video List

* Endpoint: `GET /videos`
* Service: `video.service.ts`
* UI: `video-list.component`, `video-card.component`

### Video Detail / Status

* Endpoints: `GET /videos/{id}`, `GET /videos/{id}/status`
* Service: `video.service.ts`
* UI: `video-detail.component`, `processing-status.component`

### Stream

* Master Playlist: `GET /stream/{id}/{resolution}/playlist.m3u8`
* Segments: `GET /stream/{id}/{resolution}/{segment}`

Handled via hls.js in `hls-player.component.ts`.

## Component Guidelines

### Naming

Use kebab-case for file names and PascalCase for component class names.

### State Management

Local state should live within services under `features/<feature>/services/`. Use RxJS `BehaviorSubject` or Signal APIs.

### UI/UX

* Tailwind CSS for styling (to be added to the project)
* Angular Material for form controls or modals (to be added to the project)
* Upload form should validate:
  * Video types: mp4, mov, avi, webm
  * Max size: 2GB (validated client-side)

### Feedback

Use `notification.service.ts` to display:
* Upload success/failure
* Processing status ("queued", "processing", "ready", "failed")

## Search and Filters

Use:
* `search-bar.component` for title search
* `video-filters.component` for tags, upload date, resolution
* Connect via `filter.service.ts` and `video-list-state.service.ts`

## Video Player

Use hls.js via `hls-player.component.ts`:

```ts
if (Hls.isSupported()) {
  const hls = new Hls();
  hls.loadSource(url);
  hls.attachMedia(videoElement);
}
```

Use `quality-selector.component` for resolution control.

## Error Handling

Handle errors globally via:
* `error.interceptor.ts` (HTTP errors)
* `error-message.component.ts` (user display)

Use `error-handler.service.ts` for error formatting logic.

## System Stats

Display data from:
* `GET /health`
* `GET /stats`

In `system-stats.component` and its children.

## Testing

Use Cypress for E2E:
* Test cases in `cypress/e2e/`
* Include scenarios:
  * Upload + status polling
  * Playback of ready videos
  * Search + filtering logic

Use Angular component tests via `.spec.ts` files.

## Linting, Formatting & Commits

* ESLint + Prettier should be enforced
* Run `npm run lint` before commits
* Commit messages should follow Conventional Commits

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`.

## Deployment

```bash
npm run build
```

Artifacts will be in `/dist/weub-frontend`. Serve with backend using `ServeStaticModule`.

## Contribution Workflow

1. Fork feature from `main`
2. Naming convention: `feature/video-search`, `fix/player-bug`
3. PRs must:
  * Pass all tests
  * Include meaningful commits
  * Be reviewed by another contributor

## Next Steps for Project Setup

1. Install and configure Tailwind CSS
2. Install and configure hls.js for video streaming
3. Install Angular Material (if needed for UI components)
4. Set up the recommended folder structure
5. Create core services for API communication
6. Implement the first feature module (e.g., video list or upload)
