# Base: lightweight Debian with Node.js and pandoc
FROM debian:bookworm-slim

# Install dependencies
RUN apt-get update && \
    apt-get install -y nodejs npm pandoc && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Create app dir
WORKDIR /usr/src/app

# Install Node modules
COPY package*.json ./
RUN npm install

# Copy source code
COPY index.js .

# Expose port
ENV PORT 8080

# Run app
CMD ["npm", "start"]