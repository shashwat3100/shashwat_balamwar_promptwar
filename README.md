# BLIND SPOT

> **"See what your thinking might be missing."**  
> *PromptWars 2026 Submission*

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black.svg)](https://nextjs.org/)
[![Google Gemini](https://img.shields.io/badge/Gemini-3.8_Flash-blue.svg)](https://ai.google.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![Google Cloud Run](https://img.shields.io/badge/Google_Cloud_Run-Deployable-4285F4.svg)](https://cloud.google.com/run)

---

## 1. Problem Statement
When humans evaluate critical life or career choices, we routinely suffer from salience bias: prioritizing the factors that are most visible or immediate (e.g., compensation, proximity, initial excitement) while overlooking unstated assumptions, invisible costs, secondary externalities, and tail risks.

Most AI decision tools compound this failure by playing oracle: telling the user *"You should choose Option A"*, which encourages passive deference rather than critical thinking.

## 2. Our Approach: The Impartial Thinking Partner
**The core tenet of Blind Spot is:**  
**THE AI MUST IMPROVE THE USER'S THINKING, NEVER MAKE THE DECISION FOR THEM.**

The system operates as an analytical thinking companion that maps out what is missing:
```
Decision Input
      ↓
Reasoning Extraction & Taxonomy
      ↓
Assumption Stress-Testing (Load-Bearing vs Ephemeral)
      ↓
Evidence Lens (Known Facts vs Subjective Beliefs vs Unverified Assumptions)
      ↓
Alternative Exploration (Hybrid, Low-Risk Experiment, Reversible Fallback)
      ↓
Stakeholder & Externality Analysis
      ↓
Consequences & Reversibility (Immediate → Secondary → Unintended)
      ↓
Pre-Mortem Failure Modes & Early Warning Signals
      ↓
Blind Spot Radar & Adaptive Questioning Loop
      ↓
Post-Analysis Reflection
      ↓
Decision Brief Synthesis
      ↓
YOU DECIDE (Human Sovereignty)
```

---

## 3. Signature Features

1. **Decision Canvas:**  
   Clean, approachable input interface capturing Decision, Context, Options, Goals, Constraints, and Deadlines. Includes 1-click real-world presets (e.g. *PromptWars 6-Month Internship vs College* scenario).
2. **Structured Decision Taxonomy:**  
   Rigorous internal separation between **FACT**, **BELIEF**, **ASSUMPTION**, **PREDICTION**, and **UNCERTAINTY**.
3. **Blind Spot Engine:**  
   Deep reasoning engine powered by Google Gemini with graceful heuristic fallback.
4. **Blind Spot Radar:**  
   Custom interactive SVG visualization scoring 6 real dimensions: *Evidence, Assumptions, Alternatives, Stakeholders, Risks, Consequences*, categorized into *Needs Attention, Partially Explored, and Explored*.
5. **Adaptive Questioning:**  
   Probes one load-bearing question at a time. Evaluates the user's answer, updates radar scores dynamically, and selects the next highest-leverage inquiry.
6. **Assumption Cards:**  
   Isolates load-bearing assumptions, explains their criticality, and provides a verification prompt with interactive tagging (`Verified Fact`, `Still Assuming`, `Untrue`).
7. **Evidence Lens:**  
   Four-quadrant matrix: *What do I KNOW? What do I BELIEVE? What am I ASSUMING? What must I VERIFY?*
8. **Alternative Lens:**  
   Generates targeted alternatives, hybrid options, low-risk micro-experiments, and defined off-ramps.
9. **Stakeholder Lens:**  
   Evaluates impact on Self, Family, Peers, Organization, and Future Self.
10. **Second-Order Consequences:**  
    Traces cascading consequences: Immediate (30 days) → Secondary (6-12 months) → Unintended side effects.
11. **Reversibility Analysis:**  
    Categorizes decisions into One-Way Doors (Type 1) vs Two-Way Doors (Type 2) with concrete rollback strategies.
12. **Pre-Mortem:**  
    Simulates a 6-month failure scenario, identifies root-cause vulnerabilities, early warning signals, and preventive actions.
13. **Blind Spot Cards:**  
    Highlights critical blind spots, explaining the information asymmetry and missing ground truth.
14. **Decision Brief:**  
    Polished executive synthesis that can be copied as Markdown or downloaded, ending with the prominent mandate: **"YOU DECIDE"**.
15. **Post-Analysis Reflection:**  
    Asks *"Did your thinking change?"* and captures the user's shift in perspective.

---

## 4. Architecture & Technology Stack
- **Framework:** Next.js (App Router, Turbopack, Standalone Output)
- **Language:** TypeScript 7.0 (Strict mode, fully typed domain models)
- **Styling:** Custom Vanilla CSS Design System (High-contrast dark mode, zero bloated utility classes)
- **Icons & Motion:** Lucide Icons & Framer Motion
- **AI Engine:** Google Gemini SDK (`@google/genai`) targeting `gemini-3.8-flash` with a limited heuristic fallback
- **Containerization:** Multi-stage Docker build optimized for Google Cloud Run (image < 150MB)

---

## 5. Security & Privacy
- **Server-side API Key:** `GEMINI_API_KEY` is read only by server routes. Never add a real key to source control or a client-side environment variable.
- **Input Sanitization & Validation:** All user inputs are strictly validated before submission.
- **Prompt Handling:** User fields are encoded as untrusted JSON data and model output is shape-checked. This is defense-in-depth; prompt injection cannot be guaranteed impossible.
- **Fallback Resilience:** If Gemini is unavailable or its response is malformed, the app uses a limited local reasoning fallback. It does not guarantee availability of the external provider.
- **Demo Profile:** Sign-in is a local demo profile only; no account, password verification, OAuth, or server-side user data exists. Do not enter a real password. Decision history is stored in the current browser.

---

## 6. Local Setup & "Go Live"

### Prerequisites
- Node.js 20+
- npm 10+

### Quickstart
```bash
# 1. Install dependencies
npm install

# 2. (Optional) Configure Gemini API Key
cp .env.example .env.local
# Edit .env.local and insert your GEMINI_API_KEY

# 3. Start Development Server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note on "Go Live":**  
> If using VS Code Live Server extension, remember that Next.js requires the Node.js dev server. The server binds to `0.0.0.0:3000` for seamless local network and browser access.

---

## 7. Google Cloud Run Deployment

The repository includes a ready-to-run multi-stage `Dockerfile` and automated deployment script `deploy.sh`.

### 1-Command Deployment via Google Cloud SDK:
```bash
# Set your GCP Project ID
export GCP_PROJECT_ID="your-project-id"

# Run automated deployment
chmod +x deploy.sh
./deploy.sh
```

### Configure Gemini for Cloud Run

Create a Secret Manager secret named `gemini-api-key` (or set `GEMINI_SECRET_NAME`) containing the Gemini API key, with version `1` enabled. Grant the Cloud Run service identity permission to access that secret. The deploy script maps the pinned secret version to `GEMINI_API_KEY` at runtime; the key is not baked into the image or passed as a command-line value.

### Manual Cloud Run Deploy:
```bash
# 1. Build and push image to Google Container Registry / Artifact Registry
gcloud builds submit --tag gcr.io/$GCP_PROJECT_ID/blind-spot:latest .

# 2. Deploy to Cloud Run
gcloud run deploy blind-spot \
  --image gcr.io/$GCP_PROJECT_ID/blind-spot:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars NODE_ENV=production \
  --set-secrets GEMINI_API_KEY=gemini-api-key:1
```

A health check endpoint is available at `/api/health` for Cloud Run liveness probes.

---

## 8. Testing & Verification

There is no automated test suite configured yet. Run `npm run build` for a production build and `npx tsc --noEmit` for a standalone type check. The `lint` script requires ESLint packages, which must be present in the install before it can run.

---

## 9. Limitations & Future Roadmap
- **Multi-user collaborative decisions:** Enabling co-founders or teams to independently rate assumptions and compare divergent blind spots.
- **Decision outcome tracking:** 30/60/90-day automated check-ins comparing pre-mortem predictions with actual real-world outcomes.
