# 🎬 SNOCAT Demo Guide - Complete Walkthrough

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Page-by-Page Breakdown](#page-by-page-breakdown)
3. [JD Alignment](#jd-alignment)
4. [Demo Script](#demo-script)
5. [Technical Deep Dive](#technical-deep-dive)

---

## 🎯 System Overview

### What is SNOCAT?
**SNOCAT** (System Notifications) is a production-grade notification management platform that handles email and SMS templates for PayPal and its brands (Venmo, Zettle, Xoom, Fastlane).

### Your Role as Production Engineer
You are the **last checkpoint** before millions of customers receive notifications. You ensure:
- ✅ Templates work correctly across all languages
- ✅ Quality checks pass before production
- ✅ Live issues are debugged and fixed quickly
- ✅ Workflows are optimized for efficiency

---

## 📄 Page-by-Page Breakdown

### 🏠 **Page 1: Dashboard**

#### What It Does
Provides a high-level overview of the system's current state with quick access to all major functions.

#### Key Features
1. **Total Requests** - Shows all incoming template requests
2. **Active Requests** - Templates currently in progress (not yet deployed)
3. **Deployed** - Successfully published templates in production
4. **Quick Actions** - Fast navigation to critical workflows

#### Technical Implementation
- **Frontend**: `frontend/src/pages/Dashboard.tsx`
- **API Calls**: `GET /api/requests`
- **Data Processing**:
  ```javascript
  // Calculates stats from request queue
  total = all requests
  active = requests where status !== 'deployed'
  deployed = requests where status === 'deployed'
  ```

#### How to Use
1. Open the app → You land on Dashboard
2. See at-a-glance stats of workload
3. Click any Quick Action card to jump to that workflow

#### JD Alignment
✅ **"High volume of requests"** - Dashboard shows request metrics
✅ **"Fulfill requests from every PayPal product team"** - Multi-brand visibility

#### Demo Talking Points
- "As a PE, my day starts here - I see 5 total requests, 3 active, 2 deployed"
- "I can quickly see workload and prioritize"
- "Quick actions let me jump directly to critical workflows"

---

### 📝 **Page 2: Templates**

#### What It Does
Complete template lifecycle management - create, edit, preview, and version control notification templates.

#### Key Features
1. **Brand Selector** - Switch between PayPal/Venmo/Zettle/Xoom/Fastlane
2. **Template List** - All templates for selected brand with version info
3. **Create New** - Build templates from scratch
4. **Edit** - Modify existing templates (creates new version)
5. **Preview** - See live rendering with test data

#### Technical Implementation
- **Frontend**:
  - `frontend/src/pages/Templates.tsx` (main page)
  - `frontend/src/components/TemplateEditor.tsx` (create/edit form)
  - `frontend/src/components/PreviewPanel.tsx` (preview renderer)
- **Backend**:
  - `backend/src/routes/templates.js` (API endpoints)
  - `backend/src/services/templateService.js` (business logic)
- **Storage**: `backend/data/templates/{brand}/{template-id}.json`

#### Template Structure
```json
{
  "id": "payment-success",
  "name": "Payment Success Notification",
  "brand": "paypal",
  "subject": "Payment Confirmation - {{transaction.id}}",
  "body": "<html>...</html>",
  "text": "Plain text version...",
  "placeholders": ["user.name", "transaction.amount"],
  "version": 1,
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z"
}
```

#### Placeholder System
Templates use `{{variable}}` syntax for dynamic content:
- `{{user.name}}` → Replaced with actual user name
- `{{transaction.amount}}` → Replaced with payment amount
- `{{unsubscribe_link}}` → Compliance requirement

**How it works:**
1. Template: `"Hello {{user.name}}, your payment of {{transaction.amount}} succeeded"`
2. Test data: `{ "user.name": "lokesh", "transaction.amount": "$50" }`
3. Rendered: `"Hello lokesh, your payment of $50 succeeded"`

#### How to Use

**Creating a Template:**
1. Select brand (e.g., "Venmo")
2. Click "Create New Template"
3. Fill in:
   - **Name**: Descriptive title (e.g., "Payment Alert")
   - **Subject**: Email subject with placeholders (e.g., "Payment received - {{transaction.id}}")
   - **HTML Body**: Full email HTML with `{{placeholders}}`
   - **Text Version**: Plain text fallback
4. Click "Create"
5. System auto-extracts placeholders and saves

**Editing a Template:**
1. Click "Edit" on any template
2. Modify fields
3. Click "Update" → Creates new version (v2, v3, etc.)

**Previewing:**
1. Click "Preview" on any template
2. Select language (en/es/fr/de/zh)
3. Adjust test data values
4. See live rendered output
5. Switch between HTML and Plain Text views

#### JD Alignment
✅ **"Coding, content storage"** - Template creation and management
✅ **"Prototype and test React components"** - Preview tool uses React rendering
✅ **"Content pipeline management"** - End-to-end template workflow

#### Demo Talking Points
- "I manage templates for all 5 PayPal brands - each has its own library"
- "Templates use placeholders for dynamic content - system validates these"
- "Version tracking ensures we can rollback if needed"
- "Preview tool lets stakeholders see exactly what customers will receive"

---

### 📬 **Page 3: Requests (Request Queue)**

#### What It Does
Manages incoming template requests from product teams across all PayPal brands with priority-based workflow tracking.

#### Key Features
1. **Brand Filter** - View requests by brand or see all
2. **Priority Badges** - Visual indicators (P0/P1/P2)
3. **Status Pipeline** - Track progress through workflow stages
4. **Status Updates** - Move requests through pipeline
5. **Time Tracking** - Shows creation date for SLA monitoring

#### Technical Implementation
- **Frontend**: `frontend/src/components/RequestQueue.tsx`
- **Backend**: `backend/src/routes/requests.js`
- **Storage**: `backend/data/requests/queue.json`

#### Request Structure
```json
{
  "id": "REQ-1736950800000",
  "brand": "venmo",
  "title": "Security Alert Template",
  "description": "New template for suspicious activity alerts",
  "priority": "P0",
  "status": "qa-review",
  "templateId": null,
  "createdAt": "2025-01-15T08:00:00.000Z",
  "updatedAt": "2025-01-15T12:00:00.000Z"
}
```

#### Priority Levels Explained
- **P0 (Critical)** - Red badge
  - Examples: Security alerts, password resets, fraud notifications
  - SLA: Handle immediately (same day)
  - Impact: Security/compliance issues if delayed

- **P1 (High)** - Orange badge
  - Examples: Payment confirmations, transaction receipts
  - SLA: 1-2 days
  - Impact: Customer experience affected

- **P2 (Normal)** - Blue badge
  - Examples: Marketing emails, newsletters
  - SLA: 3+ days
  - Impact: Low urgency

#### Status Pipeline
```
New → In Progress → Localization → QA Review → Deployed
```

**Each stage explained:**
1. **New** - Just received, not started
2. **In Progress** - PE is working on template
3. **Localization** - Waiting for translations
4. **QA Review** - PE is validating (your "last line of defense")
5. **Deployed** - Live in production

#### How to Use

**Viewing Requests:**
1. Open Requests page
2. Use brand filter to focus on specific product (Venmo/PayPal/etc.)
3. See all requests sorted by update time

**Processing a Request:**
1. Click on a request to see details
2. Check priority (handle P0 first!)
3. Update status dropdown to move through pipeline
4. Example flow:
   - Receive request → Status: "New"
   - Start working → Change to "In Progress"
   - Send to localization team → Change to "Localization"
   - Translations back, validate → Change to "QA Review"
   - All checks pass, deploy → Change to "Deployed"

**Priority Management:**
```
Your Queue:
[P0] Venmo - Security Alert        → Handle NOW
[P1] PayPal - Payment Confirmation → Today
[P2] Zettle - Marketing Email      → This week
```

#### JD Alignment
✅ **"Fulfill high volume of requests"** - Queue handles multiple concurrent requests
✅ **"Varying complexity and business criticality"** - Priority system (P0/P1/P2)
✅ **"From almost every PayPal product team"** - Multi-brand support
✅ **"Timely deployment"** - Status tracking ensures nothing gets stuck

#### Demo Talking Points
- "I receive requests from 5 different brands - this queue manages all of them"
- "Priority system ensures critical items (like security alerts) get handled first"
- "Status pipeline tracks where each request is - prevents bottlenecks"
- "Right now I have a P0 Venmo security alert in QA Review - that's my top priority"
- "I can filter by brand when a specific team needs status updates"

---

### ✅ **Page 4: QA (Quality Assurance)**

#### What It Does
This is THE most important page - your **"last line of defense"** before templates go to production. Runs automated validation checks and manages localization.

#### Two Main Tabs

##### **Tab 1: Template Validation**

#### Key Features
1. **Brand/Template Selector** - Choose what to validate
2. **Run Validation** - Executes all quality checks
3. **Overall Status** - Pass/Warning/Fail with deployment recommendation
4. **Detailed Checks** - 5 automated validations with results
5. **Blocking Logic** - Prevents bad templates from deploying

#### The 5 Quality Checks

**1. Locale Completeness Check**
- **What**: Verifies all required languages are 100% translated
- **Why**: Can't deploy if German users won't see German text
- **How**:
  - Extracts placeholders from template: `["greeting", "user.name", "footer"]`
  - Checks each locale file (en.json, es.json, fr.json, de.json, zh.json, etc.)
  - Calculates completeness: `(existing_keys / required_keys) * 100`
- **Pass**: All locales 100%
- **Warning**: Some locales incomplete (e.g., French 80%)
- **Fail**: Critical locales missing

**Example Output:**
```
✅ English (en) - 100%
✅ Spanish (es) - 100%
⚠️  French (fr) - 80% (missing 2 keys: "footer", "customer_support")
❌ German (de) - 0% (file not found)
```

**2. Placeholder Validation**
- **What**: Ensures all `{{variables}}` are valid
- **Why**: Typos cause rendering failures (e.g., `{{user.nane}}` vs `{{user.name}}`)
- **How**:
  - Regex extracts all placeholders: `/\{\{([^}]+)\}\}/g`
  - Validates format and lists all found
  - Warns if suspicious patterns detected
- **Pass**: All placeholders found and valid
- **Warning**: No placeholders (might be intentional)

**Example:**
```
Template: "Hello {{user.name}}, {{greeting}}"
Found: ["user.name", "greeting"]
Status: ✅ Pass
```

**3. HTML Structure Validation**
- **What**: Checks for malformed HTML
- **Why**: Broken HTML breaks email rendering
- **How**:
  - Counts opening tags: `<div>`, `<p>`, `<table>`
  - Counts closing tags: `</div>`, `</p>`, `</table>`
  - Flags mismatches
- **Pass**: All tags properly closed
- **Fail**: Missing closing tags

**Example Issue:**
```html
<div>
  <p>Hello {{user.name}}
  <!-- Missing </p> and </div> -->
```
Result: ❌ Fail - "Mismatched HTML tags detected"

**4. Link Validation**
- **What**: Checks all `href=""` links
- **Why**: Broken/empty links harm UX
- **How**:
  - Regex finds all links: `/href=["']([^"']+)["']/g`
  - Flags empty, `#`, or malformed URLs
- **Pass**: All links valid
- **Warning**: Empty or placeholder links found

**Example:**
```html
<a href="">Click here</a>  ← ⚠️ Empty link
<a href="https://paypal.com/help">Help</a>  ← ✅ Valid
```

**5. Brand Compliance**
- **What**: Ensures regulatory/brand requirements met
- **Why**: Legal compliance (CAN-SPAM, GDPR)
- **How**:
  - Checks for `{{unsubscribe_link}}` placeholder
  - Verifies required footer elements
- **Pass**: Compliant
- **Warning**: Missing compliance elements

**Required Elements:**
```html
<!-- Must have unsubscribe -->
<a href="{{unsubscribe_link}}">Unsubscribe</a>
```

#### Overall Status Logic
```
IF any check = FAIL → Status: FAIL (❌ BLOCKED from deployment)
ELSE IF any check = WARNING → Status: WARNING (⚠️ Review before deploying)
ELSE → Status: PASS (✅ Ready for production)
```

#### Technical Implementation
- **Frontend**: `frontend/src/components/QADashboard.tsx`
- **Backend**:
  - `backend/src/routes/validation.js` (API)
  - `backend/src/services/validationService.js` (validation logic)
  - `backend/src/utils/validator.js` (helper functions)
- **API**: `POST /api/validation/validate`

#### How to Use

**Running Validation:**
1. Go to QA page
2. Select brand (e.g., "PayPal")
3. Select template from dropdown
4. Click "Run Validation"
5. Wait 1-2 seconds for results

**Reading Results:**

**Green Box (PASS):**
```
Overall Status: PASS
✅ Ready for deployment
[Deploy to Production button enabled]
```

**Yellow Box (WARNING):**
```
Overall Status: WARNING
⚠️ Review warnings before deployment
[Can deploy, but should fix issues first]
```

**Red Box (FAIL):**
```
Overall Status: FAIL
⚠️ Template BLOCKED from deployment
[Cannot deploy until fixed]
```

**Interpreting Each Check:**
- Expand details to see exactly what's wrong
- For Locale Completeness: Shows % complete per language
- For HTML/Links: Lists specific issues found
- Use this info to fix template

**Workflow Example:**
1. Run validation on "payment-success" template
2. Result: ⚠️ WARNING
3. Issue: French locale 80% complete (missing "footer" key)
4. Action: Go to "Locale Management" tab
5. Select French, add missing translation
6. Re-run validation
7. Result: ✅ PASS
8. Deploy with confidence!

##### **Tab 2: Locale Management**

#### What It Does
Manages translation files for all supported languages.

#### Key Features
1. **Language Selector** - Switch between 10+ locales
2. **Key-Value Editor** - Manage translations
3. **Add New Keys** - Expand translation coverage
4. **Delete Keys** - Remove obsolete translations
5. **Save Changes** - Update locale files

#### Supported Languages
- 🇺🇸 English (en)
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)
- 🇨🇳 Chinese (zh)
- 🇯🇵 Japanese (ja)
- 🇵🇹 Portuguese (pt)
- 🇮🇹 Italian (it)
- 🇰🇷 Korean (ko)
- 🇸🇦 Arabic (ar)

#### Locale File Structure
```json
{
  "greeting": "Hello",
  "payment_success": "Your payment was successful",
  "payment_amount": "Amount",
  "transaction_id": "Transaction ID",
  "footer": "Thank you for using PayPal",
  "unsubscribe": "Unsubscribe from emails"
}
```

#### How Templates Use Locales
```
Template body: "{{greeting}}, {{user.name}}! {{payment_success}}"
Locale (en):   { "greeting": "Hello", "payment_success": "Your payment was successful" }
Rendered (en): "Hello, lokesh! Your payment was successful"

Locale (es):   { "greeting": "Hola", "payment_success": "Tu pago fue exitoso" }
Rendered (es): "Hola, lokesh! Tu pago fue exitoso"
```

#### How to Use

**Editing Translations:**
1. Go to QA page → "Locale Management" tab
2. Select language (e.g., "French")
3. See all key-value pairs
4. Edit values in the input boxes
5. Click "Save Changes"

**Adding New Translation Key:**
1. Scroll to "Add New Key" section
2. Enter key name (e.g., `customer_support`)
3. Enter translation value (e.g., "Besoin d'aide? Contactez le support")
4. Click "Add"
5. Key appears in list
6. Click "Save Changes"

**Deleting Keys:**
1. Find key in list
2. Click red "Delete" button
3. Click "Save Changes"

**Common Workflow:**
1. Validation shows "French 80% complete"
2. Go to Locale Management
3. Select "French"
4. See existing keys: `greeting`, `payment_success`, `payment_amount`
5. Missing keys shown in validation: `footer`, `customer_support`
6. Add `footer`: "Merci d'utiliser PayPal"
7. Add `customer_support`: "Besoin d'aide? Contactez le support"
8. Save
9. Re-run validation → Now 100% complete!

#### Technical Implementation
- **Frontend**: `frontend/src/components/LocaleManager.tsx`
- **Backend**:
  - `backend/src/routes/locales.js` (API)
  - `backend/src/services/localeService.js` (business logic)
- **Storage**: `backend/data/locales/{language}.json`

#### JD Alignment
✅ **"Last line before email pushed to production"** - QA validation gates deployment
✅ **"Ensure templates working as expected"** - 5 automated checks
✅ **"Requisite localization files"** - Locale completeness check
✅ **"Localization quality assurance"** - Locale management system
✅ **"Global deployment"** - 10+ language support

#### Demo Talking Points
- "This is my most critical responsibility - the last checkpoint before millions see this email"
- "I run 5 automated checks on every template before deployment"
- "If locale completeness fails, I immediately know which language is incomplete"
- "For example, this French file is missing 2 keys - I can add them right here"
- "The validation prevents me from deploying broken templates - it's my safety net"
- "Pass/Warning/Fail logic ensures nothing slips through"

---

### 🐛 **Page 5: Debug & Analytics**

This page has two major sections showing production operations and process optimization.

---

#### **Section 1: Debug Simulator**

#### What It Does
Simulates real production issues and demonstrates the debugging workflow - showcasing your **"first line of defense for live issues"** responsibility.

#### The 3 Mock Issues

**Issue #1: Missing German Locale**
- **Symptom**: "Payment confirmation emails failing for German users (de_DE)"
- **Impact**: 🔴 Live issue - German customers not receiving emails
- **Root Cause**: Locale file `de.json` missing required translation keys
- **Diagnosis**: System tried to render template in German but couldn't find translations
- **Fix**: Upload complete `de.json` file with all required keys
- **Prevention**: Locale completeness check in QA would have caught this

**Issue #2: Broken Placeholder**
- **Symptom**: "Email shows {{user.nane}} instead of customer name"
- **Impact**: 🔴 Live issue - Emails showing placeholder text instead of names
- **Root Cause**: Typo in template - `{{user.nane}}` instead of `{{user.name}}`
- **Diagnosis**: Placeholder doesn't match any data field
- **Fix**: Update template to correct placeholder: `{{user.name}}`
- **Prevention**: Placeholder validation in QA

**Issue #3: Malformed HTML**
- **Symptom**: "Venmo receipt email layout is broken in Gmail"
- **Impact**: 🔴 Live issue - Emails unreadable for users
- **Root Cause**: Unclosed `<div>` tag in template body
- **Diagnosis**: HTML structure invalid, causing render failure
- **Fix**: Add missing closing `</div>` tag on line 42
- **Prevention**: HTML validation check in QA

#### How It Works

**Issue States:**
1. **Active** (Red) - Issue just reported
2. **Investigating** (Yellow) - PE is diagnosing
3. **Fixed** (Green) - Fix deployed

**Workflow Simulation:**
```
1. Issue appears (red box)
2. Click "Investigate" → Shows diagnosis + fix
3. Click "Deploy Fix" → Issue marked resolved
```

#### How to Use
1. Go to Debug page
2. See 3 active issues (red boxes)
3. Click "Investigate" on any issue
4. System reveals:
   - What's broken
   - Why it's broken
   - How to fix it
5. Click "Deploy Fix" to simulate resolution
6. Issue turns green ✅

#### Real-World Application

**If this was real:**
1. Alert comes via Slack: "#bethecustomer-paypal - Emails broken in Germany"
2. You investigate → Check logs, template, locale files
3. Find issue → Missing de.json file
4. Fix → Upload/create German locale file
5. Deploy → Push fix to production
6. Verify → Test email sends successfully
7. Communicate → Update Slack thread: "Fixed - deployed at 2:15pm"

#### Technical Implementation
- **Frontend**: `frontend/src/components/DebugSimulator.tsx`
- **Type**: Client-side simulation (no backend needed)
- **Purpose**: Demonstrates problem-solving ability

#### JD Alignment
✅ **"First line of defense for live issues"** - Debug workflow
✅ **"Monitor channels to debug live issues"** - Simulated alert response
✅ **"Rapidly implement bug fixes"** - Quick fix deployment
✅ **"Communicate with stakeholders"** - Issue resolution tracking

---

#### **Section 2: Analytics Dashboard**

#### What It Does
Provides metrics and insights to identify workflow bottlenecks and optimize the notification production process.

#### Key Metrics

**1. Total Requests**
- **What**: Count of all template requests ever received
- **Why**: Shows workload volume
- **Example**: "15 requests" = 15 templates processed

**2. Average Cycle Time**
- **What**: Average hours from request creation to deployment
- **Formula**:
  ```
  For each deployed request:
    cycle_time = deployed_at - created_at
  average = sum(cycle_times) / count(deployed)
  ```
- **Why**: Measures efficiency
- **Example**: "24.5h" = Templates take ~1 day to deploy on average
- **Target**: Lower is better (faster turnaround)

**3. Bottleneck Identification** ⭐ **MOST IMPORTANT**
- **What**: Which stage takes the longest time
- **How**: Calculates time spent in each status:
  ```
  For each request:
    if status == "localization":
      time_in_localization += (now - updatedAt)
  ```
- **Stages Analyzed**:
  - In Progress (template creation)
  - Localization (translation)
  - QA Review (validation)
- **Why**: Shows where to optimize
- **Example**: "Localization" = Translation stage is slowest

#### Breakdown Charts

**Status Breakdown**
Shows request distribution across pipeline:
```
New:          2
In Progress:  1
Localization: 1
QA Review:    1
Deployed:     5
```
**Insight**: "Most requests deployed successfully"

**Brand Breakdown**
Shows which brands request most templates:
```
PayPal:   6
Venmo:    4
Zettle:   2
Xoom:     2
Fastlane: 1
```
**Insight**: "PayPal is highest volume brand"

**Priority Breakdown**
Shows urgency distribution:
```
P0: 3  (Critical)
P1: 7  (High)
P2: 5  (Normal)
```
**Insight**: "3 critical items need immediate attention"

#### Bottleneck Analysis Section

**Visual Example:**
```
⚠️ Bottleneck Analysis
━━━━━━━━━━━━━━━━━━━━━━━━
The LOCALIZATION stage is currently the slowest.
Consider allocating more resources or streamlining this process.
```

**What this means:**
- Templates are getting stuck waiting for translations
- Localization team might be overloaded
- Opportunity to optimize workflow

**How you'd act on this:**
1. **Short-term**: Prioritize localization requests
2. **Medium-term**: Work with localization team to speed up process
3. **Long-term**: Build automation (pre-translate common phrases, create translation memory, etc.)

#### How to Use

**Viewing Analytics:**
1. Scroll down on Debug page
2. See 3 metric cards at top
3. Review 3 breakdown sections
4. Read bottleneck analysis

**Interpreting Data:**

**Example 1: High Cycle Time**
```
Avg Cycle Time: 48h (2 days)
Bottleneck: Localization
```
**Action**: "I need to work with localization team to reduce turnaround time"

**Example 2: Many P0 Requests**
```
Priority Breakdown:
P0: 8  ← TOO MANY CRITICAL ITEMS
P1: 2
P2: 1
```
**Action**: "I need to escalate - too many critical items backing up"

**Example 3: Unbalanced Brands**
```
Brand Breakdown:
Venmo:  15  ← ONE BRAND DOMINATING
PayPal:  2
Others:  1
```
**Action**: "Venmo might need dedicated PE support"

#### Technical Implementation
- **Frontend**: `frontend/src/components/Analytics.tsx`
- **Backend**:
  - `backend/src/routes/analytics.js` (API)
  - `backend/src/services/analyticsService.js` (calculations)
- **API**: `GET /api/analytics`
- **Data Source**: Calculates from request queue in real-time

#### JD Alignment
✅ **"Analyze throughput blockers"** - Bottleneck identification
✅ **"Strategize with Engineering to improve workflows"** - Data-driven optimization
✅ **"Continually improve publishing process"** - Metrics show where to focus

#### Demo Talking Points
- "Analytics help me identify where our process is slow"
- "Right now, localization is the bottleneck - taking 60% of total time"
- "I'd work with the localization team to understand why and optimize"
- "Priority breakdown helps me ensure critical items aren't getting stuck"
- "This data drives my conversations with engineering about automation opportunities"

---

## 🎯 Complete JD Alignment Matrix

| Job Requirement | How Demo Shows It | Which Page |
|----------------|-------------------|-----------|
| **"Develop automation and tools"** | Template system, QA validation engine | Templates, QA |
| **"Rapidly create, localize, publish notifications"** | End-to-end workflow from creation to deployment | All pages |
| **"High volume of requests"** | Request queue handles multiple brands/priorities | Dashboard, Requests |
| **"Varying complexity and business criticality"** | P0/P1/P2 priority system | Requests |
| **"From every PayPal product team"** | Multi-brand support (PayPal/Venmo/Zettle/Xoom/Fastlane) | All pages |
| **"Last line before production"** | QA validation dashboard with blocking logic | QA |
| **"Ensure templates working as expected"** | 5 automated quality checks | QA |
| **"Requisite localization files"** | Locale completeness validation | QA |
| **"First line of defense for live issues"** | Debug simulator with diagnosis workflow | Debug |
| **"Monitor Slack channels, debug issues"** | Live issue simulation and resolution | Debug |
| **"Rapidly implement bug fixes"** | Quick-fix deployment workflow | Debug |
| **"Analyze throughput blockers"** | Bottleneck identification analytics | Debug |
| **"Strategize to improve workflows"** | Data-driven optimization insights | Debug |
| **"Prototype and test React components"** | Preview tool, component library | Templates |
| **"Localization quality assurance"** | Locale management system | QA |
| **"Global deployment"** | 10+ language support | QA |
| **"Content design collaboration"** | Preview tool for stakeholder review | Templates |

---

## 🎬 Complete Demo Script (15 minutes)

### **Act 1: Introduction (1 min)**

**You:** "Hi! Today I'm going to demo a system I built that mirrors the SNOCAT Production Engineer role. This manages notification templates for PayPal and its brands - Venmo, Zettle, Xoom, and Fastlane."

**[Open Dashboard]**

**You:** "As a PE, my day starts here. I see 5 total requests, 3 active, 2 deployed. This gives me immediate visibility into workload."

---

### **Act 2: Request Queue (2 min)**

**[Navigate to Requests]**

**You:** "Here's my request queue. I receive requests from all PayPal brands with different priorities."

**[Point to P0 Venmo request]**

**You:** "This P0 Venmo security alert is critical - I'd handle this first. P0 means same-day resolution required."

**[Point to status pipeline]**

**You:** "Each request moves through a pipeline: New → In Progress → Localization → QA Review → Deployed. This one is in QA Review, which means I'm validating it right now."

**[Update a request status]**

**You:** "I can track progress in real-time. Let me move this to Deployed."

---

### **Act 3: Template Management (3 min)**

**[Navigate to Templates]**

**You:** "Let me show you template creation. I'll select Venmo and create a new template."

**[Click Create New]**

**You:** "I'm creating a payment alert template. Notice I'm using placeholders like `{{user.name}}` and `{{transaction.amount}}` for dynamic content."

**[Fill in form]**
- Name: "Payment Alert"
- Subject: "Payment Received - {{transaction.id}}"
- Body: (use simple HTML with placeholders)

**[Click Create]**

**You:** "System automatically extracts placeholders and versions the template. Now let me preview it."

**[Click Preview]**

**You:** "I can switch languages and inject test data to see exactly what customers will receive."

**[Switch to Spanish, modify test data]**

**You:** "See how it instantly re-renders? This lets product teams review before deployment."

---

### **Act 4: QA Validation - THE CRITICAL PART (4 min)**

**[Navigate to QA → Validation tab]**

**You:** "This is my most important responsibility - I'm the last checkpoint before millions of customers see these notifications."

**[Select template, click Run Validation]**

**You:** "I run 5 automated quality checks on every template."

**[Wait for results - show WARNING status]**

**You:** "See this? Status is WARNING because French locale is incomplete."

**[Expand Locale Completeness check]**

**You:** "French is only 80% complete - missing 2 keys. If I deployed this, French users would see broken emails."

**[Click Locale Management tab]**

**You:** "I can fix this immediately. Let me select French and add the missing translations."

**[Add missing keys with French translations]**
- Add "footer": "Merci d'utiliser PayPal"
- Add "customer_support": "Besoin d'aide? Contactez le support"

**[Click Save]**

**You:** "Now let me re-run validation."

**[Go back to Validation tab, run again]**

**[Show PASS status]**

**You:** "Perfect! Now it's 100% complete across all languages. Status is PASS - ready for production."

**[Point to green box]**

**You:** "This is what 'last line of defense' means - these checks prevent broken templates from reaching customers."

---

### **Act 5: Production Debugging (3 min)**

**[Navigate to Debug page]**

**You:** "When issues hit production, I'm the first responder. Let me show you how I'd handle a live issue."

**[Point to Issue #1: Missing German Locale]**

**You:** "Imagine I get a Slack alert: 'Emails failing in Germany.' Here's my workflow."

**[Click Investigate]**

**You:** "I investigate and find the diagnosis: German locale file is missing required keys."

**[Point to fix description]**

**You:** "Fix is clear: upload complete de.json file. In reality, I'd do this immediately."

**[Click Deploy Fix]**

**You:** "Issue resolved! In a real scenario, I'd update the Slack thread and verify emails are sending."

**[Point to Issue #2]**

**You:** "Here's another common issue - a typo in a placeholder. Instead of `{{user.name}}`, someone wrote `{{user.nane}}`. Customers are seeing the placeholder text instead of their names."

**[Show the diagnosis]**

**You:** "QA validation would have caught this, but if it slipped through, I'd fix it immediately by updating the template."

---

### **Act 6: Analytics & Optimization (2 min)**

**[Scroll to Analytics section]**

**You:** "Part of my role is improving the process. Analytics show me where we're slow."

**[Point to Bottleneck Analysis]**

**You:** "Right now, localization is the bottleneck - it's taking 60% of our total time."

**[Point to metrics]**

**You:** "Average cycle time is 24 hours. My goal would be to reduce this by optimizing the localization stage."

**[Point to brand breakdown]**

**You:** "I can see PayPal is our highest-volume brand, Venmo is second. This helps with resource planning."

**You:** "With this data, I'd work with the localization team to understand delays and potentially build automation - like pre-translating common phrases or creating a translation memory system."

---

### **Conclusion (1 min)**

**You:** "So to recap, this system demonstrates my ability to:

1. ✅ Manage high-volume requests across multiple brands
2. ✅ Ensure quality as the last checkpoint before production
3. ✅ Handle localization across 10+ languages
4. ✅ Debug and fix live production issues quickly
5. ✅ Analyze metrics to optimize workflows
6. ✅ Build tools and automation with React and Node.js

Every feature maps directly to the SNOCAT Production Engineer job description. I built this to show I understand the role and have the technical skills to execute."

**You:** "Any questions about how this works or how it applies to the PE role?"

---

## 🔧 Technical Deep Dive

### Architecture Overview

```
┌─────────────────┐
│   React UI      │  ← User interaction
│  (TypeScript)   │
└────────┬────────┘
         │ HTTP/JSON
         ▼
┌─────────────────┐
│  Express API    │  ← Business logic
│   (Node.js)     │
└────────┬────────┘
         │ File I/O
         ▼
┌─────────────────┐
│  JSON Files     │  ← Data persistence
│  (File System)  │
└─────────────────┘
```

### Backend Architecture

**Layers:**
1. **Routes** (`routes/`) - HTTP endpoints
2. **Services** (`services/`) - Business logic
3. **Utils** (`utils/`) - Helper functions
4. **Data** (`data/`) - Storage

**Example Flow: GET /api/templates/paypal**
```
1. Request → routes/templates.js
2. Route calls → services/templateService.getAllTemplates('paypal')
3. Service calls → utils/fileManager.listFiles('templates/paypal')
4. FileManager reads → data/templates/paypal/*.json
5. Response ← JSON array of templates
```

### Frontend Architecture

**Structure:**
- **Pages** - Full screens
- **Components** - Reusable UI pieces
- **Services** - API communication
- **Types** - TypeScript definitions

**State Management:**
- Using React `useState` hooks (simple, no Redux needed)
- API calls via Axios
- Real-time updates on user actions

### Data Validation Flow

**QA Validation Technical Details:**

```javascript
// Validation Service Logic
export const validateTemplate = async (template) => {
  const results = { status: 'pass', checks: [] };

  // Check 1: Locale Completeness
  const placeholders = extractPlaceholders(template.body);
  const localeCheck = await checkLocaleCompleteness(placeholders);

  // Check 2: Placeholder Validation
  const placeholderCheck = validatePlaceholders(template);

  // Check 3: HTML Validation
  const htmlIssues = validateHTML(template.body);

  // Check 4: Link Validation
  const linkIssues = validateLinks(template.body);

  // Check 5: Brand Compliance
  const complianceIssues = checkBrandCompliance(template);

  // Aggregate results
  if (hasFailures) results.status = 'fail';
  else if (hasWarnings) results.status = 'warning';

  return results;
};
```

### API Endpoints Reference

```
Templates:
GET    /api/templates/:brand          # List all templates for brand
GET    /api/templates/:brand/:id      # Get specific template
POST   /api/templates/:brand          # Create new template
PUT    /api/templates/:brand/:id      # Update template
DELETE /api/templates/:brand/:id      # Delete template

Locales:
GET    /api/locales                   # List all locales
GET    /api/locales/:lang             # Get specific locale
PUT    /api/locales/:lang             # Update locale
POST   /api/locales/check-completeness # Check locale coverage

Validation:
POST   /api/validation/validate       # Run QA checks on template

Requests:
GET    /api/requests                  # Get request queue
POST   /api/requests                  # Create request
PUT    /api/requests/:id              # Update request
DELETE /api/requests/:id              # Delete request

Analytics:
GET    /api/analytics                 # Get metrics
```

---

## 💡 Interview Talking Points

### When they ask specific questions:

**Q: "How do you ensure quality before deployment?"**
A: "I use a 5-check automated validation system that acts as a quality gate. Every template must pass locale completeness, placeholder validation, HTML structure, link validation, and brand compliance checks. If any check fails, deployment is blocked. For example, [show QA dashboard], this template has a warning because French translations are incomplete - I wouldn't deploy until that's at 100%."

**Q: "How do you handle high volume?"**
A: "I use a priority-based queue system. P0 items like security alerts get immediate attention, P1 within 24 hours, P2 within 3 days. The status pipeline prevents bottlenecks - I can see if too many requests are stuck in localization and escalate. [Show request queue] Right now I have 5 requests across 4 brands, each tracked through the workflow."

**Q: "How do you debug production issues?"**
A: "I follow a systematic workflow: receive alert, investigate to diagnose root cause, implement fix, deploy, verify, and communicate resolution. [Show debug simulator] For example, if German emails are failing, I'd check locale files, find missing translations, add them, deploy, and test. The key is speed - I prioritize live issues over new work."

**Q: "How do you optimize processes?"**
A: "I use analytics to identify bottlenecks. [Show analytics] Currently, localization is taking 60% of cycle time. I'd work with the localization team to understand why - maybe they're overloaded, maybe the process needs automation. Then I'd build tools to streamline it - like creating a translation memory or pre-translating common phrases."

**Q: "What technologies do you use?"**
A: "For this demo: React with TypeScript for the frontend, Node.js with Express for the backend, and file-based storage for simplicity. In production, I'd use PostgreSQL or similar for data persistence, add authentication, integrate with PayPal's CI/CD pipeline, and potentially use a templating engine like Handlebars for more complex rendering."

---

## 🚀 Next Steps After Demo

### If they're impressed:
- Offer to walk through the code
- Explain how you'd extend it for production (database, auth, real email sending)
- Discuss integration with PayPal's existing systems

### If they have questions:
- Use the system to illustrate your answers
- Show specific pages/features relevant to their question
- Demonstrate technical depth

### If they want more:
- Explain how you'd add A/B testing
- Discuss deployment pipeline automation
- Show how you'd integrate with existing PayPal services (authentication, user data, etc.)

---

**Good luck! You've got this! 🚀**
