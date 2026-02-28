# Smart Traffic Optimization System

AI-powered traffic signal management platform that fuses YOLOv8-based vehicle detection with adaptive signal timing and emergency vehicle prioritization. This repository hosts both the Flask backend (computer-vision + APIs) and the modern React/Vite dashboard used for monitoring in real time.

## Key Capabilities
- Real-time vehicle detection from images, webcam streams, or simulations using Ultralytics YOLOv8.
- Adaptive signal timing that recalculates per-lane green duration based on live density.
- Emergency override workflow that grants temporary right-of-way, with historical audit logging.
- MySQL-backed persistence for traffic counts and emergency events.
- Interactive dashboard (React + Tailwind) showing lane-level status, charts, and control actions.

## Tech Stack
- **Backend:** Python 3.10+, Flask 3, OpenCV, Torch/Ultralytics, MySQL Connector.
- **Frontend:** React 18, Vite, TailwindCSS, Chart.js, React Router, Axios.
- **Tooling:** Virtualenv, npm, pip, MySQL Server 8+, YOLOv8 `yolov8n.pt` weights.

## Repository Layout
```
app.py                 # Flask entry point + API routes
config.py              # Environment-specific configuration helpers
database.sql           # MySQL schema + seed data
frontend/              # Vite + React dashboard source
models/                # YOLO model wrapper and helpers
static/                # CSS/JS assets and uploads bucket
templates/             # Jinja templates for server-rendered pages
requirements.txt       # Python dependencies
setup.bat / run.bat    # Windows helper scripts
README.md              # You are here
```

## Prerequisites
- Python 3.10 or newer
- Node.js 18+ and npm
- MySQL Server (update credentials inside `app.py`/environment variables)
- Git + GitHub account

## Backend Setup
```bash
# 1. Create & activate virtual environment (or run setup.bat on Windows)
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# 2. Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 3. Prepare uploads folder (kept empty in git)
mkdir -p static/uploads
```

## Database Initialization
```bash
# Create schema and seed tables
mysql -u <user> -p < smart_traffic_db database.sql
```
- Update DB credentials in `app.py` or export environment variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
- Ensure MySQL service is running before starting Flask.

## Frontend Setup
```bash
cd frontend
npm install
npm run dev      # start Vite dev server on http://localhost:5173
npm run build    # output production assets to frontend/dist
```

## Running the Application
```bash
# Option A: Use helper script
run.bat

# Option B: Manual
set FLASK_ENV=development
python app.py  # http://localhost:5000
```
- The Flask server exposes both rendered pages (`/`, `/dashboard`, `/emergency`) and JSON APIs under `/api/...`.
- `setup.bat` automates environment creation, dependency installation, and basic sanity checks for Windows users.

## Environment Variables
| Variable | Description | Default |
| --- | --- | --- |
| `SECRET_KEY` | Flask session key | `dev-secret-key` |
| `DB_HOST` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | MySQL connection details | `localhost` / `root` / `` | `smart_traffic_db` |
| `UPLOAD_FOLDER` | Location for uploaded frames | `static/uploads` |
| `YOLO_MODEL` | Ultralytics weight file | `yolov8n.pt` |

(Configure via `.env` or OS-level exports. `.env*` files are git-ignored by default.)

## Useful API Routes
- `POST /api/detect` – upload an image for detection and lane update.
- `POST /api/detect-webcam` – capture a single webcam frame and run inference.
- `GET /api/traffic-data` – summarized state for all lanes (used by dashboard).
- `POST /api/emergency-override` – activate/deactivate emergency priority for a lane.
- `GET /api/history`, `GET /api/emergency-history` – latest data for analytics widgets.
- `POST /api/simulate-traffic` – generate demo traffic counts for presentations.

## Version Control & Deployment Tips
- `static/uploads/` stays empty in git; production uploads live outside source control.
- YOLO weight files (`*.pt`) are ignored; download via Ultralytics on first run.
- Frontend build artifacts (`frontend/dist`) and `node_modules` are excluded from commits.
- For production, run Flask behind a WSGI server (Gunicorn/Uvicorn) and serve the built React bundle via nginx or the Flask `templates` system.

## Next Steps
1. Verify `python app.py` starts without errors after DB configuration.
2. Run `npm run dev` inside `frontend/` and connect API base URLs via `src/services/api.js` if needed.
3. Configure GitHub Actions or another CI/CD pipeline once runtime tests are stable.

Happy building!
