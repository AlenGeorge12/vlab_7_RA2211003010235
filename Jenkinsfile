pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDS = 'dockerhub-creds'
        DOCKER_IMAGE   = "alengeorge12/blue-green-app:${env.BUILD_NUMBER}"
    }

    stages {
        stage('Build & Push Docker Image') {
            steps {
                script {
                    sh "docker build -t ${DOCKER_IMAGE} ."
                    // CORRECTED: Handles 'Username/password' credential type
                    withCredentials([usernamePassword(credentialsId: DOCKER_HUB_CREDS, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"
                        sh "docker push ${DOCKER_IMAGE}"
                    }
                }
            }
        }
        
        stage('Determine Active Color') {
            steps {
                script {
                    def svcOutput = sh(script: 'kubectl get svc myapp-service -o jsonpath="{.spec.selector.color}" 2>/dev/null || echo "none"', returnStdout: true).trim()
                    env.ACTIVE_COLOR = svcOutput
                    env.NEW_COLOR = (svcOutput == 'blue') ? 'green' : 'blue'
                    echo "Active color: ${env.ACTIVE_COLOR}, deploying to: ${env.NEW_COLOR}"
                }
            }
        }

        stage('Deploy New Version') {
            steps {
                script {
                    sh """
                        sed -i 's|image:.*|image: ${DOCKER_IMAGE}|' deployment-${env.NEW_COLOR}.yaml
                        kubectl apply -f deployment-${env.NEW_COLOR}.yaml
                        kubectl rollout status deployment/myapp-${env.NEW_COLOR} --timeout=5m
                    """
                }
            }
        }

        stage('Approval') {
            steps {
                input message: "Switch traffic to ${env.NEW_COLOR}?", ok: 'Proceed'
            }
        }

        stage('Switch Traffic') {
            steps {
                script {
                    sh """
                        kubectl patch svc myapp-service -p '{"spec":{"selector":{"color":"${env.NEW_COLOR}"}}}'
                        echo "Traffic switched to ${env.NEW_COLOR}"
                    """
                }
            }
        }
    }
}
