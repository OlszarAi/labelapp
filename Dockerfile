# syntax=docker/dockerfile:1

ARG NODE_VERSION=18.19.1

FROM node:${NODE_VERSION}-alpine

# Use development node environment since we're using "npm run dev" for local development
ENV NODE_ENV development

WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (including dev dependencies)
RUN npm install

# Copy the rest of the source files into the image
COPY --chown=node:node . .

# Create .next directory with correct permissions
RUN mkdir -p .next && chown -R node:node .

# Run the application as a non-root user
USER node

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD npm run dev
