FROM mcr.microsoft.com/devcontainers/javascript-node:20

# Install additional OS packages
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    curl \
    git \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Switch to node user
USER node

# Set working directory
WORKDIR /workspaces/isocity