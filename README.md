# MyApp — TP DevOps (Git, Docker, Jenkins, Kubernetes)

Application web Node.js livrée par un pipeline CI/CD complet.

| Fichier | Rôle |
|---|---|
| `app.js`, `src/server.js` | Application (`/` Hello World, `/health`, `/metrics`) |
| `test/server.test.js` | Tests unitaires (`npm test`) |
| `Dockerfile` | Image Docker (node:20-alpine, utilisateur non-root) |
| `Jenkinsfile` | Pipeline : Clone → Tests → Build → Push → Deploy → Smoke test |
| `k8s/k8s-deployment.yaml` | Deployment (2 replicas, probes) + Service LoadBalancer |
| `k8s/secret.example.yaml` | Exemple de Secret Kubernetes (`API_KEY`) |
| `monitoring/servicemonitor.yaml` | Scraping Prometheus + instructions Grafana |

## 1. Lancer en local
```bash
npm test        # 4 tests unitaires
npm start       # http://localhost:3000
```

## 2. Docker
```bash
docker build -t my-app .
docker run -p 3000:3000 my-app
docker tag my-app <dockerhub-user>/my-app
docker login
docker push <dockerhub-user>/my-app
```

## 3. Jenkins
1. Plugins : Git, Pipeline, Docker Pipeline, Kubernetes CLI, NodeJS.
2. Credentials : `docker-hub-credentials` (Username/Password) et `kubeconfig` (Secret file = `~/.kube/config`).
3. Nouveau job *Pipeline* → *Pipeline script from SCM* → URL de ce dépôt → `Jenkinsfile`.
4. *Build with Parameters* : renseigner `DOCKERHUB_USER` et `GIT_URL`.

> Changements par rapport au sujet : `kubernetesDeploy` (plugin retiré de Jenkins) est remplacé par
> `kubectl` + `withKubeConfig` ; `node:14` (fin de vie) par `node:20-alpine` ; l'app écoute sur
> `0.0.0.0` au lieu de `127.0.0.1`, sinon elle est injoignable depuis l'extérieur du conteneur.

## 4. Kubernetes (minikube)
```bash
minikube start
kubectl create secret generic my-app-secret --from-literal=API_KEY=<votre-cle>
sed "s|IMAGE_PLACEHOLDER|<dockerhub-user>/my-app:latest|" k8s/k8s-deployment.yaml | kubectl apply -f -
```

## 5. Vérification
```bash
kubectl get pods
kubectl get svc
minikube service my-app-service --url   # (ou "minikube tunnel" pour l'IP du LoadBalancer)
curl <url>                              # -> Hello World
```

## Défis supplémentaires
1. **Tests automatisés** — `test/` + étape `Unit Tests` du Jenkinsfile.
2. **Monitoring** — endpoint `/metrics`, annotations Prometheus, `monitoring/servicemonitor.yaml` (kube-prometheus-stack via Helm, Grafana inclus).
3. **Secrets** — `my-app-secret` injecté en variable `API_KEY` ; aucune valeur réelle dans Git.
