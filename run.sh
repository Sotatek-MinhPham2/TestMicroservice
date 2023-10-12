#usr/bin/bash
echo 'Start'
cp .env.example .env
docker compose build --no-cache
docker compose up -d