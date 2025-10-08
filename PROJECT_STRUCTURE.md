# 📁 PayPal SNOCAT - Project Structure

```
paypa-snocat/
│
├── backend/                          # Node.js/Express API
│   ├── src/
│   │   ├── routes/                   # API endpoints
│   │   │   ├── templates.js          # Template CRUD operations
│   │   │   ├── locales.js            # Localization management
│   │   │   ├── validation.js         # QA validation endpoints
│   │   │   ├── requests.js           # Request queue management
│   │   │   └── analytics.js          # Analytics data
│   │   │
│   │   ├── services/                 # Business logic
│   │   │   ├── templateService.js    # Template operations
│   │   │   ├── localeService.js      # Locale file handling
│   │   │   ├── validationService.js  # QA validation logic
│   │   │   └── analyticsService.js   # Analytics calculations
│   │   │
│   │   ├── utils/                    # Helper functions
│   │   │   ├── fileManager.js        # File read/write utilities
│   │   │   └── validator.js          # Validation helpers
│   │   │
│   │   └── server.js                 # Express app entry point
│   │
│   ├── data/                         # JSON file storage
│   │   ├── templates/                # Template files by brand
│   │   │   ├── paypal/
│   │   │   ├── venmo/
│   │   │   ├── zettle/
│   │   │   ├── xoom/
│   │   │   └── fastlane/
│   │   │
│   │   ├── locales/                  # Locale files by language
│   │   │   ├── en.json
│   │   │   ├── es.json
│   │   │   ├── fr.json
│   │   │   ├── de.json
│   │   │   └── zh.json
│   │   │
│   │   └── requests/                 # Request queue data
│   │       └── queue.json
│   │
│   ├── package.json
│   └── .env
│
├── frontend/                         # React/TypeScript UI
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   │   ├── TemplateEditor.tsx    # Template creation/edit form
│   │   │   ├── LocaleManager.tsx     # Localization interface
│   │   │   ├── PreviewPanel.tsx      # Template preview
│   │   │   ├── QADashboard.tsx       # Validation checklist
│   │   │   ├── RequestQueue.tsx      # Request list & filters
│   │   │   ├── DebugSimulator.tsx    # Live issue simulator
│   │   │   └── Analytics.tsx         # Metrics dashboard
│   │   │
│   │   ├── pages/                    # Main pages
│   │   │   ├── Dashboard.tsx         # Home - overview
│   │   │   ├── Templates.tsx         # Template management
│   │   │   ├── Requests.tsx          # Request queue page
│   │   │   ├── QA.tsx                # QA validation page
│   │   │   └── Debug.tsx             # Debugging tools page
│   │   │
│   │   ├── services/                 # API calls
│   │   │   └── api.ts                # Axios/fetch wrapper
│   │   │
│   │   ├── types/                    # TypeScript definitions
│   │   │   └── index.ts              # Shared types
│   │   │
│   │   ├── App.tsx                   # Main app component
│   │   ├── main.tsx                  # Entry point
│   │   └── index.css                 # Global styles
│   │
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── DEV_DOCS.md                       # Developer documentation
├── README.md                         # Project overview & setup
└── DEMO_SCRIPT.md                    # Presentation guide
```

---

## 🎯 **Key Design Principles**

### 1. **Separation of Concerns**
- `backend/` = API + Data Storage
- `frontend/` = UI + User Interaction
- Clean separation makes it easy to demo each layer

### 2. **File-Based Storage (Simple)**
- No database setup required
- JSON files in `backend/data/`
- Easy to inspect, edit, and reset

### 3. **Component-Based UI**
- Each major feature = 1 component
- Easy to demo individual features
- Components are independent

### 4. **Type Safety**
- TypeScript for frontend
- Clear interfaces for data structures
- Less runtime errors during demo

### 5. **RESTful API**
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Predictable URL patterns
- Easy to test with tools like Postman

---

## 🚀 **Quick Start Flow**

1. **Install Dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   → API runs on `http://localhost:3000`

3. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   → UI runs on `http://localhost:5173`

4. **Demo Ready!** 🎉

---

## 📊 **Data Flow Example**

```
User Action: "Create new template"
     ↓
Frontend (TemplateEditor.tsx)
     ↓ POST /api/templates
Backend (routes/templates.js)
     ↓
Service (templateService.js)
     ↓
File Manager (utils/fileManager.js)
     ↓
Save to: data/templates/paypal/payment-success.json
     ↓ Response
Frontend receives new template
     ↓
Update UI
```

---

## 🎨 **Tech Stack**

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | React 18 + TypeScript | UI components |
| **Frontend Build** | Vite | Fast dev server |
| **Styling** | TailwindCSS | Quick, clean UI |
| **Backend** | Node.js + Express | REST API |
| **Storage** | JSON files | Simple data persistence |
| **Templating** | Handlebars | Process `{{placeholders}}` |
| **Validation** | Custom validators | QA checks |

---

## 📝 **Module Map**

| Feature | Frontend Component | Backend Route | Data Location |
|---------|-------------------|---------------|---------------|
| Template Management | `TemplateEditor.tsx` | `/api/templates` | `data/templates/` |
| Localization | `LocaleManager.tsx` | `/api/locales` | `data/locales/` |
| Preview | `PreviewPanel.tsx` | `/api/preview` | - |
| QA Validation | `QADashboard.tsx` | `/api/validation` | - |
| Request Queue | `RequestQueue.tsx` | `/api/requests` | `data/requests/` |
| Debugging | `DebugSimulator.tsx` | - | - (client-side) |
| Analytics | `Analytics.tsx` | `/api/analytics` | - (calculated) |

---

## 🎬 **Demo Navigation**

1. **Dashboard** → Overview of system
2. **Requests** → Show incoming work queue
3. **Templates** → Create/edit template
4. **Localization** → Add translations
5. **Preview** → See rendered output
6. **QA** → Run validation checks
7. **Debug** → Simulate live issue
8. **Analytics** → Show process metrics

Clean, linear flow for presentation!
