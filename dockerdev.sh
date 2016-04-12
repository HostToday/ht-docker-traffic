#!/usr/bin/env bash
(cd ./app-node/ && npm test)
docker build -t trafficimg .
docker stop traffic
docker rm $(docker ps -q -f status=exited)
docker-compose up

