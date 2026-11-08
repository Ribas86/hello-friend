FROM node:22-bookworm
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY scripts ./scripts
COPY seed ./seed
RUN mkdir -p uploads extensions
EXPOSE 8055
CMD ["sh", "-c", "npx directus bootstrap && npx directus start"]
