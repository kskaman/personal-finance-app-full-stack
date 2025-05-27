# Use an official node.js runtime as a parent image
FROM node:22-slim

WORKDIR /app

# Install OpenSSL for Prisma's native engines
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy in your package files first
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --omit=dev

# Copy in your Prisma schema so we can generate
COPY prisma ./prisma

# Generate the Prisma client inside the container
RUN npx prisma generate

# Now copy the rest of your code
COPY . .

# Expose the port
EXPOSE 3000

# make docker-entrypoint.sh executable
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Set production environment
ENV NODE_ENV=production

ENTRYPOINT ["./docker-entrypoint.sh"]

# Start the app
CMD ["node", "./src/index.js"]