#usr/bin/bash
echo 'Start run develop'
cp .env.example .env
docker compose build --no-cache
docker compose -f docker-compose-develop.yml up -d