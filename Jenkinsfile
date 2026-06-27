pipeline {
    agent any

    environment {
        IMAGE_NAME      = "realestate-backend"
        CONTAINER_STAGING  = "realestate-backend-staging"
        CONTAINER_PROD     = "realestate-backend-container"
        PORT_STAGING    = "9002"
        PORT_PROD       = "9001"
        ENV_FILE        = "/opt/envs/realestate.env"

        // Apni team ki email yahan daalo
        MAIL_TESTING    = "testing-team@yourcompany.com"
        MAIL_OWNER      = "owner@yourcompany.com"
        MAIL_DEVOPS     = "devops@yourcompany.com"
    }

    stages {

        // ─────────────────────────────────────────
        // 1. CODE LANA
        // ─────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo "==> Branch: ${env.GIT_BRANCH} | Build: #${env.BUILD_NUMBER}"
                git branch: 'main',
                    url: 'https://github.com/anupkumarbits/realestate-backend.git'
            }
        }

        // ─────────────────────────────────────────
        // 2. DEPENDENCIES
        // ─────────────────────────────────────────
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
                // npm ci - production grade install (package-lock.json se)
                // npm install se better hai CI/CD mein
            }
        }

        // ─────────────────────────────────────────
        // 3. TEST
        // ─────────────────────────────────────────
        stage('Test') {
            steps {
                echo "==> Running tests for build #${env.BUILD_NUMBER}"
                sh 'echo "No tests yet — add: npm test"'
                // Jab test add ho:
                // sh 'npm test'
            }
            post {
                failure {
                    mail(
                        to: "${MAIL_DEVOPS}",
                        subject: "[FAILED] Backend Tests — Build #${env.BUILD_NUMBER}",
                        body: """
Tests fail ho gayi hain.

Job    : ${env.JOB_NAME}
Build  : #${env.BUILD_NUMBER}
Branch : ${env.GIT_BRANCH}

Console log dekho:
${env.BUILD_URL}console

— Jenkins
                        """.stripIndent()
                    )
                }
            }
        }

        // ─────────────────────────────────────────
        // 4. DOCKER IMAGE BUILD
        // ─────────────────────────────────────────
        stage('Build Docker Image') {
            steps {
                echo "==> Building image: ${IMAGE_NAME}:${env.BUILD_NUMBER}"
                sh """
                    docker build \
                        --build-arg BUILD_NUMBER=${env.BUILD_NUMBER} \
                        -t ${IMAGE_NAME}:${env.BUILD_NUMBER} \
                        -t ${IMAGE_NAME}:latest \
                        .
                """
                // Dono tag lagate hain:
                // :42        → is specific build ko rollback ke liye
                // :latest    → hamesha latest version
            }
        }

        // ─────────────────────────────────────────
        // 5. STAGING DEPLOY
        // ─────────────────────────────────────────
        stage('Deploy to Staging') {
            steps {
                echo "==> Staging par deploy kar rahe hain: port ${PORT_STAGING}"
                sh """
                    docker stop  ${CONTAINER_STAGING} || true
                    docker rm    ${CONTAINER_STAGING} || true

                    docker run -d \\
                        --name ${CONTAINER_STAGING} \\
                        -p ${PORT_STAGING}:5000 \\
                        --env-file ${ENV_FILE} \\
                        --restart unless-stopped \\
                        --label build=${env.BUILD_NUMBER} \\
                        ${IMAGE_NAME}:${env.BUILD_NUMBER}
                """
            }
            post {
                success {
                    // Staging deploy hone ke baad testing team ko mail
                    mail(
                        to: "${MAIL_TESTING},${MAIL_OWNER}",
                        subject: "[STAGING READY] Backend Build #${env.BUILD_NUMBER} — Review karo",
                        body: """
Naya backend staging par deploy ho gaya hai. Review karke approve karo.

━━━━━━━━━━━━━━━━━━━━━━━━
 BUILD INFO
━━━━━━━━━━━━━━━━━━━━━━━━
Job     : ${env.JOB_NAME}
Build   : #${env.BUILD_NUMBER}
Branch  : ${env.GIT_BRANCH}

━━━━━━━━━━━━━━━━━━━━━━━━
 STAGING URL
━━━━━━━━━━━━━━━━━━━━━━━━
http://<VM-IP>:${PORT_STAGING}

━━━━━━━━━━━━━━━━━━━━━━━━
 CHANGES (last commit)
━━━━━━━━━━━━━━━━━━━━━━━━
${env.GIT_COMMIT}

Approve karne ke liye Jenkins kholo:
${env.BUILD_URL}input

— Jenkins CI/CD
                        """.stripIndent()
                    )
                }
                failure {
                    mail(
                        to: "${MAIL_DEVOPS}",
                        subject: "[FAILED] Staging Deploy — Build #${env.BUILD_NUMBER}",
                        body: "Staging deploy fail. Console: ${env.BUILD_URL}console"
                    )
                }
            }
        }

        // ─────────────────────────────────────────
        // 6. MANUAL APPROVAL
        // ─────────────────────────────────────────
        stage('Approval') {
            steps {
                timeout(time: 24, unit: 'HOURS') {
                    // 24 ghante tak wait karega approve ka
                    // Agar approve nahi hua to pipeline expire ho jaayegi
                    input(
                        message: "Build #${env.BUILD_NUMBER} production mein deploy karein?",
                        ok: "Haan, Production mein bhejo",
                        submitter: "admin,owner"
                        // sirf 'admin' ya 'owner' Jenkins user approve kar sakta hai
                    )
                }
            }
        }

        // ─────────────────────────────────────────
        // 7. PRODUCTION DEPLOY
        // ─────────────────────────────────────────
        stage('Deploy to Production') {
            steps {
                echo "==> Production par deploy: port ${PORT_PROD}"
                sh """
                    docker stop  ${CONTAINER_PROD} || true
                    docker rm    ${CONTAINER_PROD} || true

                    docker run -d \\
                        --name ${CONTAINER_PROD} \\
                        -p ${PORT_PROD}:5000 \\
                        --env-file ${ENV_FILE} \\
                        --restart unless-stopped \\
                        --label build=${env.BUILD_NUMBER} \\
                        ${IMAGE_NAME}:${env.BUILD_NUMBER}
                """
            }
        }

        // ─────────────────────────────────────────
        // 8. OLD IMAGES CLEANUP
        // ─────────────────────────────────────────
        stage('Cleanup Old Images') {
            steps {
                echo "==> Purani Docker images hata rahe hain"
                sh '''
                    # Latest 3 builds ke alawa sab images delete karo
                    docker images ${IMAGE_NAME} --format '{{.Tag}}' \\
                        | grep -E '^[0-9]+$' \\
                        | sort -rn \\
                        | tail -n +4 \\
                        | xargs -I{} docker rmi ${IMAGE_NAME}:{} || true
                '''
            }
        }

    } // end stages

    // ─────────────────────────────────────────────
    // POST — PIPELINE KA FINAL RESULT
    // ─────────────────────────────────────────────
    post {

        success {
            echo "==> Pipeline SUCCESS — Build #${env.BUILD_NUMBER} production live hai"
            mail(
                to: "${MAIL_OWNER},${MAIL_DEVOPS}",
                subject: "[DEPLOYED] Backend #${env.BUILD_NUMBER} — Production Live",
                body: """
Backend successfully production par deploy ho gaya hai.

━━━━━━━━━━━━━━━━━━━━━━━━
 DEPLOYMENT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━
Job       : ${env.JOB_NAME}
Build     : #${env.BUILD_NUMBER}
Duration  : ${currentBuild.durationString}
Status    : SUCCESS ✓

━━━━━━━━━━━━━━━━━━━━━━━━
 PRODUCTION URL
━━━━━━━━━━━━━━━━━━━━━━━━
http://<VM-IP>:${PORT_PROD}

━━━━━━━━━━━━━━━━━━━━━━━━
 IMAGE
━━━━━━━━━━━━━━━━━━━━━━━━
${IMAGE_NAME}:${env.BUILD_NUMBER}

Build details: ${env.BUILD_URL}

— Jenkins CI/CD
                """.stripIndent()
            )
        }

        failure {
            echo "==> Pipeline FAILED — Build #${env.BUILD_NUMBER}"
            mail(
                to: "${MAIL_DEVOPS},${MAIL_OWNER}",
                subject: "[FAILED] Backend Pipeline — Build #${env.BUILD_NUMBER}",
                body: """
Backend pipeline fail ho gayi hai!

━━━━━━━━━━━━━━━━━━━━━━━━
 FAILURE INFO
━━━━━━━━━━━━━━━━━━━━━━━━
Job     : ${env.JOB_NAME}
Build   : #${env.BUILD_NUMBER}
Stage   : ${env.STAGE_NAME}
Branch  : ${env.GIT_BRANCH}

Console log (poori detail):
${env.BUILD_URL}console

Grafana logs:
http://<VM-IP>:3000

— Jenkins CI/CD
                """.stripIndent()
            )
        }

        aborted {
            echo "==> Pipeline ABORTED — Approval timeout ya manually rokha"
            mail(
                to: "${MAIL_DEVOPS}",
                subject: "[ABORTED] Backend Pipeline #${env.BUILD_NUMBER}",
                body: "Pipeline abort ho gayi. Details: ${env.BUILD_URL}"
            )
        }

    } // end post

} // end pipeline
