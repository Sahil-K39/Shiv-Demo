
cd "$(dirname "$0")"


kill $(lsof -ti:8080) 2>/dev/null
kill $(lsof -ti:3000) 2>/dev/null
sleep 1

echo "→ SHIV SHAKTI PROJECT — Booting Monorepo Stack..."

GO_BIN="${GO_BIN:-$(command -v go)}"
if [ -z "$GO_BIN" ]; then
  echo "Go is not installed or not available on PATH."
  exit 1
fi

cleanup() {
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null
  fi
}
trap cleanup EXIT INT TERM


echo "→ Starting Go Commerce Engine on http://localhost:8080"
cd backend
"$GO_BIN" run ./cmd/server/main.go &
BACKEND_PID=$!
cd ..


echo "→ Starting Next.js Frontend on http://localhost:3000"
echo ""
cd frontend
npm run dev
