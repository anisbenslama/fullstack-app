# 📋 TaskFlow - Application Full-Stack avec Docker Compose & K3s

---

## 🎯 Présentation du projet

**TaskFlow** est une application de gestion de tâches (Todo list) complète, développée dans le cadre d'un examen pour démontrer les compétences en :

- **Containerisation** avec Docker et Docker Compose
- **Déploiement** sur un cluster Kubernetes (K3s)
- **Infrastructure** 1 master + 2 workers
- **Haute disponibilité** et résilience

### Fonctionnalités

- ✅ Créer, lire, modifier, supprimer des tâches (CRUD complet)
- ✅ Changer le statut d'une tâche (pending, in_progress, completed)
- ✅ Interface utilisateur responsive
- ✅ API REST documentée
- ✅ Persistance des données avec PostgreSQL
- ✅ Healthchecks pour le monitoring

---

## 🏗 Architecture

### Architecture globale
┌─────────────────────────────────────────────────────────────────┐
│ Utilisateur │
│ │ │
│ ▼ │
│ http://localhost:8081 │
└─────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────┐
│ Application TaskFlow │
├───────────────────┬───────────────────┬─────────────────────────┤
│ Frontend │ Backend │ Database │
│ (Nginx:80) │ (Node.js:3000) │ (PostgreSQL:5432) │
│ │ │ │
│ - Interface UI │ - API REST │ - Persistance │
│ - Proxy /api │ - Logique métier │ - Stockage tâches │
│ - Static files │ - Validation │ - Requêtes SQL │
└───────────────────┴───────────────────┴─────────────────────────┘

## 💻 Technologies utilisées

| Composant | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **Frontend** | HTML5 / CSS3 / JavaScript | - | Léger, sans framework, facile à containeriser |
| **Reverse proxy** | Nginx | Alpine | Léger, performant, facile à configurer |
| **Backend** | Node.js + Express | 18-alpine | Asynchrone, rapide pour API REST |
| **Base de données** | PostgreSQL | 15-alpine | Robuste, supporte les transactions ACID |
| **Containerisation** | Docker | 24.0+ | Standard de l'industrie |
| **Orchestration** | Docker Compose | 3.8 | Développement local |
| **Cluster K3s** | K3s | v1.31.5 | Léger, parfait pour edge/IoT |
| **Stockage K8s** | local-path | - | Stockage local sur chaque nœud |

---

## ⚙️ Prérequis

### Matériel requis (cluster K3s)

| Machine | CPU | RAM | Disque | IP |
|---------|-----|-----|--------|-----|
| Master (k3s-server-1) | 2 vCPU | 2 GB | 20 GB | 192.168.37.101 |
| Worker 1 (k3s-node-1) | 1 vCPU | 1 GB | 10 GB | 192.168.37.102 |
| Worker 2 (k3s-node-2) | 1 vCPU | 1 GB | 10 GB | 192.168.37.103 |

### Logiciels requis

| Machine | Logiciels |
|---------|-----------|
| **Machine locale** | Docker Desktop, Git, VS Code |
| **Master + Workers** | Ubuntu 22.04, K3s, kubectl, curl |

---

### Cloner le projet

```bash
git clone https://github.com/anisbenslama/fullstack-app.git
cd fullstack-app

### Configurer les variables d'environnement

# Créer le fichier .env (NE PAS COMMITTER)
echo "DB_PASSWORD=SuperSecretPassword123" > .env

# Créer .env.example (à committer)
echo "DB_PASSWORD=change_me_strong_password" > .env.example

# Build et démarrage
docker compose up -d

# Vérifier l'état des conteneurs du projet 
docker compose ps

☸️ Phase 2 : Kubernetes K3s

2.1 Installation du cluster K3s Sur le Master (192.168.37.101):
## Installation de K3s en mode server
curl -sfL https://get.k3s.io | sh -s - server \
  --write-kubeconfig-mode 644 \
  --node-name k3s-server-1 \
  --flannel-backend none

## Récupérer le token pour les workers
sudo cat /var/lib/rancher/k3s/server/node-token

Sur chaque Worker (192.168.37.102, 103):

# Remplacer TOKEN et MASTER_IP
TOKEN="votre-token-copié"
MASTER_IP="192.168.37.101"

curl -sfL https://get.k3s.io | K3S_URL=https://${MASTER_IP}:6443 \
  K3S_TOKEN=${TOKEN} \
  sh -s - agent \
  --node-name $(hostname)
  
Vérifier le cluster : # Sur le VM master
sudo kubectl get nodes

2.2 Importer les images Docker

# Depuis votre machine locale (avec Docker)
docker save taskflow-backend:latest -o taskflow-backend.tar
docker save taskflow-frontend:latest -o taskflow-frontend.tar

# Copier vers le master et les workers
scp taskflow-backend.tar taskflow-frontend.tar anis@192.168.37.101:/tmp/
scp taskflow-backend.tar taskflow-frontend.tar anis@192.168.37.102:/tmp/
scp taskflow-backend.tar taskflow-frontend.tar anis@192.168.37.103:/tmp/p/

# Sur CHAQUE nœud
sudo k3s ctr image import /tmp/taskflow-backend.tar
sudo k3s ctr image import /tmp/taskflow-frontend.tar

# Vérifier
sudo k3s ctr image list | grep taskflow

2.3 Déployer les manifests

# Copier les manifests vers le master
scp -r k3s/ anis@192.168.37.101:~/

# Se connecter au master
ssh anis@192.168.37.101

# Déployer
cd ~/k3s
kubectl apply -f namespace.yaml
kubectl apply -f storage-class.yaml
kubectl apply -f persistent-volume-claim.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
kubectl apply -f database-deployment.yaml
kubectl apply -f database-service.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml

2.4 Vérifier le déploiement: 

# Tous les resources
kubectl get all -n taskflow

# Pods avec leur nœud
kubectl get pods -n taskflow -o wide

2.5 Tester sur K3s
# Tester depuis le master
curl http://localhost:30080/api/tasks

# Tester depuis l'extérieur
curl http://192.168.37.101:30080/api/tasks
curl http://192.168.37.102:30080/api/tasks
curl http://192.168.37.103:30080/api/tasks

# Accéder à l'interface web
# Ouvrir http://192.168.37.101:30080

📊 Auteur
Anis BENSLAMA - Étudiant Mastere DevOps et Cloud 

Projet : Déploiement d'une application Full-Stack avec Docker Compose & Kubernetes (K3s)

Date : 04 Mai 2026
