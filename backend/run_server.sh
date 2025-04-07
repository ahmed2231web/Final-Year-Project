#!/bin/bash

# AgroConnect Server Launcher
# This script runs the Django application with Daphne for WebSocket support

# Set environment variables if needed
# export DJANGO_SETTINGS_MODULE=AgroConnect.settings

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting AgroConnect server with Daphne...${NC}"
echo -e "${YELLOW}Press CTRL+C to stop the server${NC}"

# Run the server with Daphne
# -b: Bind address (0.0.0.0 for all interfaces or 127.0.0.1 for localhost)
# -p: The port to bind to
# AgroConnect.asgi:application: Path to ASGI application

daphne -b 0.0.0.0 -p 8000 AgroConnect.asgi:application
