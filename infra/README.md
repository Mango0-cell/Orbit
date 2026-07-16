# infra/

Infrastructure for Orbit, split by concern.

| Path             | Purpose                                                                 | Status                     |
| ---------------- | ----------------------------------------------------------------------- | -------------------------- |
| `docker/`        | Per-app Dockerfiles (`Dockerfile.service` for any NestJS service, `Dockerfile.frontend` for Next.js). | **Active** — used by `docker-compose.yml`. |
| `postgres/init/` | SQL run on first Postgres boot; creates the four per-service databases. | **Active** — local dev.    |
| `nginx/`         | Reverse-proxy / load-balancer routing contract + reference config.      | **Reference only** — wired in the deployment phase. |
| `k8s/`           | Kubernetes manifests (Deployments, Services, HPA, Ingress).             | **Placeholder** — authored in the deployment phase. |

Local development is driven by the repo-root `docker-compose.yml`. Nginx and
Kubernetes are deliberately deferred to the deployment phase — see
`CLAUDE.md → Deployment` for the rules and concepts they encode.
