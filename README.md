# LPU RMS AI - Intelligent Maintenance Decision Support System

## 🏆 Hackathon Submission - Track B: Multi-Agent Orchestration

### Project Overview
The **LPU RMS AI Maintenance System** is an enterprise-grade, multi-agent facility decision support platform engineered specifically for **Lovely Professional University (LPU), Phagwara, Punjab**. The system modernizes campus infrastructure maintenance across 600+ acres, addressing high-frequency equipment breakdowns across residential hostel blocks (BH-1 to BH-5, GH-1 to GH-4), computer science academic centers (Block-25, 26, 32, 33, 34, 38), and campus healthcare facilities (Uni-Hospital).

By uniting Next.js 14, FastAPI, ChromaDB vector indexing, and a 4-node LangGraph orchestration pipeline powered by Google Gemini, the platform automates the end-to-end complaint lifecycle. Students log structured grievances with rich category tagging and slot availability; hostel wardens inspect, verify, and route queries in real-time; and facility maintenance engineers leverage semantic nearest-neighbor retrieval over 250+ historical campus maintenance records to diagnose root causes, generate step-by-step repair actions, estimate spare part costs in INR (₹), and review campus-wide reliability analytics.

The user experience faithfully replicates the official **LPU UMS (University Management System) Relationship Management System (RMS)** visual identity, featuring official brand colors (`#F97316` primary orange), role-tailored workflows, SLA resolution timers, interactive campus complaint heatmaps, and zero-flicker state synchronization.

---

### Architecture Diagram:
```text
Student Portal → Ticket API → SQLite DB
                           ↓
Warden Portal → Assign → Maintenance Portal
                              ↓
                    "Analyze AI" Button
                              ↓
                    ChromaDB Semantic Search
                    (250 LPU maintenance records)
                              ↓
                    LangGraph Pipeline:
                    [Retrieval] → [Diagnosis] → 
                    [Recommendation] → [Explanation]
                              ↓
                    Gemini 1.5 Flash LLM
                              ↓
                    Results Card in UI
```

---

### Setup Instructions:
1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/campus-infra-ai.git
   cd campus-infra-ai
   ```

2. Configure and start the backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Add your GEMINI_API_KEY to backend/.env
   uvicorn main:app --reload --port 8000
   ```

3. Configure and start the frontend:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Demo Credentials:
| Role | User ID | Password | Access Scope |
|------|---------|----------|--------------|
| **Student** | `12300001` | `student123` | BH-5 Boys Hostel, Room A-824 (Log Request, RMS History & Status Timeline) |
| **Warden** | `FAC001` | `warden123` | BH-5 Hostel Warden Console (Triage, Verification & Dispatch to Tech) |
| **Maintenance** | `MAINT001` | `maint123` | Central Engineering Center (AI Diagnosis, Resolution & Campus Analytics) |

---

### Key Features:
- ✅ **250 LPU-Specific Historical Maintenance Records**: Realistic dataset covering Daikin/Voltas ACs, KONE MonoSpace elevators, Racold geysers, and commercial water coolers across BH-1–5, GH-1–4, and CSE academic blocks.
- ✅ **Semantic Search via ChromaDB**: Cosine similarity vector indexing across historical complaint text, diagnosed problems, and parts replaced.
- ✅ **Multi-Node LangGraph Reasoning Pipeline**: Sequential 4-node graph (`Retrieval` → `Diagnosis` → `Recommendation` → `Explanation`) with technical fallback resilience.
- ✅ **Google Gemini LLM Intelligence**: Automated root-cause isolation, numbered repair procedures, spare parts itemization with INR (₹) estimates, and conversational technician summaries.
- ✅ **Role-Based Portals**: End-to-end operational handoff from Student submission to Warden triage to Maintenance engineering.
- ✅ **LPU UMS Theme Replication**: Exact styling of the official LPU portal (`lpu-orange`, white cards, card tabs with active underline, Turnstile mock CAPTCHA).
- ✅ **Live Campus Analytics & Heatmap**: Pure CSS bar charts, location complaint frequency heatmaps, SLA tracking, and recent AI diagnoses audit table.
- ✅ **Real-Time 30s Polling**: Auto-refreshing work orders and status synchronization across portals without manual page reload.
- ✅ **Production Quality**: 100% TypeScript typed (`npx tsc --noEmit` clean) and optimized Next.js 14 production bundle.
