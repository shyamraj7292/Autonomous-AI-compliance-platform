# Autonomous AI Compliance Platform

An agentic AI-powered compliance platform for financial services organizations. Built with React, FastAPI, and Google Gemini LLM.

## Features

- **Multi-Agent Architecture**: Scout, Analyst, Sentinel, and Evidence Officer agents
- **Real-time Gap Analysis**: AI-powered policy analysis against PCI-DSS and GDPR
- **PDF Report Generation**: Industry-grade compliance reports with PCI-DSS checklist
- **Multi-File Upload**: Ingest multiple regulatory documents at once
- **RAG (Retrieval-Augmented Generation)**: ChromaDB-backed knowledge base
- **Real-time Dashboard**: Dynamic metrics from actual analysis

## Quick Start

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Gemini API Key** (get one at https://aistudio.google.com)

### Step 1: Clone & Setup Backend

```bash
cd server

# Create virtual environment (optional but recommended)
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env
```

### Step 2: Configure Gemini API

Edit `server/.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_actual_api_key_here
```

### Step 3: Start Backend Server

```bash
cd server
uvicorn main:app --reload
```
Server runs at: http://localhost:8000

### Step 4: Start Frontend

Open a new terminal:
```bash
cd client
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

### Step 5: Test the Application

1. Open http://localhost:5173 in your browser
2. Login with any username/password (demo mode)
3. Go to **Settings** → Check Gemini API status
4. Go to **Regulations** → Upload policy documents
5. Click **Trigger Scan** on Dashboard
6. Go to **Reports** → Download generated PDF

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard` | GET | Dashboard metrics |
| `/api/agents/ingest` | POST | Upload multiple documents |
| `/api/agents/scan` | POST | Trigger compliance scan |
| `/api/agents/analyze` | POST | Analyze policy text |
| `/api/agents/report` | POST | Generate PDF report |
| `/api/reports` | GET | List generated reports |
| `/api/reports/download/{filename}` | GET | Download PDF |
| `/api/status` | GET | Check API connections |
| `/api/settings` | GET/POST | Agent settings |

## Project Structure

```
├── client/                 # React Frontend
│   └── src/
│       ├── pages/         # Dashboard, Settings, Reports, etc.
│       ├── components/    # Reusable UI components
│       └── lib/           # API utilities
│
├── server/                # FastAPI Backend
│   ├── agents/           # AI Agents (Scout, Analyst, etc.)
│   ├── services/         # LLM, RAG services
│   ├── tools/            # PDF Generator, Document Reader
│   └── main.py           # API endpoints
│
└── docker-compose.yml    # Full-stack deployment
```

## Troubleshooting

### Gemini API Not Connected
1. Verify your API key in `server/.env`
2. Restart the server: `uvicorn main:app --reload`
3. Check Settings page for status

### Multi-file Upload Not Working
Ensure you're using the latest frontend code and server is restarted.

### PDF Not Downloading
Check that `server/reports/` directory exists and is writable.

## License

MIT