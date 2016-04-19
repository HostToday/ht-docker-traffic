FROM ubuntu
RUN DEBIAN_FRONTEND=noninteractive
RUN apt-get -y install software-properties-common \
    && apt-get update \
    && apt-get upgrade --no-install-recommends -y \
    && apt-get install --no-install-recommends -y \
            build-essential \
            ca-certificates \
            curl \
            git \
            python3 \
            rsync \
            ssh \
            nginx \
    && apt-get clean \
    && rm -r /var/lib/apt/lists/*

# Configure Nginx and apply fix for very long server names
COPY ./app-nginx /app-nginx

RUN echo "daemon off;" >> /etc/nginx/nginx.conf \
 && sed -i 's/^http {/&\n    server_names_hash_bucket_size 128;/g' /etc/nginx/nginx.conf \
 && cp -f /app-nginx/default /etc/nginx/sites-available/default

# Install pip
RUN curl -O https://bootstrap.pypa.io/get-pip.py \
    && python3 get-pip.py \
    && rm get-pip.py \
    && ln -s /usr/bin/python3 /usr/bin/python

# Install the LE Cert Fetcher
WORKDIR /app-ssl
RUN git clone https://github.com/lukas2511/letsencrypt.sh . \
    && mkdir ./hooks \
    && git clone https://github.com/kappataumu/letsencrypt-cloudflare-hook ./hooks/cloudflare \
    && pip install -r ./hooks/cloudflare/requirements.txt


# setup nvm environment
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 4.4.3

# Install nvm with node and npm
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash \
    && bash -c "source $NVM_DIR/nvm.sh && nvm install $NODE_VERSION && nvm alias default $NODE_VERSION"

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# setup node app
COPY ./app-node/package.json /app-node/package.json
COPY ./app-node/dist /app-node/dist

WORKDIR /app-node
RUN npm install -g npm \
    && npm install --production

COPY ./configssh /root/.ssh/config

CMD ["npm","start"]