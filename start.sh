#!/bin/bash

# ============================================================
# AutoInspect AI - Vehicle Inspection & Certification Platform
# Start Script
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════╗"
echo "║     🚗  AutoInspect AI                          ║"
echo "║     Vehicle Inspection & Certification Platform  ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# ---- Kill processes on ports 3000 and 3001 ----
echo -e "${YELLOW}[1/6] Cleaning up ports...${NC}"
for PORT in 3000 3001; do
  PIDS=$(lsof -ti:$PORT 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    echo -e "  Killing processes on port $PORT: $PIDS"
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
done
echo -e "${GREEN}  ✓ Ports 3000 and 3001 are free${NC}"

# ---- Check for .env file ----
echo -e "${YELLOW}[2/6] Checking environment...${NC}"
if [ ! -f "$PROJECT_DIR/.env" ]; then
  echo -e "${RED}  ✗ .env file not found! Creating default...${NC}"
  cat > "$PROJECT_DIR/.env" << 'ENVEOF'
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vehicle_inspection
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=anthropic/claude-haiku-4.5
JWT_SECRET=vehicle-inspection-secret-key-2024
SERVER_PORT=3001
CLIENT_PORT=3000
ENVEOF
fi
echo -e "${GREEN}  ✓ Environment configured${NC}"

# ---- Check PostgreSQL ----
echo -e "${YELLOW}[3/6] Checking PostgreSQL...${NC}"
if command -v psql &> /dev/null; then
  # Try to create database if it doesn't exist
  psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'vehicle_inspection'" 2>/dev/null | grep -q 1 || \
    createdb -U postgres vehicle_inspection 2>/dev/null || \
    echo -e "  ${CYAN}Note: Database may already exist or needs manual creation${NC}"
  echo -e "${GREEN}  ✓ PostgreSQL ready${NC}"
else
  echo -e "${RED}  ✗ PostgreSQL not found. Please install and start PostgreSQL.${NC}"
  echo -e "  Run: brew install postgresql@15 && brew services start postgresql@15"
  exit 1
fi

# ---- Install dependencies ----
echo -e "${YELLOW}[4/6] Installing dependencies...${NC}"
cd "$PROJECT_DIR/server"
if [ ! -d "node_modules" ]; then
  echo -e "  Installing server dependencies..."
  npm install --silent 2>&1 | tail -1
fi
echo -e "${GREEN}  ✓ Server dependencies installed${NC}"

cd "$PROJECT_DIR/client"
if [ ! -d "node_modules" ]; then
  echo -e "  Installing client dependencies..."
  npm install --silent 2>&1 | tail -1
fi
echo -e "${GREEN}  ✓ Client dependencies installed${NC}"

# ---- Seed database ----
echo -e "${YELLOW}[5/6] Seeding database...${NC}"
cd "$PROJECT_DIR/server"
node seeds/seed.js
echo -e "${GREEN}  ✓ Database seeded with sample data${NC}"

# ---- Start servers ----
echo -e "${YELLOW}[6/6] Starting servers...${NC}"

# Start backend with nodemon for auto-reload
cd "$PROJECT_DIR/server"
npx nodemon index.js &
SERVER_PID=$!
echo -e "${GREEN}  ✓ Backend server starting on port 3001 (PID: $SERVER_PID)${NC}"

# Wait for server to be ready
sleep 3

# Start frontend with auto-reload (built into react-scripts)
cd "$PROJECT_DIR/client"
BROWSER=none PORT=3000 npm start &
CLIENT_PID=$!
echo -e "${GREEN}  ✓ Frontend starting on port 3000 (PID: $CLIENT_PID)${NC}"

echo ""
echo -e "${PURPLE}╔══════════════════════════════════════════════════╗"
echo -e "║  🚀 AutoInspect AI is running!                   ║"
echo -e "║                                                  ║"
echo -e "║  Frontend:  ${CYAN}http://localhost:3000${PURPLE}               ║"
echo -e "║  Backend:   ${CYAN}http://localhost:3001${PURPLE}               ║"
echo -e "║  API Docs:  ${CYAN}http://localhost:3001/api/health${PURPLE}    ║"
echo -e "║                                                  ║"
echo -e "║  Demo Login:                                     ║"
echo -e "║    Email:    ${GREEN}demo@autoinspect.com${PURPLE}              ║"
echo -e "║    Password: ${GREEN}password123${PURPLE}                       ║"
echo -e "║                                                  ║"
echo -e "║  ${YELLOW}Code changes auto-reload!${PURPLE}                     ║"
echo -e "║  Press Ctrl+C to stop all servers                ║"
echo -e "╚══════════════════════════════════════════════════╝${NC}"
echo ""

# Handle cleanup on exit
cleanup() {
  echo -e "\n${YELLOW}Shutting down servers...${NC}"
  kill $SERVER_PID 2>/dev/null || true
  kill $CLIENT_PID 2>/dev/null || true
  # Clean up any remaining processes on our ports
  for PORT in 3000 3001; do
    PIDS=$(lsof -ti:$PORT 2>/dev/null || true)
    if [ -n "$PIDS" ]; then
      echo "$PIDS" | xargs kill -9 2>/dev/null || true
    fi
  done
  echo -e "${GREEN}All servers stopped. Goodbye!${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for either process to exit
wait
