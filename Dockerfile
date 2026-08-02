FROM nginx:1.27-alpine

RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/site.conf
COPY . /usr/share/nginx/html/

RUN rm -rf /usr/share/nginx/html/.git \
           /usr/share/nginx/html/.claude \
           /usr/share/nginx/html/Dockerfile \
           /usr/share/nginx/html/.dockerignore \
           /usr/share/nginx/html/nginx.conf \
           /usr/share/nginx/html/stack.yml \
           /usr/share/nginx/html/instru* \
    && find /usr/share/nginx/html -name '*.md' -delete

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1
