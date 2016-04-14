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

# Install pip
RUN curl -O https://bootstrap.pypa.io/get-pip.py \
    && python3 get-pip.py \
    && rm get-pip.py \
    && ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app-ssl
RUN git clone https://github.com/lukas2511/letsencrypt.sh . \
    && mkdir ./hooks \
    && git clone https://github.com/kappataumu/letsencrypt-cloudflare-hook ./hooks/cloudflare \
    && pip install -r ./hooks/cloudflare/requirements.txt


ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 4.3.1

# Install nvm with node and npm
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash \
    && bash -c "source $NVM_DIR/nvm.sh && nvm install $NODE_VERSION && nvm alias default $NODE_VERSION"

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

#setup node app
COPY ./app-node/package.json /app-node/package.json
COPY ./app-node/dist /app-node/dist

WORKDIR /app-node
RUN npm install --production

COPY ./configssh /root/.ssh/config

CMD ["npm","start"]