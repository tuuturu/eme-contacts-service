FROM node:12.14.1-alpine3.9

ENV NODE_ENV production
EXPOSE 3000
CMD ["node", "server.js"]

WORKDIR /app
RUN chown node:node /app

USER node

COPY --chown=node package*.json ./

# Need to figure out scoped packages inside docker
# images in github packages
#RUN npm ci --only=production

COPY --chown=node . .
