FROM node:20-slim

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Build Vite client assets
RUN npm run build

# Default environment configuration
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

# Start production server
CMD ["npm", "start"]
