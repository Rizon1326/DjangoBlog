# Build stage
FROM node:18 as build
# Set working directory
WORKDIR /app
# Copy package files
COPY package.json package-lock.json ./
# Install dependencies
RUN npm ci
# Copy all frontend files
COPY . .
# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine
# Copy built files from build stage to nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]