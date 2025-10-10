# SNOCAT Project - Interview Questions & Answers

**Note:** This project demonstrates a full-stack notification management system with Email Templates, SMS Messages, HTML Components, Localization, QA Validation, and Request Queue management.

## Architecture & Design (Technical)

### 1. **How did you architect the component system in SNOCAT?**

**Answer:** I designed a three-tier component architecture:

**Backend Layer:**
- `components.json` - File-based storage for HTML components
- `componentService.js` - Business logic for CRUD operations
- `routes/components.js` - RESTful API endpoints

**Frontend Layer:**
- `Components.tsx` - Management UI for creating/editing components
- `componentAPI` - Axios service for API communication
- Template rendering system that replaces `{{temp.*}}` shortcodes with actual HTML

**Integration Point:**
The key innovation was using a namespaced shortcode system (`{{temp.component_id}}`) to avoid collision with localization keys (`{{greeting}}`) and dynamic data (`{{user.name}}`).

### 2. **Explain the rendering pipeline when a component is used in a template.**

**Answer:** The rendering happens in three stages:

**Stage 1 - Component Resolution (First):**
```javascript
components.forEach(component => {
  const regex = new RegExp(`\\{\\{temp\\.${component.id}\\}\\}`, 'g');
  rendered = rendered.replace(regex, component.html);
});
```

**Stage 2 - Locale Data (Second):**
```javascript
Object.entries(localeData).forEach(([key, value]) => {
  const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
  rendered = rendered.replace(regex, value);
});
```

**Stage 3 - Dynamic Data (Last):**
```javascript
Object.entries(testData).forEach(([key, value]) => {
  const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
  rendered = rendered.replace(regex, value);
});
```

This order ensures components can contain locale placeholders, which then get resolved.

### 3. **How does email sending integrate with the component system?**

**Answer:** The email service (`emailService.js`) loads components from `componentService.getAllComponents()` and renders them before sending:

```javascript
const renderTemplate = async (text) => {
  let rendered = text;

  // Load components dynamically
  const components = await getAllComponents();
  components.forEach(component => {
    const regex = new RegExp(`\\{\\{temp\\.${component.id}\\}\\}`, 'g');
    rendered = rendered.replace(regex, component.html);
  });

  // Then replace test data
  Object.entries(testData).forEach(([key, value]) => {
    rendered = rendered.replace(regex, value);
  });

  return rendered;
};
```

This ensures emails contain fully rendered HTML, not placeholder text.

### 4. **Why did you choose file-based storage instead of a database?**

**Answer:** Three strategic reasons:

1. **Demo Simplicity** - No database setup required, easier to showcase
2. **Production Scalability** - The service layer abstraction (`componentService.js`) makes it trivial to swap file operations with database queries later
3. **Portability** - Can run anywhere without dependencies, perfect for local development and quick deployments

The architecture uses service layers, so migrating to PostgreSQL would only require changing `componentService.js` implementation, not the API or frontend.

### 5. **How did you handle React state management for real-time validation?**

**Answer:** I used `useEffect` with dependency tracking:

```javascript
useEffect(() => {
  if (formData.body || formData.subject) {
    const errors = validateRealtime(formData.body, formData.subject);
    setValidationErrors(errors);
  }
}, [formData.body, formData.subject, localeData]);
```

Every keystroke triggers validation by watching `formData.body` and `formData.subject`. Including `localeData` in dependencies ensures validation reruns when locale keys are loaded, catching missing translations.

### 6. **Explain your regex approach for placeholder replacement.**

**Answer:** I use escaped regex patterns to safely match placeholders:

```javascript
const regex = new RegExp(
  `\\{\\{${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`,
  'g'
);
```

**Why this approach:**
- `key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')` - Escapes special regex characters
- `\\{\\{` and `\\}\\}` - Matches literal braces
- `'g'` flag - Replaces all occurrences, not just first

This handles edge cases like `{{user.name}}` where the dot needs escaping.

### 7. **How does the component inserter dropdown work in the template editor?**

**Answer:** It uses a controlled select element with onChange handler:

```javascript
<select
  onChange={(e) => {
    if (e.target.value) {
      const shortcode = `{{temp.${e.target.value}}}`;
      setFormData({ ...formData, body: formData.body + shortcode });
      e.target.value = ''; // Reset dropdown
    }
  }}
>
  <option value="">+ Insert Component</option>
  {components.map(comp => (
    <option key={comp.id} value={comp.id}>{comp.name}</option>
  ))}
</select>
```

Selecting a component appends its shortcode to the template body and resets the dropdown for next insertion.

### 8. **What's your approach to TypeScript type safety across the stack?**

**Answer:** I defined shared interfaces in `types/index.ts`:

```typescript
export interface Component {
  id: string;
  name: string;
  description: string;
  html: string;
  createdAt: string;
}
```

This interface is used across:
- API service definitions (`componentAPI`)
- React component props
- State management

TypeScript catches type mismatches at compile time, preventing runtime errors.

### 9. **How did you handle the code editor toggle feature?**

**Answer:** Conditional rendering with state toggle:

```javascript
const [useCodeEditor, setUseCodeEditor] = useState(false);

{useCodeEditor ? (
  <CodeMirror
    value={formData.html}
    theme={oneDark}
    extensions={[html()]}
    onChange={(value) => setFormData({ ...formData, html: value })}
  />
) : (
  <textarea
    value={formData.html}
    onChange={(e) => setFormData({ ...formData, html: e.target.value })}
  />
)}
```

Both editors share the same `formData.html` state, so switching preserves content. CodeMirror adds syntax highlighting and auto-indentation for production use.

### 10. **Explain your API architecture and RESTful design.**

**Answer:** I followed REST conventions with consistent patterns across all resources:

```
Components:
GET    /api/components       - List all components
GET    /api/components/:id   - Get single component
POST   /api/components       - Create component
PUT    /api/components/:id   - Update component
DELETE /api/components/:id   - Delete component

SMS:
GET    /api/sms?brand=paypal - List SMS (with optional brand filter)
GET    /api/sms/:id          - Get single SMS
POST   /api/sms              - Create SMS
PUT    /api/sms/:id          - Update SMS
DELETE /api/sms/:id          - Delete SMS

Templates, Locales, Requests follow similar patterns
```

**Key design decisions:**
- Stateless endpoints (no server-side sessions)
- Standard HTTP status codes (200, 201, 404, 500)
- JSON request/response bodies
- Consistent error format: `{ error: "message" }`

### 11. **How does the PreviewPanel load and render components?**

**Answer:** PreviewPanel loads components on mount using `useEffect`:

```javascript
useEffect(() => {
  loadLocale(locale);
  loadComponents();
}, [locale]);

const loadComponents = async () => {
  try {
    const response = await componentAPI.getAll();
    setComponents(response.data);
  } catch (error) {
    console.error('Error loading components:', error);
  }
};
```

Then uses the same `renderTemplate` function as TemplateEditor to replace shortcodes, ensuring consistent rendering across preview and editor.

### 12. **What's your error handling strategy?**

**Answer:** Multi-layered approach:

**Frontend:**
```javascript
try {
  await componentAPI.create(formData);
} catch (error) {
  console.error('Error saving component:', error);
  // User feedback via state
}
```

**Backend:**
```javascript
router.post('/', async (req, res) => {
  try {
    const component = await componentService.createComponent(req.body);
    res.status(201).json(component);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Errors are caught at service layer, logged for debugging, and returned as JSON with appropriate HTTP status codes.

### 13. **How does the SMS system work and how does it integrate with localization?**

**Answer:** The SMS system follows the same architecture as email templates but simplified for SMS constraints:

**Backend:**
```javascript
// smsService.js - Similar to templateService
export const createSMS = async (smsData) => {
  const placeholders = extractPlaceholders(smsData.message);
  const newSMS = {
    id: `sms-${Date.now()}`,
    name: smsData.name,
    brand: smsData.brand,
    message: smsData.message,
    placeholders, // Auto-extracted
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  // Save to sms.json
};
```

**Frontend SMS Rendering:**
```javascript
const renderPreview = (text: string) => {
  let rendered = text;

  // Replace locale data first
  Object.entries(localeData).forEach(([key, value]) => {
    rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  });

  // Replace dynamic data (user.name, transaction.amount)
  Object.entries(testData).forEach(([key, value]) => {
    rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  });

  return rendered;
};
```

**Key Features:**
- **Character Count Warning:** Alerts when message exceeds 160 characters (may split into multiple SMS)
- **Shared Localization:** Uses the same locale data as email templates
- **Brand Filtering:** Each brand (PayPal, Venmo, etc.) has its own SMS messages
- **Live Preview:** Shows SMS in mobile-style message bubble with locale rendering
- **Best Practices Panel:** Reminds users to keep messages concise

**Example SMS Message:**
```
{{greeting}}! You received {{transaction.amount}} from {{user.name}}. Ref: {{transaction.id}}
```

Becomes:
```
Hello! You received $50.00 from lokesh. Ref: TXN-123456
```

### 14. **Why keep SMS separate from email templates?**

**Answer:** Three key reasons:

1. **Different Constraints:** SMS has 160-character limit, no HTML, plain text only
2. **Different Use Cases:** SMS for urgent/time-sensitive notifications, emails for detailed content
3. **Separate Delivery Channels:** SMS uses different APIs (Twilio, AWS SNS) than email (SMTP, SendGrid)

However, they share:
- Same localization system
- Same placeholder architecture
- Same brand organization
- Similar CRUD operations

This demonstrates understanding of when to DRY (shared localization) vs. when to separate concerns (different delivery channels).

---

## React & Frontend (Technical)

### 15. **Why did you use Vite instead of Create React App?**

**Answer:** Performance and modern tooling:

1. **Faster Dev Server** - Vite uses native ES modules, starts instantly
2. **Smaller Bundle** - Better tree-shaking and code splitting
3. **Modern Features** - Out-of-box TypeScript, HMR, and environment variables
4. **Production Ready** - PayPal uses Vite in production for similar projects

Vite's `import.meta.env` for environment variables is cleaner than CRA's `process.env`.

### 16. **How did you implement the navigation without React Router?**

**Answer:** Simple state-based routing:

```javascript
type Page = 'dashboard' | 'templates' | 'components' | 'sms' | 'requests' | 'qa' | 'debug';
const [currentPage, setCurrentPage] = useState<Page>('dashboard');

const renderPage = () => {
  switch (currentPage) {
    case 'components': return <Components />;
    case 'sms': return <SMS />;
    // ...
  }
};
```

**Why this approach:**
- No URL changes needed (SPA demo)
- Simpler state management
- Faster navigation (no route parsing)
- Perfect for component-based demos

### 17. **Explain your component composition strategy.**

**Answer:** I used smart/presentational pattern:

**Smart Components (Pages):**
- `Components.tsx` - Manages state, API calls, business logic
- Handles create/edit/delete operations
- Loads data on mount

**Presentational Components:**
- `CodeMirror` - Pure UI, accepts props
- Form elements - Controlled components

This separation makes components reusable and easier to test.

### 18. **How does the live preview update in real-time?**

**Answer:** React's reactive rendering:

```javascript
const renderPreview = (text: string) => {
  // Render logic
};

<div dangerouslySetInnerHTML={{
  __html: formData.body ? renderPreview(formData.body) : placeholderHTML
}} />
```

Every keystroke updates `formData.body` → triggers re-render → `renderPreview` called → preview updates. The `dangerouslySetInnerHTML` safely renders HTML strings.

### 19. **What's your approach to form validation?**

**Answer:** Multi-layered validation:

**Client-side (Immediate):**
```javascript
const validateRealtime = (htmlBody: string, subject: string) => {
  const errors: string[] = [];

  // HTML tag matching
  if (opens.length !== closes.length) {
    errors.push('HTML: Mismatched tags');
  }

  // Link validation
  // Compliance checks
  // Localization checks

  return errors;
};
```

**Server-side (On submit):**
Backend validates again before saving. Never trust client validation alone.

### 20. **How did you handle the 2-column layout in PreviewPanel?**

**Answer:** CSS Grid:

```javascript
<div className="grid grid-cols-2 gap-6">
  <div>{/* Left: Test Data & Locale Status */}</div>
  <div>{/* Right: Subject, HTML, Plain Text */}</div>
</div>
```

Tailwind's `grid-cols-2` creates equal columns. `gap-6` adds spacing. This is responsive and maintains aspect ratio.

### 21. **Explain your state management approach without Redux.**

**Answer:** I used React's built-in hooks:

**Local State (useState):**
```javascript
const [components, setComponents] = useState<Component[]>([]);
const [formData, setFormData] = useState({ name: '', html: '' });
```

**Side Effects (useEffect):**
```javascript
useEffect(() => {
  loadComponents();
}, [brand]);
```

**Why no Redux:**
- State is mostly component-scoped
- No complex shared state
- Simpler codebase for demos
- React Query would be next step for production

### 22. **How does the copy-to-clipboard feature work?**

**Answer:** Browser Clipboard API:

```javascript
const copyShortcode = (id: string) => {
  navigator.clipboard.writeText(`{{temp.${id}}}`);
  alert(`Shortcode {{temp.${id}}} copied to clipboard!`);
};
```

Modern browsers support `navigator.clipboard`. Fallback would use `document.execCommand('copy')` for older browsers.

---

## Backend & Node.js (Technical)

### 23. **Why Express instead of Fastify or NestJS?**

**Answer:**

**Express chosen because:**
- Industry standard at PayPal
- Lightweight and flexible
- Massive ecosystem
- Team familiarity

**NestJS** would add unnecessary complexity for this scope. **Fastify** would be my choice for high-performance production, but Express is more universally understood for demos.

### 24. **How did you structure the backend services?**

**Answer:** Three-layer architecture:

**Layer 1 - Routes (HTTP handling):**
```javascript
router.post('/', async (req, res) => {
  try {
    const component = await componentService.createComponent(req.body);
    res.status(201).json(component);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Layer 2 - Services (Business logic):**
```javascript
export const createComponent = async (componentData) => {
  const newComponent = {
    id: generateId(componentData.name),
    ...componentData,
    createdAt: new Date().toISOString()
  };

  components.push(newComponent);
  await fs.writeFile(COMPONENTS_FILE, JSON.stringify(components, null, 2));

  return newComponent;
};
```

**Layer 3 - Data (File operations):**
File I/O happens in service layer, easily replaceable with DB queries.

### 25. **How does Nodemailer integrate with Gmail?**

**Answer:** SMTP transport configuration:

```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD  // Not regular password!
  }
});
```

**Key points:**
- Uses Gmail's SMTP server
- Requires App-Specific Password (not account password)
- 2FA must be enabled on Gmail account
- Free tier: 500 emails/day

### 26. **How do you handle environment variables securely?**

**Answer:**

**Development:**
```javascript
// backend/.env (gitignored)
EMAIL_USER=lloke634@gmail.com
EMAIL_APP_PASSWORD=asgm pylf xqba kylm
```

**Production (Render):**
Set via dashboard environment variables, never committed to code.

**Loading:**
```javascript
import 'dotenv/config';  // Loads .env into process.env
```

The `.env` file is in `.gitignore`, so credentials never reach GitHub.

### 27. **Explain your file-based JSON storage strategy.**

**Answer:**

```javascript
const COMPONENTS_FILE = path.join(__dirname, '../../data/components.json');

export const getAllComponents = async () => {
  const data = await fs.readFile(COMPONENTS_FILE, 'utf-8');
  return JSON.parse(data);
};

export const createComponent = async (componentData) => {
  const components = await getAllComponents();
  components.push(newComponent);
  await fs.writeFile(COMPONENTS_FILE, JSON.stringify(components, null, 2));
  return newComponent;
};
```

**Pros:**
- Zero setup
- Easy to debug (human-readable)
- Version control friendly

**Production Migration Path:**
Replace with PostgreSQL queries, keeping the same service interface.

### 28. **How does CORS work in your setup?**

**Answer:**

```javascript
import cors from 'cors';
app.use(cors());
```

This allows any origin to access the API. In production, I'd restrict:

```javascript
app.use(cors({
  origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
  credentials: true
}));
```

### 29. **What's your approach to API versioning?**

**Answer:** Currently using implicit v1:

```
/api/components
```

For production, I'd implement:

```
/api/v1/components
/api/v2/components
```

This allows breaking changes without affecting existing clients. Versioning can be in URL or headers (`Accept: application/vnd.api+json; version=1`).

### 30. **How do you handle concurrent writes to JSON files?**

**Answer:** Current implementation has race condition risk. For production:

**Option 1 - File locking:**
```javascript
import lockfile from 'proper-lockfile';

const release = await lockfile.lock(COMPONENTS_FILE);
// Read, modify, write
await release();
```

**Option 2 - Database with transactions:**
PostgreSQL handles this natively with ACID guarantees.

For demo purposes, race conditions are unlikely with single user.

---

## System Design (Technical)

### 31. **How would you scale this system for production at PayPal scale?**

**Answer:**

**Current (Demo):**
- Single Node.js instance
- File-based storage
- Synchronous rendering

**Production (PayPal Scale):**

**Backend:**
- Load balancer → Multiple Node.js instances (horizontal scaling)
- PostgreSQL with read replicas
- Redis for caching frequently used components
- Message queue (Kafka) for async email sending

**Frontend:**
- CDN for static assets (CloudFront/Fastly)
- Server-side rendering for SEO
- Code splitting for faster initial load

**Email:**
- SendGrid/AWS SES instead of Gmail
- Queue-based processing
- Rate limiting per brand

### 30. **What are the potential bottlenecks in your current architecture?**

**Answer:**

**1. File I/O on every request:**
- Solution: In-memory cache with file watching for changes

**2. Synchronous email sending:**
- Solution: Background job queue (Bull/BeeQueue)

**3. No rate limiting:**
- Solution: Express rate limiter middleware

**4. Single-threaded Node.js:**
- Solution: Cluster mode or PM2

**5. No database indexes:**
- When migrating to PostgreSQL, add indexes on frequently queried fields

### 33. **How would you implement authentication/authorization?**

**Answer:**

**Authentication (Who are you):**
```javascript
// JWT-based
import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
```

**Authorization (What can you do):**
```javascript
// Role-based access control
const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

router.delete('/:id', authMiddleware, requireRole('admin'), deleteComponent);
```

### 34. **Describe your testing strategy.**

**Answer:**

**Unit Tests (Jest):**
```javascript
describe('componentService', () => {
  test('createComponent generates unique ID', async () => {
    const component = await createComponent({ name: 'Test Button', html: '<button>Test</button>' });
    expect(component.id).toBe('test_button');
  });
});
```

**Integration Tests (Supertest):**
```javascript
describe('POST /api/components', () => {
  test('creates component and returns 201', async () => {
    const res = await request(app)
      .post('/api/components')
      .send({ name: 'Login', html: '<button>Login</button>' });
    expect(res.status).toBe(201);
  });
});
```

**E2E Tests (Playwright):**
```javascript
test('user can create and use component', async ({ page }) => {
  await page.goto('/components');
  await page.click('text=Create Component');
  await page.fill('[name=name]', 'Login Button');
  await page.fill('[name=html]', '<button>Login</button>');
  await page.click('text=Create');
  await expect(page.locator('text=Login Button')).toBeVisible();
});
```

### 35. **How would you monitor this system in production?**

**Answer:**

**Application Monitoring:**
- New Relic / Datadog for APM
- Track API response times
- Error rates and stack traces
- Component usage analytics

**Infrastructure Monitoring:**
- CloudWatch / Prometheus for server metrics
- CPU, memory, disk usage
- Database query performance

**Business Metrics:**
- Components created per day
- Email send success rate
- Template render times
- Most used components

**Alerting:**
- Slack/PagerDuty integration
- Alert on error rate > 5%
- Alert on API latency > 500ms

### 36. **What security concerns exist and how would you address them?**

**Answer:**

**Current Vulnerabilities:**

**1. XSS (Cross-site scripting):**
Component HTML is trusted. Malicious user could inject:
```html
<script>alert('XSS')</script>
```

**Solution:** Sanitize HTML with DOMPurify:
```javascript
import DOMPurify from 'dompurify';
component.html = DOMPurify.sanitize(userInput);
```

**2. No rate limiting:**
API can be spammed.

**Solution:**
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

**3. Email injection:**
User-provided recipient email could be malicious.

**Solution:** Validate email format:
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(recipient)) {
  throw new Error('Invalid email');
}
```

**4. No HTTPS:**
Credentials sent in plain text.

**Solution:** Enforce HTTPS in production, use Helmet middleware.

---

## Non-Technical (Product & Process)

### 35. **Why did you build this project?**

**Answer:** I built SNOCAT to demonstrate my understanding of PayPal's Production Engineer role for System Notifications. The job description emphasized:

- Managing notification templates across multiple brands
- Localization and QA workflows
- Production debugging and monitoring
- Handling high-volume request queues

This project showcases all these skills in a working application that mirrors PayPal's SNOCAT system.

### 36. **What problem does the component system solve?**

**Answer:**

**Problem:**
Email templates across PayPal, Venmo, Zettle share common elements (buttons, footers, headers). Without components, each template duplicates this HTML. When brand guidelines change, you must update hundreds of templates manually.

**Solution:**
Components act as reusable building blocks. Update the `paypal_footer` component once, and all templates using `{{temp.paypal_footer}}` automatically reflect the change.

**Business Impact:**
- 90% faster brand updates
- Consistent user experience
- Reduced QA time
- Fewer production bugs

### 37. **How would you prioritize features for the next sprint?**

**Answer:** Using RICE framework (Reach × Impact × Confidence / Effort):

**High Priority:**
1. Component versioning - High impact, prevents breaking changes
2. Email template A/B testing - Direct revenue impact
3. Batch email sending - Scalability requirement

**Medium Priority:**
4. Rich text editor for components - Better UX, moderate effort
5. Component usage analytics - Helps identify unused components

**Low Priority:**
6. Dark mode - Nice to have, low business impact
7. Component categories/tags - Organizational, can wait

### 38. **How do you handle disagreements with stakeholders about technical decisions?**

**Answer:**

**Example:** Stakeholder wants real-time collaborative editing (like Google Docs) for templates.

**My approach:**
1. **Understand the "why"** - What problem are they solving?
2. **Quantify the cost** - Real-time collab needs WebSockets, complex conflict resolution, 3-4 week effort
3. **Propose alternatives** - Template versioning + merge conflict UI (1 week effort, 80% of value)
4. **Data-driven decision** - "How many users edit same template simultaneously?" If rare, simpler solution wins.
5. **Document decision** - ADR (Architecture Decision Record) for future reference

The key is collaborative problem-solving, not "I'm right, you're wrong."

### 39. **How would you onboard a new engineer to this codebase?**

**Answer:**

**Day 1:**
- Project overview and architecture walkthrough
- Run locally (README has clear instructions)
- Make first commit: Fix a "good first issue" bug

**Week 1:**
- Pair programming on a small feature
- Code review their PR, explain patterns
- Give them ownership of one component

**Documentation I'd provide:**
1. **README.md** - Setup and running
2. **ARCHITECTURE.md** - System design and data flow
3. **CONTRIBUTING.md** - Code standards and PR process
4. **DEMO_GUIDE.md** - How to demo features

**Success metric:** Can they add a new API endpoint independently by end of week 1?

### 40. **What would you do differently if starting over?**

**Answer:**

**Technical:**
1. **Start with TypeScript on backend** - Currently JS, would benefit from type safety
2. **Use React Query** - Better caching and state management than manual `useState` + `useEffect`
3. **Implement proper logging** - Winston or Pino for structured logs
4. **Add OpenAPI/Swagger docs** - Self-documenting API

**Process:**
1. **Write tests first** - TDD would catch bugs earlier
2. **Design system tokens** - Consistent colors/spacing from day 1
3. **Performance budgets** - Set bundle size limits upfront

**What I'd keep:**
- File-based storage for demo
- Simple state management
- Component system architecture
- Progressive enhancement approach

### 41. **How do you ensure code quality?**

**Answer:**

**Automated:**
- ESLint for JavaScript/TypeScript linting
- Prettier for code formatting
- Husky for pre-commit hooks
- GitHub Actions for CI/CD

**Manual:**
- Code reviews (at least 1 approval required)
- Pair programming for complex features
- Architecture review for major changes

**Standards:**
- DRY principle (Don't Repeat Yourself)
- SOLID principles for classes
- Meaningful variable names
- Comments explain "why", not "what"

### 42. **Describe a technical challenge you faced in this project.**

**Answer:**

**Challenge:** Component shortcodes were colliding with localization keys.

**Initial approach:**
```
{{login_button}}  ← Component
{{greeting}}      ← Locale key
```

Both use same syntax, causing ambiguity.

**Solution:** Namespaced components:
```
{{temp.login_button}}  ← Component (temp namespace)
{{greeting}}           ← Locale key (no namespace)
```

**Implementation:**
Modified regex patterns in all rendering functions:
```javascript
// Before
const regex = new RegExp(`\\{\\{${component.id}\\}\\}`, 'g');

// After
const regex = new RegExp(`\\{\\{temp\\.${component.id}\\}\\}`, 'g');
```

Updated UI to display `{{temp.*}}` format in copy buttons and documentation.

**Learning:** Namespace early to avoid breaking changes later.

### 43. **How do you stay current with technology trends?**

**Answer:**

**Daily:**
- Hacker News, Dev.to for industry news
- Twitter/X following tech leaders (Dan Abramov, Kent C. Dodds)

**Weekly:**
- JavaScript Weekly, Node Weekly newsletters
- Read 1-2 technical blog posts
- Contribute to open source

**Monthly:**
- Try a new library/framework in side project
- Attend local meetups (React, Node.js groups)
- Online courses (Frontend Masters, Egghead)

**Applied to this project:**
- Used latest React 18 features
- Vite for modern bundling
- CodeMirror 6 (latest version)

### 44. **What metrics would you track for this system?**

**Answer:**

**Technical Metrics:**
- API response time (p50, p95, p99)
- Error rate by endpoint
- Component render time
- Email delivery rate
- Template validation pass/fail rate

**Product Metrics:**
- Components created per week
- Most used components (top 10)
- Templates using components (adoption rate)
- Time to create template (with vs without components)
- Email open rates by template

**Business Metrics:**
- Requests completed per day
- SLA compliance (P0 in 24hrs, P1 in 48hrs)
- QA bottleneck duration
- Cycle time (request → deployed)

### 45. **How would you communicate a production incident to stakeholders?**

**Answer:**

**Template I'd use:**

```
Subject: [INCIDENT] Email Sending Failure - RESOLVED

Severity: P1 (High)
Status: RESOLVED
Duration: 45 minutes (10:30 AM - 11:15 AM PST)

IMPACT:
- 1,200 emails failed to send
- PayPal payment confirmation templates affected
- No data loss, emails queued for retry

ROOT CAUSE:
Gmail SMTP rate limit exceeded due to batch send bug

FIX:
- Implemented rate limiting (100 emails/minute)
- Retried failed emails successfully
- All 1,200 emails delivered

PREVENTION:
- Added rate limiter to email service
- Monitoring alert for send failures
- Batch size limits enforced

NEXT STEPS:
- Migrate to SendGrid (higher limits)
- Add circuit breaker pattern
- Postmortem scheduled for tomorrow 2 PM
```

**Communication channels:**
- Real-time: Slack
- Post-incident: Email summary
- Follow-up: Postmortem doc

### 46. **What's your approach to technical debt?**

**Answer:**

**Identification:**
- Code smells during reviews
- TODO comments tracked in tickets
- Performance issues in production

**Prioritization:**
- **P0:** Blocking new features or causing bugs
- **P1:** Slowing down development
- **P2:** Nice to have, low impact

**Management:**
- 20% of each sprint for tech debt
- Document debt in ADRs
- Refactor during related feature work

**Example from this project:**
Current file-based storage is tech debt. It's fine for demo, but documented as debt for production migration.

### 47. **How do you balance speed and quality?**

**Answer:**

**Framework: Quality Triangle**

For this demo project:
- **Speed:** 2 weeks to build
- **Quality:** Production-level code patterns
- **Scope:** Core features only, no auth

**Decision-making:**
- Must-have: Component system, email sending, real-time validation
- Nice-to-have: Dark mode, advanced analytics, rich text editor
- Won't-have: Authentication, database, deployment pipeline

**Technique:**
- MVP first (file storage, simple UI)
- Iterate with feedback
- Refactor as you go
- Tech debt documented but not blocking

### 48. **Describe your code review philosophy.**

**Answer:**

**What I look for:**
1. **Correctness** - Does it work? Are there edge cases?
2. **Maintainability** - Can someone else understand this in 6 months?
3. **Performance** - Any obvious inefficiencies?
4. **Security** - Any vulnerabilities?
5. **Tests** - Are critical paths covered?

**How I give feedback:**
- **Nit:** Style/minor ("Nit: Consider renaming `x` to `userId`")
- **Suggestion:** Alternative approach ("Suggestion: `Array.map` is cleaner here")
- **Required:** Must fix ("Required: This causes memory leak")

**Example feedback:**
```
File: emailService.js
Line 45

Required: Email recipient is not validated. Add regex check:
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(recipient)) throw new Error('Invalid email');

This prevents injection attacks.
```

### 49. **How would you handle a disagreement during code review?**

**Answer:**

**Scenario:** Reviewer wants refactor, I disagree.

**My approach:**
1. **Understand their concern** - Ask clarifying questions
2. **Explain my reasoning** - With examples/data
3. **Find common ground** - Maybe both approaches have merit
4. **Escalate if needed** - Ask senior engineer or architect
5. **Document decision** - Add comment explaining the "why"

**Example:**
Reviewer: "Extract this 50-line function into smaller functions"
Me: "I kept it together because the logic is sequential and splitting would require passing 5+ parameters. How about I add clear comments for each section?"
Reviewer: "Fair point. Comments work for now, but let's revisit if it grows beyond 75 lines."

**Key:** Assume good intent, focus on outcomes, not ego.

### 50. **What excites you most about working on notification systems at PayPal?**

**Answer:**

**Scale:** Billions of emails per year across 200+ countries. Optimizations have massive impact.

**Impact:** Payment confirmations directly affect user trust. A bug isn't just annoying—it could cost PayPal customers.

**Complexity:** Multi-brand (PayPal, Venmo, Xoom), multi-language, multi-channel (email, SMS, push). Fascinating engineering challenges.

**Innovation:** Component systems, A/B testing, personalization at scale. Cutting-edge email technology.

**Team:** Production Engineers are the "last line of defense." I thrive in high-responsibility environments where code quality and system reliability directly impact business success.

This project is my proof that I understand the domain and can contribute from day one.

---

### 37. **Where does the test data like `user.name` and `transaction.amount` come from?**

**Answer:** These are **hardcoded test/preview data** for demonstration purposes:

**Current Implementation (Demo):**
```javascript
// TemplateEditor.tsx, PreviewPanel.tsx, SMS.tsx
const testData = {
  'user.name': 'lokesh',
  'user.email': 'lloke63@gmail.com',
  'transaction.amount': '$50.00',
  'transaction.id': 'TXN-123456',
  'unsubscribe_link': 'https://paypal.com/unsubscribe'
};
```

**Purpose:**
- Live preview functionality in the UI
- Shows users what final output looks like
- Test email sending without real user data

**Production Implementation Would Be:**
```javascript
// When actually sending notification
const notificationService = {
  sendEmail: async (templateId, userId, transactionId) => {
    // Fetch real data from databases
    const user = await userDB.findById(userId);
    const transaction = await transactionDB.findById(transactionId);

    const dynamicData = {
      'user.name': user.fullName,
      'user.email': user.email,
      'transaction.amount': transaction.formattedAmount,
      'transaction.id': transaction.id,
      'unsubscribe_link': generateUnsubscribeLink(user.id)
    };

    // Render template with real data
    const renderedEmail = renderTemplate(template, dynamicData);
    await emailProvider.send(renderedEmail);
  }
};
```

**Key Distinction:**
- `{{temp.component_id}}` - Comes from components database/storage
- `{{greeting}}` - Comes from localization database/storage
- `{{user.name}}`, `{{transaction.amount}}` - Would come from **runtime context** (user DB, transaction DB, payment systems)

This architecture separates:
1. **Static content** (components, locales) - loaded once, cached
2. **Dynamic content** (user data, transactions) - fetched per notification
3. **Test data** (hardcoded) - for preview/development only

---

## Rapid-Fire Technical Questions

**Q51: What's the difference between PUT and PATCH?**
A: PUT replaces entire resource, PATCH updates specific fields. I used PUT because I'm replacing the whole component.

**Q52: How does async/await work under the hood?**
A: Syntactic sugar over Promises. `await` pauses execution until Promise resolves, but doesn't block event loop.

**Q53: What's the purpose of CORS?**
A: Prevents malicious websites from making unauthorized API calls. Browser enforces same-origin policy.

**Q54: Why TypeScript over JavaScript?**
A: Type safety catches bugs at compile-time. Better IDE autocomplete. Self-documenting code.

**Q55: What's a closure in JavaScript?**
A: Function with access to outer scope variables even after outer function returns. Used in `renderTemplate` to access `components` array.

**Q56: Explain event loop in Node.js**
A: Single-threaded loop that processes callbacks from callback queue. Async operations (I/O, timers) offloaded to system.

**Q57: What's the CAP theorem?**
A: Distributed systems can only guarantee 2 of 3: Consistency, Availability, Partition Tolerance. Most choose AP or CP.

**Q58: How does garbage collection work in V8?**
A: Generational GC. Young generation (scavenge) for short-lived objects, old generation (mark-sweep-compact) for long-lived.

**Q59: What's the difference between SQL and NoSQL?**
A: SQL is relational (tables, ACID). NoSQL is flexible schema (documents, eventual consistency). Choose based on data structure.

**Q60: Explain Docker containers vs VMs**
A: Containers share host OS kernel (lightweight). VMs include full OS (isolated but heavier). Containers start faster, use less resources.

---

**Total: 62 Questions** covering:
- **Architecture & Design:** 14 questions (includes component system, SMS integration, rendering pipeline)
- **React & Frontend:** 8 questions
- **Backend & Node.js:** 8 questions
- **System Design:** 6 questions
- **Non-Technical/Product:** 16 questions
- **Rapid-Fire Technical:** 10 questions

This document demonstrates deep understanding of the project, ability to articulate technical decisions, and readiness for production engineering roles at PayPal.
