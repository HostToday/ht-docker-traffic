#!/usr/bin/env bash
docker build -t trafficimg .
docker stop traffic
docker rm $(docker ps -q -f status=exited)
docker run -d -e VIRTUAL_HOST=app.labkomp.org -p 80:80 --name traffic trafficimg