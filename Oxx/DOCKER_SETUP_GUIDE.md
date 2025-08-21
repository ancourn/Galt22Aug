# Docker Setup Guide for Oxx AI-Powered Workspace

## Overview
This guide explains how to set up the complete Oxx AI-powered workspace using Docker when it becomes available in your environment.

## Prerequisites
- Docker and Docker Compose installed
- At least 8GB RAM available
- Port 3000, 5432, 7700, 11434 available

## Quick Start

### 1. Start All Services
```bash
docker-compose up -d
```

This will start:
- **PostgreSQL** (port 5432) - Main database
- **Redis** (port 6379) - Cache and session storage
- **Ollama** (port 11434) - AI service with Llama3 model
- **Meilisearch** (port 7700) - Search engine
- **Grafana** (port 3001) - Monitoring dashboard
- **Prometheus** (port 9090) - Metrics collection
- And all other microservices

### 2. Verify Services are Running
```bash
docker-compose ps
```

### 3. Update Environment Configuration
Update your `.env` file to use PostgreSQL instead of SQLite:

```env
# Database
DATABASE_URL="postgresql://oxlas:oxlas123@localhost:5432/oxlas"

# AI Services
OLLAMA_URL="http://localhost:11434"
MEILISEARCH_HOST_URL="http://localhost:7700"
MEILISEARCH_MASTER_KEY="masterKey"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

### 4. Update Prisma Configuration
Change the database provider in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 5. Run Database Migrations
```bash
npx prisma db push
npx prisma generate
```

### 6. Pull AI Model
```bash
curl -X POST http://localhost:11434/api/pull -d '{"name": "llama3"}'
```

### 7. Restart Development Server
```bash
npm run dev
```

## Service Details

### Database Services
- **PostgreSQL**: Main database for all application data
- **Redis**: Caching and real-time features

### AI Services
- **Ollama**: Large Language Model service
  - Automatically pulls Llama3 model on startup
  - Provides AI capabilities for co-pilot features
- **Meilisearch**: Full-text search engine
  - Powers global search across all modules
  - Fast and relevant search results

### Monitoring
- **Grafana**: Visualization and monitoring dashboard
  - Accessible at `http://localhost:3001`
  - Default credentials: admin/admin123
- **Prometheus**: Metrics collection and storage

### Application Services
- **Next.js Development Server**: Main application (port 3000)
- **Socket.IO**: Real-time communication
- **Prisma Studio**: Database management (port 5555)

## Testing the Setup

### 1. Test Database Connection
```bash
npx prisma studio
```
Visit `http://localhost:5555` to verify database tables.

### 2. Test AI Service
```bash
curl http://localhost:11434/api/tags
```
Should return available AI models.

### 3. Test Search Service
```bash
curl http://localhost:7700/health
```
Should return health status.

### 4. Test Authentication
Visit `http://localhost:3000/auth/signin` and test login.

### 5. Test AI Features
- Visit the AI Co-Pilot at `/ai`
- Try asking questions or creating content
- Test automation features at `/flow`
- Explore knowledge graph at `/brain`

## Production Considerations

### Security
1. **Change Default Passwords**:
   ```bash
   # Update Grafana password
   docker-compose exec grafana grafana-cli admin reset-admin-password new-password
   ```

2. **Secure Environment Variables**:
   ```env
   # Use strong, randomly generated secrets
   NEXTAUTH_SECRET=$(openssl rand -base64 32)
   MEILISEARCH_MASTER_KEY=$(openssl rand -base64 32)
   ```

3. **Network Security**:
   - Use Docker networks to isolate services
   - Configure firewall rules appropriately
   - Consider using reverse proxy (nginx) for production

### Performance
1. **Resource Allocation**:
   ```yaml
   # In docker-compose.yml
   services:
     ollama:
       deploy:
         resources:
           limits:
             memory: 4G
           reservations:
             memory: 2G
   ```

2. **Database Optimization**:
   - Enable connection pooling
   - Configure proper indexes
   - Set up automated backups

3. **Caching Strategy**:
   - Use Redis for application caching
   - Configure CDN for static assets
   - Enable browser caching

### Backup and Recovery
1. **Database Backups**:
   ```bash
   # Create backup
   docker-compose exec postgres pg_dump -U oxlas oxlas > backup.sql
   
   # Restore backup
   docker-compose exec -i postgres psql -U oxlas oxlas < backup.sql
   ```

2. **Volume Backups**:
   ```bash
   # Backup all volumes
   docker run --rm -v oxx_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
   ```

## Troubleshooting

### Common Issues

1. **Port Conflicts**:
   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :5432
   
   # Kill conflicting processes
   kill -9 <PID>
   ```

2. **Service Not Starting**:
   ```bash
   # Check logs
   docker-compose logs <service_name>
   
   # Example:
   docker-compose logs postgres
   docker-compose logs ollama
   ```

3. **Database Connection Issues**:
   ```bash
   # Test database connection
   docker-compose exec postgres psql -U oxlas -d oxlas -c "SELECT 1;"
   ```

4. **AI Service Issues**:
   ```bash
   # Check Ollama status
   docker-compose exec ollama ollama list
   
   # Repull model if needed
   docker-compose exec ollama ollama pull llama3
   ```

### Performance Issues
1. **High Memory Usage**:
   - Monitor container resource usage
   - Adjust memory limits in docker-compose.yml
   - Consider scaling services horizontally

2. **Slow Search**:
   - Check Meilisearch configuration
   - Reindex search data
   - Optimize search queries

## Development Workflow

### Local Development
1. **Start essential services only**:
   ```bash
   docker-compose up -d postgres redis meilisearch ollama
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

### Testing
1. **Run test suite**:
   ```bash
   npm test
   ```

2. **Integration tests**:
   ```bash
   npm run test:integration
   ```

### Deployment
1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Start production services**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Scaling and Maintenance

### Horizontal Scaling
1. **Load Balance Multiple Instances**:
   ```yaml
   # In docker-compose.yml
   services:
     app:
       deploy:
         replicas: 3
   ```

2. **Use External Services**:
   - Consider managed PostgreSQL (RDS, etc.)
   - Use managed Redis (ElastiCache, etc.)
   - Use external AI services (OpenAI, etc.)

### Monitoring and Alerting
1. **Set up monitoring**:
   - Configure Grafana dashboards
   - Set up alerting rules
   - Monitor key metrics

2. **Log Aggregation**:
   - Centralize logs with ELK stack
   - Set up log rotation
   - Monitor error rates

## Conclusion

This Docker setup provides a complete, production-ready environment for the Oxx AI-powered workspace. With all services running, you'll have access to:

- ✅ **AI Co-Pilot** features with real LLM capabilities
- ✅ **Global Search** across all modules
- ✅ **Knowledge Graph** for content relationships
- ✅ **Automation Engine** for workflow automation
- ✅ **Real-time Collaboration** features
- ✅ **Comprehensive Monitoring** and observability

The system is designed to be scalable, secure, and maintainable for production use.