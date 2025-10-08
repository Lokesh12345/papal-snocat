# 💼 PayPal SNOCAT - System Notification Manager

A demonstration project aligned with PayPal's **Production Engineer – System Notifications (SNOCAT)** role.

## 🎯 What This Is

A miniature version of PayPal's internal notification management system that handles:
- ✅ Email & SMS template management
- ✅ Multi-language localization (10+ languages)
- ✅ Pre-production QA validation
- ✅ Multi-brand support (PayPal, Venmo, Zettle, Xoom, Fastlane)
- ✅ Production debugging simulation
- ✅ Analytics & bottleneck analysis

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Start Backend

```bash
cd backend
npm run dev
```

API runs on: `http://localhost:3000`

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

UI runs on: `http://localhost:5173`

### 4. Open Browser

Navigate to: `http://localhost:5173`

## 📋 Features

### 🎨 Template Management
- Create/edit notification templates with placeholders
- Support for HTML and plain text formats
- Version tracking
- Multi-brand organization

### 🌍 Localization
- Manage translations across 10 languages
- Completeness checking
- Side-by-side editing

### ✅ QA Validation
- Automated quality checks before deployment
- Locale completeness verification
- HTML structure validation
- Link checking
- Brand compliance rules

### 📊 Request Queue
- Multi-brand request management
- Priority levels (P0/P1/P2)
- Status tracking pipeline
- SLA monitoring

### 🔍 Preview Tool
- Live template rendering
- Multi-language preview
- Test data injection
- Device preview simulation

### 🐛 Debug Simulator
- Live issue simulation
- Diagnosis workflow
- Quick-fix deployment

### 📈 Analytics
- Request volume tracking
- Bottleneck identification
- Cycle time metrics
- Brand/priority breakdowns

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | TailwindCSS |
| Backend | Node.js + Express |
| Storage | JSON files |
| API | RESTful |

## 📁 Project Structure

```
paypa-snocat/
├── backend/              # Node.js API
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   └── utils/        # Helpers
│   └── data/             # JSON storage
│       ├── templates/    # Templates by brand
│       ├── locales/      # Language files
│       └── requests/     # Request queue
│
├── frontend/             # React UI
│   └── src/
│       ├── components/   # Reusable UI
│       ├── pages/        # Main screens
│       ├── services/     # API calls
│       └── types/        # TypeScript types
│
├── DEV_DOCS.md          # Detailed documentation
└── README.md            # This file
```

## 🎬 Demo Navigation

1. **Dashboard** - System overview and quick actions
2. **Templates** - Create and manage templates
3. **Requests** - View and process request queue
4. **QA** - Run validation checks and manage locales
5. **Debug** - Simulate production issues and view analytics

## 🔑 Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/templates/:brand` | GET | List templates |
| `/api/templates/:brand` | POST | Create template |
| `/api/templates/:brand/:id` | PUT | Update template |
| `/api/locales` | GET | List all locales |
| `/api/locales/:lang` | PUT | Update locale |
| `/api/validation/validate` | POST | Run QA checks |
| `/api/requests` | GET | Get request queue |
| `/api/analytics` | GET | Get metrics |

## 💡 Alignment with Job Role

This project demonstrates:

✅ **Template Production Pipeline** - End-to-end management
✅ **Quality Assurance** - "Last line of defense" validation
✅ **Multi-brand Operations** - PayPal ecosystem support
✅ **Localization Management** - Global deployment readiness
✅ **Issue Debugging** - Production problem-solving
✅ **Process Optimization** - Bottleneck analysis
✅ **React Development** - Component prototyping
✅ **Automation** - Validation and workflow tools

## 📖 Documentation

For detailed documentation, see [DEV_DOCS.md](./DEV_DOCS.md)

## 🎯 Purpose

Built to showcase skills for PayPal's Production Engineer (System Notifications) role, demonstrating:
- Technical implementation ability
- Understanding of production workflows
- Multi-brand complexity management
- Quality-focused mindset
- Problem-solving approach

---

**Built with ❤️ for the PayPal SNOCAT team**
