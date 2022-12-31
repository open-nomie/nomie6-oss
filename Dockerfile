# Start from a Node.js base image
FROM node:16-alpine AS build

# Create a working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run vbuild

# Expose the application's port
EXPOSE 5000

# Run the application
# CMD ["npm", "run", "vserve"]

FROM nginx:latest
COPY --from=build /app/dist /usr/share/nginx/html