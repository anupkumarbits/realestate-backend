pipeline {
    agent any

    environment {
        IMAGE_NAME = "realestate-backend"
        CONTAINER_NAME = "realestate-backend-container"
        PORT = "9001"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                url: 'https://github.com/anupkumarbits/realestate-backend.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                sh 'echo "No tests added yet"'
                // future: npm test
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_NAME .'
            }
        }

        stage('Stop Old Container') {
            steps {
                sh '''
                docker stop $CONTAINER_NAME || true
                docker rm $CONTAINER_NAME || true
                '''
            }
        }

        stage('Run Container') {
            steps {
                sh '''
                docker run -d \
                --name $CONTAINER_NAME \
                -p $PORT:5000 \
                --env-file .env \
                $IMAGE_NAME
                '''
            }
        }

    }

    post {
        success {
            echo "Pipeline SUCCESS 🚀 Backend deployed"
        }
        failure {
            echo "Pipeline FAILED ❌ Check logs"
        }
    }
}
