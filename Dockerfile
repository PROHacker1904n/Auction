# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Final Image (Python + Node)
FROM python:3.10-slim

# Install Node.js in the Python image
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Backend dependencies first for caching
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --omit=dev

# Copy ML Service dependencies
COPY backend/ml-service/requirements.txt ./ml-service/
RUN pip install --no-cache-dir -r ml-service/requirements.txt

# Copy Backend Code
COPY backend/ ./

# Copy Frontend Build from Stage 1
COPY --from=frontend-build /app/frontend/build ../frontend/build

# Environment Variables
ENV NODE_ENV=production
ENV PORT=5000
# Note: ATLASDB and JWT_SECRET must be provided at runtime (e.g., via Render Dashboard)

# Expose port
EXPOSE 5000

# Create start script
RUN echo "#!/bin/sh" > start.sh
RUN echo "python3 ml-service/app.py &" >> start.sh
RUN echo "node server.js" >> start.sh
RUN chmod +x start.sh

# Run
CMD ["./start.sh"]
