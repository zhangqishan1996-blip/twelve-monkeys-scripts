#!/usr/bin/env bash
set -e

CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${CYAN}🚀 Starting ShortDrama servers...${NC}"

# Kill on exit
cleanup() {
  echo -e "\n${CYAN}Stopping servers...${NC}"
  kill 0
}
trap cleanup EXIT

# Start backend
(cd server && echo -e "${CYAN}[SERVER] Starting on :3000${NC}" && npm run dev 2>&1 | sed "s/^/${CYAN}[SERVER]${NC} /") &

# Wait a bit for the server to init, then start frontend
sleep 2
(cd client && echo -e "${MAGENTA}[CLIENT] Starting on :5173${NC}" && npm run dev 2>&1 | sed "s/^/${MAGENTA}[CLIENT]${NC} /") &

wait
