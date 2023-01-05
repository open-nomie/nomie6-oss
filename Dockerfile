FROM node:16-buster

WORKDIR /usr/app
COPY ./ /usr/app

RUN npm install && npm run vbuild

FROM nginx
WORKDIR /usr/app
COPY --from=0 /usr/app/dist /usr/share/nginx/html