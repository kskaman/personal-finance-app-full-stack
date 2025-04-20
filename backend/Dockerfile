# Use an official node.js runtime as a parent image
FROM node:22-slim

WORKDIR /app

# Install OpenSSL for Prisma's native engines
RUN apt-get update -y && apt-get install -y openssl

# Copy in your package files first
COPY package*.json ./

# Copy in your Prisma schema so we can generate
COPY prisma ./prisma

# Install dependencies
RUN npm install

# Generate the Prisma client inside the container
RUN npx prisma generate

# Now copy the rest of your code
COPY . .

# Expose the port
EXPOSE 3000

# Start the app
CMD ["node", "./src/index.js"]