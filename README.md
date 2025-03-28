# Docker Project

A Node.js application containerized with Docker and tested with Cypress.

## GitHub Actions Workflow

This project includes a GitHub Actions workflow that:
1. Runs Cypress tests on every push and pull request
2. On successful tests, builds and pushes the Docker image to Docker Hub (only on main branch)

### Setting up Secrets

To use the GitHub Actions workflow, you need to set up the following secrets in your repository:

1. `DATABASE_URL`: Your database connection string
2. `DOCKER_HUB_USERNAME`: Your Docker Hub username
3. `DOCKER_HUB_TOKEN`: Your Docker Hub access token

## Local Development

### Running the App

```
npm install
npm run dev
```

### Running Cypress Tests Locally

```
npm run cypress:open
```

### Using Docker Compose

Standard environment:
```
docker-compose up
```

Run with Cypress tests:
```
docker-compose -f docker-compose.yml -f docker-compose.cypress.yml up
``` 