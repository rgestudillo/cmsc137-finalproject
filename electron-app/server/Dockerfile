# Use the official Node.js 18 image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the server port
EXPOSE 5001

# Define the default command to run your server
CMD ["node", "index.js"]
