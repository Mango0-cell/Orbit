# Kubernetes — orchestration (deployment phase)

**Status: not configured yet — by design.** This directory is a placeholder.
Manifests are authored in the final development phase; the *concepts and rules*
they will encode are defined in `CLAUDE.md → Deployment`.

## What will live here

For each deployable app (`users-service`, `content-service`, `chat-service`,
`notifications-service`, `orbit-frontend`):

- **Deployment** — desired replica count of a specific image tag
  (e.g. keep 4 replicas of `orbit/users-service:v2` running).
- **Service** — stable in-cluster DNS + load balancing across that Deployment's pods.
- **HorizontalPodAutoscaler (HPA)** — scale rules
  (e.g. "if content-service CPU > 70%, add replicas").
- **ConfigMap / Secret** — non-secret config and credentials (DB URLs, RabbitMQ, gRPC targets).
- **Ingress** — the public routing contract (mirrors `../nginx`).

## Why Kubernetes

Kubernetes is Orbit's life-support system. It provides **self-healing** (a
crashed or OOM-killed container is detected, destroyed, and replaced within
seconds — no human intervention), **horizontal auto-scaling**, and **rolling
updates**. This is what makes the "independent scalability + fault tolerance"
goal real in production.

## Image flow (CI/CD)

1. Merge to `main` → CI builds one image per app (`orbit/<app>:<tag>`) and pushes
   to a registry (Docker Hub / AWS ECR).
2. Manifests here reference those image tags.
3. `kubectl apply` / GitOps rolls the new version out replica by replica.
