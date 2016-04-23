FROM hosttoday/ht-docker-node-python3:latest
RUN DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
    && apt-get install -y -q --no-install-recommends \
            ssh \
            nginx \
    && apt-get clean \
    && rm -r /var/lib/apt/lists/*

# Configure Nginx and apply fix for very long server names
COPY ./app-nginx /app-nginx

RUN echo "daemon off;" >> /etc/nginx/nginx.conf \
 && sed -i 's/^http {/&\n    server_names_hash_bucket_size 128;/g' /etc/nginx/nginx.conf \
 && cp -f /app-nginx/default /etc/nginx/sites-available/default

# Install the LE Cert Fetcher
WORKDIR /app-ssl
RUN git clone https://github.com/lukas2511/letsencrypt.sh . \
    && mkdir ./hooks \
    && git clone https://github.com/kappataumu/letsencrypt-cloudflare-hook ./hooks/cloudflare \
    && pip install -r ./hooks/cloudflare/requirements.txt

# setup node app
COPY ./app-node/package.json /app-node/package.json
COPY ./app-node/dist /app-node/dist

WORKDIR /app-node
RUN npm install --production

COPY ./configssh /root/.ssh/config

CMD ["npm","start"]