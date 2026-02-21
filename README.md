# TeamSync Pro

TeamSync Pro is a static-export SaaS-style Kanban app (Jira-lite) built with Next.js + TypeScript.

## Stack

- Next.js App Router (`output: 'export'`)
- TypeScript
- Zustand (slice-based store)
- Tailwind CSS
- @dnd-kit (drag & drop)
- framer-motion (animations)
- next-themes (dark mode)
- localStorage as persistence layer

## Implemented Features

- Projects and task boards
- Kanban statuses: To Do, In Progress, Review, Done
- Drag & Drop task movement
- Priority badges
- Assignees and filtering
- Search by title/description
- Comments
- Dark theme toggle
- Skeleton loading state
- Task edit modal via Portal
- Custom fields (`text`, `number`, `select`) per project with values in `Task.customFields`
- Optimistic updates with async localStorage persist and rollback on error
- Undo stack with toast action for:
  - move task
  - delete task
  - status change
- Activity log in task modal for:
  - task creation
  - status changes
  - assignee changes
  - task edits

## Architecture (FSD)

```text
src/
  app/
  entities/
    activity/
    project/
    task/
    user/
  features/
    board-filter/
    project-selector/
    task-create/
    task-modal/
    theme-toggle/
    undo-toast/
  shared/
    config/
    lib/
      activity-log/
      repository/
      undo/
      utils/
    ui/
  store/
    slices/
  widgets/
    app-shell/
    kanban-board/
```

## Store Slices

- `projects`
- `tasks`
- `users`
- `activityLog`
- `undoStack`
- `ui` (filters, active modal, persist state)

## Local Run

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

## Production Build (static)

```bash
npm run build
```

Build output will be generated in `out/`.

## GitHub Pages Deployment

This project is ready for GitHub Pages:

- `next.config.js` sets `output: 'export'`
- repo-based `basePath` and `assetPrefix` are auto-calculated from:
  - `GITHUB_ACTIONS`
  - `GITHUB_REPOSITORY`

### Example GitHub Actions workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## Notes

- There is no backend and no API routes by design.
- Data is stored in browser `localStorage`.
- Demo data loads automatically on first run.
