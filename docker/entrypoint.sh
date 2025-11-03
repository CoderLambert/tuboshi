#!/bin/bash
unset $(env | grep -E -i 'SERVICE|HOST|ADDR|PORT' | grep -v 'DIFY' | grep 'JMS'  | awk -F '=' '{print $1}')
export NODE_ENV=production 
export PORT=8080 
export PM2_INSTANCES=2  
export DEPLOY_ENV=PRODUCTION
export NEXT_TELEMETRY_DISABLED=1

pm2-runtime /app/server.js --name ai-agent-chat-web --cwd /app -i ${PM2_INSTANCES} --no-daemon
