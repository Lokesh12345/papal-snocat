# PayPal SNOCAT - System Notification Manager

A demonstration project aligned with PayPal's Production Engineer role for System Notifications.

## Overview

This is a full-stack notification management system that handles email and SMS templates across multiple brands (PayPal, Venmo, Zettle, Xoom, Fastlane). It demonstrates the complete workflow of a Production Engineer managing notification templates from creation through localization, validation, and deployment.

## Features

- Template management with dynamic placeholders
- Multi-language localization support (10+ languages)
- Automated QA validation with 5-stage quality checks
- Request queue with priority management
- Live template preview with test data
- Production debugging tools
- Analytics and bottleneck identification
- Template-to-request linking

## Quick Start

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd frontend
npm install
```

### Running the Application

Start the backend server:
```bash
cd backend
npm run dev
```
Backend runs on http://localhost:3000

Start the frontend server:
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:5173

Open your browser and navigate to http://localhost:5173

## Tech Stack

**Frontend:** React 18, TypeScript, TailwindCSS, Vite

**Backend:** Node.js, Express

**Storage:** JSON files (file-based for demo, production-ready for database migration)

**API:** RESTful architecture

## Project Structure

```
backend/
  src/
    routes/        - API endpoints
    services/      - Business logic
    utils/         - Helper functions
  data/
    templates/     - Template files by brand
    locales/       - Language translation files
    requests/      - Request queue data

frontend/
  src/
    components/    - Reusable UI components
    pages/         - Main application pages
    services/      - API integration
    types/         - TypeScript definitions
```

## Key Functionality

### Template Management
Create and edit notification templates with support for dynamic placeholders. Templates are versioned and organized by brand.

### Localization
Manage translations across multiple languages with completeness tracking. The system identifies missing translations and allows inline editing.

### QA Validation
Five automated checks before deployment:
- Locale completeness verification
- Placeholder validation
- HTML structure checking
- Link validation
- Brand compliance rules

### Request Queue
Track template requests from product teams with priority levels (P0 Critical, P1 High, P2 Normal) and status tracking through the production pipeline.

### Analytics
Monitor request volume, identify workflow bottlenecks, track cycle times, and analyze process efficiency.

## API Endpoints

```
GET    /api/templates/:brand          - List templates
POST   /api/templates/:brand          - Create template
PUT    /api/templates/:brand/:id      - Update template
GET    /api/locales                   - List locales
PUT    /api/locales/:lang             - Update locale
POST   /api/validation/validate       - Run QA validation
GET    /api/requests                  - Get request queue
PUT    /api/requests/:id              - Update request
GET    /api/analytics                 - Get metrics
```

## Documentation

For detailed technical documentation and demo guide, see:
- DEV_DOCS.md - Developer documentation
- DEMO_GUIDE.md - Presentation walkthrough
- PROJECT_STRUCTURE.md - Architecture details

## Purpose

This project demonstrates capabilities required for PayPal's Production Engineer role, including template lifecycle management, quality assurance, multi-brand operations, localization handling, debugging workflows, and process optimization.
