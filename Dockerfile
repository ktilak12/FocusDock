# ─────────────────────────────────────────────────────────────────────────────
# FocusDock — Dockerfile
#
# Stage 1 (builder) : Installs deps and compiles TypeScript + Vite bundles
# Stage 2 (runner)  : Minimal image that can launch Electron via X11 display
#
# ── HOW TO RUN ────────────────────────────────────────────────────────────────
# Linux (X11):
#   docker compose up focusdock
#
# Windows / macOS users: download the ready-made installer from GitHub Releases
#   https://github.com/ktilak12/FocusDock/releases
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./

# Install all deps; skip Electron binary here — it is fetched in the runner
RUN npm ci --ignore-scripts

COPY . .

# Build TypeScript (main process) + Vite (renderer)
RUN npm run build

# ── Stage 2: Runner ───────────────────────────────────────────────────────────
FROM node:20-slim AS runner

# Electron / Chromium runtime dependencies on Debian/Ubuntu
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Core Electron / Chromium libs
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libexpat1 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxkbcommon0 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    # X11 utilities (display forwarding)
    xauth \
    # Font rendering
    fonts-liberation \
    # Tray icon support
    libappindicator3-1 \
    && rm -rf /var/lib/apt/lists/*

# Non-root user (Electron refuses to run as root without --no-sandbox)
RUN useradd -ms /bin/bash focusdock
USER focusdock

WORKDIR /app

# Copy build output + node_modules from builder stage
COPY --from=builder --chown=focusdock:focusdock /app/dist ./dist
COPY --from=builder --chown=focusdock:focusdock /app/node_modules ./node_modules
COPY --from=builder --chown=focusdock:focusdock /app/package.json ./package.json
COPY --from=builder --chown=focusdock:focusdock /app/index.html ./index.html

# Vite renderer preview port (not needed for Electron but useful for web preview)
EXPOSE 5173

# Launch Electron. The DISPLAY env var must be set by the host (X11 forwarding).
CMD ["npx", "electron", "dist/main/index.js"]
