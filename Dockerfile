FROM nginx:stable-alpine

ENV NODE_ENV=production

#COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.template /
COPY build /usr/share/nginx/html

CMD ["/bin/sh", "-c", "envsubst '${BACKEND_HOST} ${BACKEND_PORT} ${RESOLVER}' < nginx.template > /etc/nginx/conf.d/default.conf; nginx -g 'daemon off;'"]