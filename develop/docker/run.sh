# shellcheck disable=SC1113
#/usr/bin/bash
cp .env.example .env
echo 'Start run env for dev'
docker network create future-net
docker compose up -d

