# 📘 SNOCAT Developer Documentation

## Overview

This is a **PayPal SNOCAT System Notification Simulator** built to demonstrate skills aligned with the Production Engineer role. The system manages notification templates across multiple brands (PayPal, Venmo, Zettle, Xoom, Fastlane) with localization, QA validation, and production debugging capabilities.

---

## 🎯 What This System Does

### Core Functions
1. **Template Management** - Create/edit email & SMS notification templates
2. **Localization** - Manage translations across 10+ languages
3. **QA Validation** - Pre-production quality checks (the "last line of defense")
4. **Request Queue** - Handle incoming template requests from multiple brands
5. **Preview Tool** - Test templates with real data in different languages
6. **Debug Simulator** - Simulate and fix production issues
7. **Analytics** - Track performance metrics and bottlenecks

---

## 🏗️ Architecture

```
Frontend (React) ←→ Backend (Express) ←→ Data (JSON Files)
```

### Why This Design?
- **Simple**: No database setup - uses JSON files
- **Fast**: Easy to demo and reset
- **Clear**: Each component has one job
- **Realistic**: Mimics real production workflows

---

## 📁 File Organization

### Backend Structure
```
backend/src/
├── routes/          # API endpoints (what the frontend calls)
├── services/        # Business logic (the actual work)
└── utils/           # Helper functions (file I/O, validation)

backend/data/        # Storage (JSON files instead of database)
├── templates/       # One folder per brand
├── locales/         # One file per language
└── requests/        # Request queue data
```

### Frontend Structure
```
frontend/src/
├── components/      # Reusable UI pieces
├── pages/          # Main screens
├── services/       # API communication
└── types/          # TypeScript definitions
```

---

## 🔄 How Data Flows

### Example: Creating a Template

1. **User** → Clicks "Create Template" in UI
2. **Frontend** → `TemplateEditor.tsx` shows form
3. **User** → Fills in name, subject, body
4. **Frontend** → Sends POST to `/api/templates/paypal`
5. **Backend** → `routes/templates.js` receives request
6. **Backend** → `services/templateService.js` processes data
7. **Backend** → `utils/fileManager.js` saves to `data/templates/paypal/template-name.json`
8. **Frontend** → Receives success, updates list

---

## 🛠️ Key Components Explained

### 1. Template System

**What it does:**
- Stores notification templates with placeholders like `{{user.name}}`
- Tracks versions (v1, v2, v3)
- Supports HTML + plain text formats

**Files:**
- `backend/src/services/templateService.js` - Template operations
- `frontend/src/components/TemplateEditor.tsx` - UI for editing
- `frontend/src/components/PreviewPanel.tsx` - Live preview

**How placeholders work:**
```javascript
Template: "Hello {{user.name}}, your payment of {{amount}} succeeded"
Test Data: { "user.name": "John", "amount": "$50" }
Result: "Hello John, your payment of $50 succeeded"
```

---

### 2. Localization System

**What it does:**
- Manages translations for 10 languages (en, es, fr, de, zh, ja, pt, it, ko, ar)
- Checks completeness (are all languages 100% translated?)
- Highlights missing keys

**Files:**
- `backend/src/services/localeService.js` - Locale operations
- `frontend/src/components/LocaleManager.tsx` - Translation editor

**Example locale file (`en.json`):**
```json
{
  "greeting": "Hello",
  "payment_success": "Your payment was successful",
  "footer": "Thank you for using PayPal"
}
```

**Completeness Check:**
- If `en.json` has 10 keys but `fr.json` only has 8 → French is 80% complete

---

### 3. QA Validation (Most Important!)

**What it does:**
This is the **"last line of defense"** before production. Catches:
- Missing locale files
- Broken HTML tags
- Invalid links
- Missing placeholders
- Brand compliance issues

**Files:**
- `backend/src/services/validationService.js` - Validation logic
- `frontend/src/components/QADashboard.tsx` - Results UI

**Validation Checks:**
1. **Locale Completeness** - All languages 100%?
2. **Placeholder Validation** - All {{variables}} valid?
3. **HTML Structure** - Tags properly closed?
4. **Link Validation** - No empty/broken links?
5. **Brand Compliance** - Unsubscribe link present?

**Status Meanings:**
- ✅ **Pass** - All good, ready for production
- ⚠️ **Warning** - Issues but not critical
- ❌ **Fail** - BLOCKED, must fix before deploy

---

### 4. Request Queue

**What it does:**
- Simulates requests from different teams (Venmo, Zettle, etc.)
- Tracks priority (P0 = urgent, P1 = high, P2 = normal)
- Shows status pipeline: New → In Progress → Localization → QA Review → Deployed

**Files:**
- `backend/src/routes/requests.js` - API endpoints
- `frontend/src/components/RequestQueue.tsx` - UI

**Priority Levels:**
- **P0** - Critical (security alerts, password resets) - handle immediately
- **P1** - High (payment confirmations) - same day
- **P2** - Normal (marketing emails) - within 3 days

---

### 5. Preview Tool

**What it does:**
- Shows what the email/SMS will look like
- Lets you switch languages instantly
- Inject test data (user names, amounts, etc.)
- See HTML and plain text versions

**Files:**
- `frontend/src/components/PreviewPanel.tsx`

**How to use:**
1. Select a template
2. Choose language (en, es, fr, etc.)
3. Fill in test data
4. See live preview

---

### 6. Debug Simulator

**What it does:**
- Simulates 3 common production issues
- Shows how to diagnose and fix each
- Demonstrates "first line of defense" responsibility

**Mock Issues:**
1. **Missing German Locale** - de.json file missing
2. **Broken Placeholder** - Typo in template ({{user.nane}} instead of {{user.name}})
3. **Malformed HTML** - Unclosed div tag

**Files:**
- `frontend/src/components/DebugSimulator.tsx`

---

### 7. Analytics Dashboard

**What it does:**
- Shows request volume
- Identifies bottlenecks (which stage is slowest?)
- Tracks average cycle time
- Brand/priority breakdowns

**Files:**
- `backend/src/services/analyticsService.js` - Calculations
- `frontend/src/components/Analytics.tsx` - Charts

**Key Metrics:**
- **Total Requests** - How many templates managed
- **Avg Cycle Time** - Hours from request to deployment
- **Bottleneck** - Which stage needs improvement (usually localization)

---

## 🚀 How to Run

### First Time Setup

1. **Install Backend Dependencies:**
```bash
cd backend
npm install
```

2. **Install Frontend Dependencies:**
```bash
cd frontend
npm install
```

### Running the System

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```
→ API runs on `http://localhost:3000`

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```
→ UI runs on `http://localhost:5173`

**Open Browser:**
```
http://localhost:5173
```

---

## 🎬 Demo Flow (For Presentation)

### Act 1: Overview (1 min)
1. Open Dashboard
2. Explain: "This manages PayPal's notification templates across 5 brands"
3. Show quick stats

### Act 2: Create Template (3 min)
1. Go to Templates
2. Select "Venmo"
3. Click "Create New Template"
4. Fill in:
   - Name: "Payment Alert"
   - Subject: "Payment Received - {{transaction.id}}"
   - Body: (use sample HTML with placeholders)
5. Save

### Act 3: Preview & Test (2 min)
1. Click "Preview"
2. Switch language to Spanish
3. Fill test data (name, amount)
4. Show rendered output

### Act 4: QA Validation (2 min)
1. Go to QA tab
2. Select the template
3. Click "Run Validation"
4. Show results:
   - Point out locale completeness
   - Explain each check
   - Show what "pass" vs "fail" means

### Act 5: Manage Localization (2 min)
1. Go to "Locale Management" tab
2. Select French
3. Add missing translation
4. Save
5. Re-run validation → Now 100% complete

### Act 6: Request Queue (1 min)
1. Go to Requests
2. Show different priorities
3. Update a request status
4. Explain the workflow pipeline

### Act 7: Debug Live Issue (2 min)
1. Go to Debug tab
2. Pick "Missing German Locale" issue
3. Click "Investigate" → Shows diagnosis
4. Click "Deploy Fix" → Issue resolved
5. Explain: "This is how I'd handle production issues"

### Act 8: Analytics (1 min)
1. Scroll to Analytics section
2. Point out bottleneck
3. Explain: "I'd work with engineering to optimize localization"

### Conclusion (1 min)
"This demonstrates my ability to:
- Manage high-volume requests
- Ensure quality before production
- Debug live issues quickly
- Optimize workflows
- Handle multi-brand complexity"

---

## 💡 Key Talking Points

### For the Interview

**When they ask: "How do you handle quality assurance?"**
→ Show QA Dashboard, explain the 5-check system

**When they ask: "How do you debug production issues?"**
→ Show Debug Simulator, walk through diagnosis process

**When they ask: "How do you manage high volume?"**
→ Show Request Queue, explain priority system

**When they ask: "How do you improve processes?"**
→ Show Analytics, point out bottleneck analysis

---

## 🔧 Common Issues & Fixes

### Backend won't start
```bash
cd backend
npm install
npm run dev
```

### Frontend won't start
```bash
cd frontend
npm install
npm run dev
```

### API errors (CORS)
- Make sure backend is running on port 3000
- Frontend expects `http://localhost:3000/api`

### Templates not showing
- Check `backend/data/templates/[brand]/` folder exists
- Sample data is in `backend/data/templates/paypal/payment-success.json`

### Reset all data
```bash
# Delete and recreate sample data
rm -rf backend/data
# Create folders again and add sample files
```

---

## 📊 Data Examples

### Sample Template
```json
{
  "id": "payment-success",
  "name": "Payment Success Notification",
  "brand": "paypal",
  "subject": "Payment Confirmation - {{transaction.id}}",
  "body": "<html>...</html>",
  "placeholders": ["user.name", "transaction.amount"],
  "version": 1
}
```

### Sample Request
```json
{
  "id": "REQ-12345",
  "brand": "venmo",
  "title": "Security Alert Template",
  "priority": "P0",
  "status": "qa-review"
}
```

---

## 🎯 Alignment with Job Description

| JD Requirement | How This Demo Shows It |
|----------------|------------------------|
| "Develop automation and tools" | Template system, QA validation |
| "High volume requests" | Request queue with multi-brand support |
| "Last line before production" | QA Dashboard with validation gates |
| "First line for live issues" | Debug Simulator |
| "Localization QA" | Locale completeness checker |
| "Analyze bottlenecks" | Analytics dashboard |
| "React components" | All frontend components |
| "Collaborate with product/design" | Preview tool for stakeholder review |

---

## 🚀 Next Steps

### If you want to enhance:
1. Add email sending (use Nodemailer)
2. Add real database (PostgreSQL)
3. Add authentication
4. Add deployment pipeline visualization
5. Add A/B testing simulator

### If you want to simplify:
- Focus on 3 core features: Templates, QA, Debug
- Remove analytics
- Use fewer brands (just PayPal + Venmo)

---

## 📝 Notes for Demo

- **Keep it simple** - Don't dive into code unless asked
- **Focus on workflow** - Show how it solves real PE problems
- **Be confident** - You built this to show you understand the role
- **Answer questions** - Use the system to illustrate your answers
- **Show passion** - This is what you want to do!

---

**Good luck with the demo! 🚀**
