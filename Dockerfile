FROM hosttoday/ht-docker-node:stable
RUN DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
    && apt-get install -y -q --no-install-recommends \
            nginx \
    && apt-get clean \
    && rm -r /var/lib/apt/lists/*

# setup node app
COPY ./package.json /app/package.json
COPY ./dist /app/dist

WORKDIR /app
RUN npm install --production

CMD ["npm","start"]