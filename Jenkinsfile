// Jenkinsfile — pipeline CI/CD : clone -> tests -> build -> push -> deploy
// Plugins Jenkins requis : Git, Pipeline, Docker Pipeline, Kubernetes CLI, NodeJS
// Credentials Jenkins à créer :
//   - docker-hub-credentials : "Username with password" (compte Docker Hub)
//   - kubeconfig             : "Secret file" (le fichier ~/.kube/config du cluster)
pipeline {
    agent any

    parameters {
        string(name: 'DOCKERHUB_USER', defaultValue: 'your-dockerhub-username',
               description: 'Votre identifiant Docker Hub')
        string(name: 'GIT_URL', defaultValue: 'https://github.com/yahyaouimohamedkhalil/my-app.git',
               description: 'URL du dépôt Git')
    }

    environment {
        IMAGE = "${params.DOCKERHUB_USER}/my-app"
        TAG   = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'master', url: "${params.GIT_URL}"
            }
        }

        // Défi 1 : tests automatisés
        stage('Unit Tests') {
            steps {
                sh 'npm install'
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    dockerImage = docker.build("${IMAGE}:${TAG}")
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                        dockerImage.push("${TAG}")
                        dockerImage.push('latest')
                    }
                }
            }
        }

        // Le plugin "Kubernetes Continuous Deploy" (kubernetesDeploy) du sujet est
        // déprécié et retiré de Jenkins : on utilise kubectl via le plugin Kubernetes CLI.
        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: 'kubeconfig']) {
                    sh '''
                        sed "s|IMAGE_PLACEHOLDER|${IMAGE}:${TAG}|g" k8s/k8s-deployment.yaml > k8s/rendered.yaml
                        kubectl apply -f k8s/rendered.yaml
                        kubectl rollout status deployment/my-app --timeout=120s
                    '''
                }
            }
        }

        stage('Smoke Test') {
            steps {
                withKubeConfig([credentialsId: 'kubeconfig']) {
                    sh 'kubectl get pods -l app=my-app'
                    sh 'kubectl get svc my-app-service'
                }
            }
        }
    }

    post {
        success { echo "Déploiement réussi : ${IMAGE}:${TAG}" }
        failure { echo 'Le pipeline a échoué, voir les logs ci-dessus.' }
    }
}
