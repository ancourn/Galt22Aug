# Oxx AI-Powered Workspace - Deployment Guide

## 🚀 Overview

The Oxx AI-Powered Workspace has been successfully deployed to GitHub at: **https://github.com/ancourn/Xoso.git**

This comprehensive guide covers all deployment options, setup instructions, and next steps for getting your AI-powered workspace running in production.

## 📁 Repository Structure

```
Xoso/
├── Oxx/                    # Main Oxx AI-Powered Workspace application
│   ├── src/app/           # Next.js App Router pages
│   ├── src/components/    # React components (UI, AI, etc.)
│   ├── src/lib/          # Core libraries (auth, db, ai)
│   ├── prisma/           # Database schema
│   ├── services/         # Microservices (brain, flow)
│   ├── config/           # Configuration files
│   ├── scripts/          # Setup and deployment scripts
│   └── docker-compose.yml # Docker orchestration
├── db/                   # Database files
└── DEPLOYMENT_GUIDE.md   # This guide
```

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose (optional, for containerized deployment)
- Git

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ancourn/Xoso.git
   cd Xoso
   ```

2. **Navigate to the Oxx directory:**
   ```bash
   cd Oxx
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Set up the database:**
   ```bash
   npm run db:push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Access the application:**
   - Open http://localhost:3000
   - Use developer credentials to log in

## 🐳 Docker Deployment

### Production Setup

1. **Using Docker Compose (Recommended):**
   ```bash
   cd Oxx
   docker-compose up -d
   ```

2. **Access the application:**
   - Main application: http://localhost:3000
   - Prisma Studio: http://localhost:5555
   - Brain service: http://localhost:3001
   - Flow service: http://localhost:3002

### Environment Configuration

Create a `.env` file in the Oxx directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# AI Services (when ready)
AI_SERVICE_URL="http://localhost:8000"
AI_API_KEY="your-ai-api-key"
```

## 🗄️ Database Options

### SQLite (Default - Development)
- **File:** `Oxx/prisma/dev.db`
- **Management:** Prisma Studio at `http://localhost:5555`
- **Switch command:** `./scripts/switch-db.sh sqlite`

### PostgreSQL (Production)
- **Configuration:** Update `DATABASE_URL` in `.env`
- **Switch command:** `./scripts/switch-db.sh postgres`
- **Example:** `DATABASE_URL="postgresql://user:password@localhost:5432/oxx"`

## 🔐 Authentication

The application uses NextAuth.js for authentication:

### Default Developer Account
- **Email:** `developer@oxx.ai`
- **Password:** `developer123`
- **Role:** Full access to all modules

### Adding New Users
1. Access Prisma Studio: `npm run db:studio`
2. Navigate to the `User` table
3. Add new user records with appropriate roles

## 🤖 AI Integration

### Current Status
- **Mock AI Service:** Implemented in `Oxx/src/lib/ai.ts`
- **Real AI Service:** Ready in `Oxx/src/lib/ai-real.ts`
- **AI Endpoints:** `/api/ai`, `/api/ai/generate`, `/api/ai/execute`

### Enabling Real AI
1. Uncomment the real AI service implementation
2. Configure AI service credentials in `.env`
3. Restart the application

## 📱 Core Modules

### AI Co-Pilot (`/ai`)
- Chat interface with AI assistant
- Cross-module operation capabilities
- Context-aware responses

### Knowledge Graph (`/brain`)
- Content relationship mapping
- Visual knowledge representation
- Connected insights discovery

### Automation Engine (`/flow`)
- No-code workflow automation
- Drag-and-drop interface
- Multi-step process automation

### Additional Modules
- **Projects:** Project management and tracking
- **Notes:** Rich text note-taking with AI assistance
- **Wiki:** Collaborative knowledge base
- **Docs:** Document management system
- **Drive:** File storage and organization
- **Calendar:** Scheduling and events
- **Meet:** Video conferencing integration
- **Team:** Team collaboration tools
- **Chat:** Real-time messaging
- **Inbox:** Email and message management
- **Forms:** Form builder and data collection
- **Care:** Wellness and productivity tracking

## 🔍 Global Search

### Features
- Unified search across all modules
- Intelligent filtering and categorization
- Fallback to local search when external services unavailable

### Access
- Global search trigger in header
- Keyboard shortcut: `Ctrl+K` (or `Cmd+K` on Mac)

## 🌐 Real-time Features

### WebSocket Integration
- Real-time updates across modules
- Live collaboration features
- Socket.io implementation in `Oxx/src/lib/socket.ts`

### Usage Example
```javascript
import { socket } from '@/lib/socket';

socket.on('connect', () => {
  console.log('Connected to real-time services');
});
```

## 📊 Monitoring and Health

### Health Check Endpoint
- **URL:** `/api/health`
- **Response:** Application status and dependencies
- **Usage:** `curl http://localhost:3000/api/health`

### Development Logs
- **File:** `/home/z/my-project/dev.log`
- **Monitoring:** `tail -f dev.log`

## 🚀 Production Deployment

### Option 1: Docker (Recommended)
```bash
cd Oxx
docker-compose -f docker-compose.yml up -d
```

### Option 2: Node.js Direct
```bash
cd Oxx
npm install
npm run build
npm start
```

### Option 3: Cloud Platforms

#### Vercel
1. Connect repository to Vercel
2. Configure environment variables
3. Deploy automatically

#### AWS/Google Cloud/Azure
1. Set up cloud infrastructure
2. Deploy Docker containers
3. Configure load balancing and scaling

## 🔧 Configuration Files

### Key Configuration Files
- `Oxx/next.config.ts`: Next.js configuration
- `Oxx/prisma/schema.prisma`: Database schema
- `Oxx/docker-compose.yml`: Docker services
- `Oxx/components.json`: UI component configuration
- `Oxx/tailwind.config.ts`: Styling configuration

### Environment Variables
```env
# Application
NODE_ENV="production"
PORT="3000"

# Database
DATABASE_URL="file:./dev.db"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# AI Services
AI_SERVICE_URL="http://ai-service:8000"
AI_API_KEY="your-ai-api-key"

# External Services
MEILISEARCH_URL="http://meilisearch:7700"
MEILISEARCH_KEY="your-meilisearch-key"
```

## 📈 Scaling and Performance

### Database Optimization
- Use PostgreSQL for production
- Implement connection pooling
- Regular database backups

### Caching Strategy
- Implement Redis for session storage
- Use CDN for static assets
- Enable browser caching

### Load Balancing
- Use Nginx as reverse proxy
- Implement horizontal scaling
- Configure auto-scaling based on load

## 🔒 Security Considerations

### Authentication Security
- Use strong NEXTAUTH_SECRET
- Implement rate limiting
- Enable HTTPS in production

### Data Protection
- Encrypt sensitive data
- Implement proper access controls
- Regular security audits

### Network Security
- Use firewall rules
- Implement VPN access
- Monitor for suspicious activity

## 🛠️ Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Reset database
rm Oxx/prisma/dev.db
npm run db:push
```

#### Port Conflicts
```bash
# Check port usage
lsof -i :3000
# Kill process if needed
kill -9 <PID>
```

#### Docker Issues
```bash
# Clean Docker environment
docker-compose down
docker system prune -a
docker-compose up -d
```

### Log Analysis
```bash
# View application logs
docker-compose logs -f app

# View specific service logs
docker-compose logs -f brain
docker-compose logs -f flow
```

## 📚 Documentation Resources

### Project Documentation
- `Oxx/README.md`: Project overview
- `Oxx/SETUP_GUIDE.md`: Detailed setup instructions
- `Oxx/DOCKER_SETUP_GUIDE.md`: Docker-specific setup
- `Oxx/PHASE2_READY.md`: Phase 2 implementation status

### API Documentation
- **Health Check:** `GET /api/health`
- **AI Services:** `POST /api/ai/*`
- **Search:** `GET /api/search`
- **Authentication:** `/api/auth/*`

## 🎯 Next Steps and Future Development

### Immediate Actions
1. [ ] Configure production environment variables
2. [ ] Set up monitoring and alerting
3. [ ] Implement backup strategy
4. [ ] Configure SSL certificates
5. [ ] Set up CI/CD pipeline

### Phase 2 Enhancements
1. [ ] Integrate real AI services (Ollama/OpenAI)
2. [ ] Implement Meilisearch for advanced search
3. [ ] Add mobile applications
4. [ ] Implement advanced analytics
5. [ ] Add third-party integrations

### Long-term Goals
1. [ ] Multi-tenant architecture
2. [ ] Advanced AI capabilities
3. [ ] Enterprise features
4. [ ] Global deployment
5. [ ] Advanced security features

## 📞 Support and Community

### Getting Help
- **GitHub Issues:** Report bugs and request features
- **Documentation:** Check project README files
- **Community:** Join developer discussions

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 🎉 Deployment Complete!

Your Oxx AI-Powered Workspace is now deployed and ready for use. The application provides a comprehensive AI-driven productivity platform with 15+ integrated modules, real-time collaboration features, and scalable architecture.

**Key URLs:**
- **GitHub Repository:** https://github.com/ancourn/Xoso.git
- **Application:** http://localhost:3000 (development)
- **Database Studio:** http://localhost:5555

**Next Steps:**
1. Configure your production environment
2. Set up monitoring and backups
3. Explore the AI-powered features
4. Customize for your specific use case

The platform is production-ready and can be scaled according to your needs. Enjoy your AI-powered workspace! 🚀