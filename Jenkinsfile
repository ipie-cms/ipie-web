// CI/CD for ipie-web.
//
// The same shape as the service template's pipeline - verify, then build one artifact, then promote
// it - with the differences a static frontend brings: the gate is npm rather than Gradle, and the
// artifact is a served bundle rather than a JVM process.
//
// ONE BUNDLE FOR EVERY ENVIRONMENT. Nothing environment-specific is compiled in; the application
// reads /config.json at startup (ARCHITECTURE_PLAN.md section 4), which is what lets the image
// validated in UAT be the image that reaches Production. The verification stage below checks that
// property rather than trusting it.
//
// AGENT REQUIREMENTS
//   * Node 24 (Active LTS) - matches package.json's engine expectations
//   * Docker, for the image stages
//
// JENKINS CONFIGURATION EXPECTED
//   Tool         'node-24'                    NodeJS installation
//   Credential   'ipie-container-registry'    username/password - pushes images
//   Env          IPIE_REGISTRY                registry host

pipeline {
    agent { label 'docker' }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '30', artifactNumToKeepStr: '10'))
        disableConcurrentBuilds(abortPrevious: true)
        timestamps()
    }

    tools {
        nodejs 'node-24'
    }

    environment {
        SERVICE_NAME = 'ipie-web'
        IMAGE = "${env.IPIE_REGISTRY}/${SERVICE_NAME}:${GIT_COMMIT}"
        // Keeps npm's cache inside the workspace so a build cannot inherit another job's state.
        npm_config_cache = "${WORKSPACE}/.npm"
    }

    stages {
        stage('Install') {
            // `npm ci`, not `npm install`: it installs exactly what package-lock.json pins and fails
            // if the two disagree. A build that quietly resolves a different tree is not reproducible.
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint and format') {
            steps {
                sh 'npm run lint'
                sh 'npm run format:check'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test -- --run'
            }
        }

        stage('Build') {
            // `npm run build` is `tsc -b && vite build`, so a type error fails here rather than
            // producing a bundle.
            steps {
                sh 'npm run build'
            }
        }

        stage('Verify the bundle is environment-agnostic') {
            // The promotion story depends on this being true, so it is checked rather than assumed.
            // If an endpoint or a client id ever gets compiled in again, this is where it surfaces -
            // at the point the artifact is made, not after it has been promoted to Production.
            steps {
                sh '''
                    if grep -rlE "localhost:80[0-9]{2}|VITE_[A-Z_]+" dist/assets/*.js; then
                      echo "Environment values found in the built bundle - see ARCHITECTURE_PLAN.md section 4"
                      exit 1
                    fi
                    test -f dist/config.json || { echo "dist/config.json missing"; exit 1; }
                    echo "No environment values compiled into the bundle."
                '''
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }

        stage('Image') {
            when {
                anyOf {
                    branch 'develop'; branch 'test'; branch 'uat'; branch 'preprod'; branch 'master'
                }
            }
            steps {
                script {
                    docker.withRegistry("https://${env.IPIE_REGISTRY}", 'ipie-container-registry') {
                        // Tagged by commit SHA, never by branch or latest - the digest is what gets
                        // promoted between environments.
                        docker.build("${IMAGE}").push()
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                anyOf {
                    branch 'develop'; branch 'test'; branch 'uat'; branch 'preprod'; branch 'master'
                }
            }
            steps {
                script {
                    def target = [
                        develop: 'DEV', test: 'SIT', uat: 'UAT', preprod: 'PPE', master: 'PROD',
                    ][env.BRANCH_NAME]

                    if (target == 'PROD') {
                        timeout(time: 60, unit: 'MINUTES') {
                            input message: "Deploy ${SERVICE_NAME} ${GIT_COMMIT} to PROD?",
                                  submitter: 'release-managers'
                        }
                    }

                    echo "Deploying ${IMAGE} to ${target}"

                    // DELIBERATELY NOT IMPLEMENTED, as in the service template's pipeline: the
                    // orchestrator and its endpoints are still to be confirmed. The deploy must also
                    // mount that environment's config.json over the one baked into the image - the
                    // baked copy holds local values, and a deployment that forgets leaves the bundle
                    // pointing at localhost.
                    error("Deploy step is not configured yet - see the comment in the Jenkinsfile")
                }
            }
        }
    }

    post {
        always {
            junit testResults: 'test-results/*.xml', allowEmptyResults: true
        }
        cleanup {
            cleanWs()
        }
    }
}
