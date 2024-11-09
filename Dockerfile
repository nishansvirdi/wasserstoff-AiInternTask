# Use a Node.js base image
FROM node:20

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port if your app needs it (adjust based on your app's settings)
EXPOSE 3000

# Set environment variables if needed (you may also use .env file)
ENV NODE_ENV=production

# Command to run the application in production
CMD ["npm", "start"]
