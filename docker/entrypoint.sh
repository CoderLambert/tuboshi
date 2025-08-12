#!/bin/bash
pm2-runtime /app/server.js --name ai-agent-chat-web --cwd /app -i ${PM2_INSTANCES} --no-daemon
