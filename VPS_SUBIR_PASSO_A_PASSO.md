# VPS - Subir Projeto (Passo a Passo)

Guia rapido para recolocar no ar:

- `vidanovaguarus.com.br`
- `www.vidanovaguarus.com.br`
- `sentinela.vidanovaguarus.com.br`

Servidor: `167.88.42.134`

---

## 1) Entrar na VPS

```bash
ssh root@167.88.42.134
```

---

## 2) Diagnostico inicial

```bash
docker service ls
docker service ps vidanovaguarus_web --no-trunc
docker service ps torredeoracao_web --no-trunc
```

Se aparecer erro como:

```text
No such image: vidanovaguarus:latest
No such image: torredeoracao:latest
```

significa que a imagem sumiu e precisa rebuild.

---

## 3) Rebuild e subida do `vidanovaguarus`

```bash
cd /var/www/vidanovaguarus
docker build -t vidanovaguarus:latest .
docker service update --force vidanovaguarus_web
docker service ps vidanovaguarus_web --no-trunc
```

---

## 4) Rebuild e subida do `torredeoracao` (sentinela)

```bash
cd /var/www/torredeoracao
docker build -t torredeoracao:latest .
docker service update --force torredeoracao_web
docker service ps torredeoracao_web --no-trunc
```

---

## 5) Confirmar se os servicos estao 1/1

```bash
docker service ls | egrep "vidanovaguarus_web|torredeoracao_web|traefik_traefik"
```

Esperado:

- `vidanovaguarus_web` -> `1/1`
- `torredeoracao_web` -> `1/1`
- `traefik_traefik` -> `1/1`

---

## 6) Teste correto de HTTPS local (com SNI)

Use `--resolve` para validar roteamento no Traefik:

```bash
curl -kI --resolve vidanovaguarus.com.br:443:127.0.0.1 https://vidanovaguarus.com.br
curl -kI --resolve www.vidanovaguarus.com.br:443:127.0.0.1 https://www.vidanovaguarus.com.br
curl -kI --resolve sentinela.vidanovaguarus.com.br:443:127.0.0.1 https://sentinela.vidanovaguarus.com.br
```

Esperado: `HTTP/2 200` (ou redirecionamento `301/308` em alguns cenarios).

---

## 7) Teste externo real

```bash
curl -I https://vidanovaguarus.com.br
curl -I https://www.vidanovaguarus.com.br
curl -I https://sentinela.vidanovaguarus.com.br
```

Esperado: resposta `200`, `301` ou `308`.

---

## 8) (Opcional) Remover ruido do nginx do sistema

Como a borda esta no Traefik Docker, o nginx do sistema pode ficar desativado:

```bash
systemctl disable --now nginx
systemctl --failed
```

---

## 9) Checklist rapido (copiar e colar)

```bash
cd /var/www/vidanovaguarus && docker build -t vidanovaguarus:latest . && docker service update --force vidanovaguarus_web
cd /var/www/torredeoracao && docker build -t torredeoracao:latest . && docker service update --force torredeoracao_web
docker service ls | egrep "vidanovaguarus_web|torredeoracao_web|traefik_traefik"
curl -kI --resolve vidanovaguarus.com.br:443:127.0.0.1 https://vidanovaguarus.com.br
curl -kI --resolve sentinela.vidanovaguarus.com.br:443:127.0.0.1 https://sentinela.vidanovaguarus.com.br
```

---

## 10) Causa raiz desse incidente

- Servico estava `0/1` por imagem local ausente (`No such image`).
- Traefik estava funcionando, mas sem backend valido o dominio retornava erro/404.
- Rebuild da imagem + `docker service update --force` resolveu.

---

## 11) Prevencao

- Evitar `docker system prune -a` sem planejamento (remove imagens necessarias).
- Sempre manter scripts de deploy atualizados em `/var/www`.
- Apos deploy, sempre validar com `docker service ls` + `curl --resolve`.

