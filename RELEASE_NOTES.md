# Shtab Project Manager - Release Notes

## Version 1.0.0-stable (Working Version)
- **Backend:** Go (Golang), REST API, PostgreSQL, JWT authorization, real-time WebSocket notifications.
- **Frontend:** React + TypeScript + Vite + Tailwind CSS (shtab.app UI/UX style: dark sidebar, light workspace, purple/blue accent).
- **Features Implemented:**
  - Centered auth & registration modal with logotype placement (`public/logo.svg`).
  - Project workspace with Kanban board (New / In Progress / Review / Done), List view, and Table view switchers.
  - Task cards with title, description, due date, assignee, priority, status, author, and **< 24 hours deadline visual warning badge**.
  - Real-time WebSocket push notification toast/bell system.
  - User statistics page with KPI metrics and Recharts daily task completion dynamics.
  - Admin cabinet at `/admin` with registered users list and role management.
- **Docker & Deployment:** Fully configured via `docker-compose.yml`, Dockerfiles, and Nginx reverse proxy with WebSocket upgrade support.
