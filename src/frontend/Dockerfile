# syntax=docker/dockerfile:1

# We are going to use the image with node v.16 installed.
FROM node:18-alpine3.15
WORKDIR /usr/src/app

# Copy the package*.json file in the workdir
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . . 

# Define the command that will be executed
EXPOSE 3000
CMD ["npm", "start"]
