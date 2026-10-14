# syntax=docker/dockerfile:1

# API de Conversões da Meta. Um arquivo só, sem dependências: o Node já traz
# http e fetch. Build a partir da raiz do repo:
#   docker build -t fabiojuniordecor-capi:latest infra/capi
FROM node:22.23-alpine

WORKDIR /app
COPY --chown=node:node server.mjs ./

# A imagem oficial já traz o usuário `node` (UID 1000). Porta alta, sem root.
USER node
ENV PORT=8081
EXPOSE 8081

# Casa a string de identidade, não só o status. Ver /healthz no server.mjs.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8081/healthz 2>/dev/null | grep -q '^fabiojuniordecor-capi ok$' || exit 1

CMD ["node", "server.mjs"]
