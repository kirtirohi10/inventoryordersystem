# Base Node.js image
FROM node:18-alpine

WORKDIR /frontend

# Copy dependencies manifest
COPY package*.json /frontend/

# Install packages
RUN npm install

# Copy application source
COPY . /frontend/

# Expose Vite dev server port
EXPOSE 5173

# Run development server
CMD ["npm", "run", "dev"]
