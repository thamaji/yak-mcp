# syntax=docker/dockerfile:1
ARG UBUNTU_VERSION=22.04
ARG _DEV_CONTAINERS_BASE_IMAGE=dev_container_auto_added_stage_label
FROM ubuntu:${UBUNTU_VERSION}

# set apt mirror server
ARG APT_MIRROR=""
RUN [ "${APT_MIRROR:-}" != "" ] && sed -i -r "s@http://(\\w+.)?archive\.ubuntu\.com/ubuntu/@${APT_MIRROR}@" || :

# enable cache that apt keeps
RUN rm -f /etc/apt/apt.conf.d/docker-clean \
    && echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' >/etc/apt/apt.conf.d/keep-cache

# update ca-certificates
RUN --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    --mount=type=cache,target=/var/cache/apt,sharing=locked \
    apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates

# japanize
RUN --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    --mount=type=cache,target=/var/cache/apt,sharing=locked \
    apt-get update \
    && apt-get install -y --no-install-recommends \
        tzdata \
    && ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
    && echo 'Asia/Tokyo' >/etc/timezone \
    && apt-get install -y --no-install-recommends \
        language-pack-ja-base \
        language-pack-ja
ENV LANG=ja_JP.UTF-8

# create user
ARG USERNAME=vscode
RUN --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    --mount=type=cache,target=/var/cache/apt,sharing=locked \
    apt-get update \
    && apt-get install -y --no-install-recommends \
        sudo \
    && groupadd --gid 5000 ${USERNAME} \
    && useradd --uid 5000 --gid 5000 --home-dir /home/${USERNAME} --create-home --shell /bin/bash ${USERNAME} \
    && echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" >>/etc/sudoers.d/${USERNAME} \
    && chmod 0440 /etc/sudoers.d/${USERNAME}

# persist bash history
RUN mkdir -p /home/${USERNAME}/.cache/bash \
    && touch /home/${USERNAME}/.cache/bash/.bash_history \
    && chown -R ${USERNAME}:${USERNAME} /home/${USERNAME}/.cache/bash \
    && ln -s /home/${USERNAME}/.cache/bash/.bash_history /home/${USERNAME}/.bash_history \
    && echo "export PROMPT_COMMAND='history -a'" >>/home/${USERNAME}/.bashrc

# persist vscode extensions
RUN mkdir -p /home/${USERNAME}/.vscode-server/extensions /home/${USERNAME}/.vscode-server-insiders \
    && chown -R ${USERNAME}:${USERNAME} /home/${USERNAME}/.vscode-server /home/${USERNAME}/.vscode-server-insiders \
    && ln -s /home/${USERNAME}/.vscode-server/extensions /home/${USERNAME}/.vscode-server-insiders/extensions

# install common dev tools
RUN --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    --mount=type=cache,target=/var/cache/apt,sharing=locked \
    apt-get update \
    && apt-get install -y --no-install-recommends \
        bash-completion \
        curl \
        git \
        gnupg2 \
        iputils-ping \
        less \
        net-tools \
        tar \
        time \
        unzip \
        xz-utils \
        zip \
        ssh

# install nodejs
ARG NODE_VERSION=22.19.0
RUN --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    --mount=type=cache,target=/var/cache/apt,sharing=locked \
    apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        tar \
        xz-utils \
    && curl -fsSL --compressed "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" | tar xJ -C /usr/local
ENV PATH=/usr/local/node-v${NODE_VERSION}-linux-x64/bin:${PATH}

# install pnpm
RUN npm install -g pnpm@latest-10

# Electron Multi Platform Build Devendencies
# https://www.electron.build/multi-platform-build
RUN --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    --mount=type=cache,target=/var/cache/apt,sharing=locked \
    apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        g++-multilib \
        gcc-multilib \
        gnupg \
        libarchive-tools \
        libopenjp2-tools \
        rpm \
    # WineHQ
    && dpkg --add-architecture i386 \
    && curl -fsSL https://dl.winehq.org/wine-builds/winehq.key | apt-key add - \
    && echo "deb https://dl.winehq.org/wine-builds/ubuntu focal main" > /etc/apt/sources.list.d/winehq.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        winehq-stable \
    # Mono
    && apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF \
    && echo "deb https://download.mono-project.com/repo/ubuntu stable-focal main" > /etc/apt/sources.list.d/mono-official-stable.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates-mono \
        mono-devel

# install crush
ARG CRUSH_VERSION=0.7.4
RUN --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    --mount=type=cache,target=/var/cache/apt,sharing=locked \
    apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        tar \
    && curl -fsSL --compressed "https://github.com/charmbracelet/crush/releases/download/v${CRUSH_VERSION}/crush_${CRUSH_VERSION}_Linux_x86_64.tar.gz" \
        | tar xz --strip-components 1 -C /usr/local/bin "crush_${CRUSH_VERSION}_Linux_x86_64/crush"

# TypeScript Language Server
RUN npm install -g \
    typescript-language-server \
    typescript

USER ${USERNAME}
