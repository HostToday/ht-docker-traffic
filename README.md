# ht-docker-coretraffic

ht-docker-coretraffic handles traffic in docker environments

## Features

* Sync certificates (SSL) between multiple instances of the ht-docker-traffic container on different nodes
* Get missing certificates from Lets Encrypt
* Use DNS Challenge with Cloudflare
* Update Cloudflare according to running containers on node.

## Start container

```shell
docker run --name ht-docker-traffic -v /var/run/docker.sock:/var/run/docker.sock \
    --restart always --env CF_UPDATE=true --env CF_EMAIL=[email used at cloudflare] \
    --env CF_KEY=[some token here]  hosttoday/ht-docker-traffic
```

## Tips
Use hosttoday/ht-docker-coreflow for scaling your infrastructure across multiple servers