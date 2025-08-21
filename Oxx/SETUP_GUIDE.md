# 🐂 Oxlas Phase 2 Setup Guide

This guide helps you set up the Oxlas development environment for Phase 2.

## Prerequisites

- Node.js 18+
- Docker (optional, for backend services)
- Git
- OpenSSL (for generating secrets)

## Quick Start

```bash
git clone -b phase2-development https://github.com/ancourn/Ox.git
cd Ox
./setup.sh
npm run dev
```

## Manual Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ancourn/Ox.git
cd Ox
```

### 2. Create Required Directories

```bash
mkdir -p db ssl data sessions uploads
mkdir -p volumes/{postgres_data,redis_data,nextcloud_data,onlyoffice_data,planka_data,jitsi_data}
```

### 3. Create Environment Variables

Create a `.env` file with the following content:

```bash
# Database
POSTGRES_PASSWORD=your_strong_password_here

# Application Secrets
APP_CRYPTO_KEY=$(openssl rand -base64 32)
APP_JWT_SECRET=$(openssl rand -base64 32)

# Search Engine
MEILISEARCH_MASTER_KEY=$(openssl rand -base64 32)

# Services (optional)
POSTFIX_PASSWORD=your_postfix_password
JITSI_PASSWORD=your_jitsi_password
PLANKA_CRYPTO_KEY=$(openssl rand -base64 32)
PLANKA_JWT_SECRET=$(openssl rand -base64 32)
OUTLINE_SECRET_KEY=$(openssl rand -base64 32)
OUTLINE_UTILS_SECRET=$(openssl rand -base64 32)
FORMBRICKS_SECRET=$(openssl rand -base64 32)
FORMBRICKS_ENCRYPTION_KEY=$(openssl rand -base64 32)
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Set Up Database

```bash
# Initialize database
npm run db:push

# Generate Prisma client
npm run db:generate
```

### 6. Start Development Server

```bash
npm run dev
```

## Services to Run Separately

### OnlyOffice (Document Editing)

```bash
docker run -d -p 8002:80 onlyoffice/documentserver
```

### Ollama (AI Services)

```bash
docker run -d -p 11434:11434 ollama/ollama
docker exec ollama ollama pull llama3
```

### Planka (Project Management)

```bash
docker run -d \
  -p 10240:10240 \
  -e APP_PORT=10240 \
  -e DB_CLIENT=pg \
  -e DATABASE_URL=postgresql://oxlas:your_password@localhost:5432/oxlas_planka \
  -e APP_CRYPTO_KEY=your_crypto_key \
  -e APP_JWT_SECRET=your_jwt_secret \
  planka/planka
```

### NextCloud (File Storage)

```bash
docker run -d \
  -p 8080:80 \
  -e POSTGRES_HOST=localhost \
  -e POSTGRES_DB=oxlas \
  -e POSTGRES_USER=oxlas \
  -e POSTGRES_PASSWORD=your_password \
  -e REDIS_HOST=localhost \
  nextcloud:latest
```

## Troubleshooting

### AI Assistant Not Working

Check if Ollama is running:

```bash
curl http://localhost:11434/api/tags
```

If not running, start Ollama:

```bash
docker run -d -p 11434:11434 ollama/ollama
```

### Document Editor Not Working

Check OnlyOffice status:

```bash
curl http://localhost:8002/welcome
```

If not responding, restart OnlyOffice:

```bash
docker restart $(docker ps -q -f "ancestor=onlyoffice/documentserver")
```

### Database Connection Issues

Check PostgreSQL status:

```bash
psql -h localhost -U oxlas -d oxlas
```

Reset database if needed:

```bash
npm run db:reset
```

### Clear Cache

If you experience any issues, clear the cache:

```bash
rm -rf .next
npm run dev
```

## Development Tips

### Hot Reload

The development server supports hot reload. Changes to TypeScript files will automatically restart the server.

### Database Schema Changes

When modifying the Prisma schema:

1. Update `prisma/schema.prisma`
2. Run `npm run db:push` to apply changes
3. Run `npm run db:generate` to update the client

### Environment Variables

Never commit `.env` file to version control. Always use environment-specific configurations.

### Testing Services

Test individual services before running the full stack:

```bash
# Test database
npm run db:push

# Test AI
curl http://localhost:11434/api/tags

# Test document editor
curl http://localhost:8002/welcome

# Test project management
curl http://localhost:10240/api/status
```

## Deployment

For production deployment, use the provided `docker-compose.yml`:

```bash
docker-compose up -d
```

This will start all services including:
- Frontend (Next.js)
- API Gateway
- PostgreSQL
- Redis
- OnlyOffice
- Ollama
- NextCloud
- Planka
- And other integrated services

## Support

If you encounter any issues:

1. Check the logs: `tail -f dev.log`
2. Review this troubleshooting section
3. Check service health using the provided test commands
4. Clear cache and restart development server

## Next Steps

After setup is complete:

1. Navigate to `http://localhost:3000`
2. Explore the dashboard
3. Test individual modules (Inbox, Calendar, Drive, Meet, Team, Docs, AI)
4. Configure backend services as needed
5. Start building your custom features