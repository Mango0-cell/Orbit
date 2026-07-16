# Nginx — reverse proxy & load balancer (deployment phase)

**Status: not configured yet — by design.** Per the project plan, the deployment
system (Nginx + Kubernetes) is defined as *concepts and rules* now and wired up
in the final development phase.

## Role

Nginx is the single public entry point ("edge") for Orbit. It:

1. Terminates HTTP/HTTPS on ports 80/443.
2. Routes requests to the right service **by URL**, so the frontend only ever
   knows one origin (`orbit.com`).
3. Load-balances across the Kubernetes replicas of each service.
4. Upgrades WebSocket connections for real-time features.

## Routing contract

| Public route            | Upstream                 | Protocol  |
| ----------------------- | ------------------------ | --------- |
| `orbit.com/api/users/*` | `users-service:3001`     | REST      |
| `orbit.com/api/posts/*` | `content-service:3002`   | REST      |
| `orbit.com/ws/chat/*`   | `chat-service:3003`      | WebSocket |
| `orbit.com/*`           | `orbit-frontend:3000`    | HTTP      |

See [`nginx.conf.example`](./nginx.conf.example) for a concrete reference
implementation of this contract.

## When this gets built

In production, Nginx (or the Kubernetes Ingress controller it backs) is
configured in the deployment phase alongside the manifests in [`../k8s`](../k8s).
Local development does **not** use Nginx — services are reached directly on their
host ports (see the repo-root `docker-compose.yml`).
