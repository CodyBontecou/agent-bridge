FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && mkdir /data && chown node:node /data
COPY core ./core
COPY server ./server
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 DATA_DIR=/data
EXPOSE 3000
CMD ["node", "server/start.js"]
