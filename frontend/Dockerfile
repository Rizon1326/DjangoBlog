# Use official Node.js image from the Docker Hub
FROM node:16

# Set the working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json /app/
RUN npm install

# Copy the React app
COPY . /app/

# Expose the port Vite will run on
EXPOSE 5173

# Run the Vite development server
CMD ["npm", "run", "dev"]
