# 🐂 Oxlas - Comprehensive Workspace Solution

A modern, all-in-one workspace platform that combines productivity tools, AI assistance, and team collaboration features in a single, elegant interface.

## ✨ Overview

Oxlas is designed to be your central hub for work, bringing together email, calendar, file management, video conferencing, team collaboration, document editing, and AI-powered assistance in one unified platform.

## 🚀 Features

### Phase 1 - Available Now ✅
- **📧 Inbox**: Advanced email management with search, filtering, and organization
- **📅 Calendar**: Smart scheduling with event management and reminders
- **💾 Drive**: Secure file storage with organization and sharing capabilities
- **📹 Meet**: High-quality video conferencing with screen sharing
- **👥 Team**: Team member management with status tracking
- **📝 Docs**: Document editing with OnlyOffice integration
- **🤖 AI Assistant**: Intelligent workspace companion powered by Ollama

### Phase 2 - Coming Soon 🟡
- **📋 Projects**: Project management with Planka integration
- **🎧 Care**: Customer support with Zammad integration
- **📚 Wiki**: Knowledge base with Outline integration
-   **💬 Chat**: Real-time messaging with Matrix + Element
- **📊 Forms**: Form creation and analytics with Formbricks
- **📔 Notes**: Note-taking with Joplin integration

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management
- **Prisma** - Database ORM
- **Socket.io** - Real-time communication

### AI & Services
- **Ollama** - Local AI model hosting
- **OnlyOffice** - Document editing
- **NextCloud** - File storage
- **Planka** - Project management
- **Meilisearch** - Full-text search
- **MinIO** - Object storage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker (optional, for services)
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/ancourn/Ox.git
cd Ox

# Run the automated setup script
./setup.sh

# Start the development server
npm run dev
```

### Manual Setup

```bash
# Create required directories
mkdir -p db ssl data sessions uploads
mkdir -p volumes/{postgres_data,redis_data,nextcloud_data,onlyoffice_data,planka_data,jitsi_data}

# Create environment file
cat > .env << 'EOL'
POSTGRES_PASSWORD=$(openssl rand -hex 16)
APP_CRYPTO_KEY=$(openssl rand -base64 32)
APP_JWT_SECRET=$(openssl rand -base64 32)
MEILISEARCH_MASTER_KEY=$(openssl rand -base64 32)
EOL

# Install dependencies
npm install

# Start development server
npm run dev
```

### Services Setup

Start individual services as needed:

```bash
# Document Editor
docker run -d -p 8002:80 onlyoffice/documentserver

# AI Services
docker run -d -p 11434:11434 ollama/ollama

# File Storage
docker run -d -p 8080:80 nextcloud:latest

# Project Management
docker run -d -p 10240:10240 planka/planka
```

## 🌐 Access Points

- **Main Application**: http://localhost:3000
- **API Gateway**: http://localhost:3001
- **Document Editor**: http://localhost:8002
- **AI Services**: http://localhost:11434
- **File Storage**: http://localhost:8080
- **Project Management**: http://localhost:10240
- **Search Engine**: http://localhost:7700

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main dashboard
│   ├── inbox/             # Email management
│   ├── calendar/          # Calendar and events
│   ├── drive/             # File storage
│   ├── meet/              # Video conferencing
│   ├── team/              # Team management
│   ├── docs/              # Document editing
│   └── ai/                # AI assistant
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── oxlas/            # Oxlas-specific components
├── hooks/                # Custom React hooks
└── lib/                  # Utility functions
```

## 🔧 Configuration

### Environment Variables

Key environment variables to configure:

```bash
# Database
POSTGRES_PASSWORD=your_secure_password

# Application Security
APP_CRYPTO_KEY=your_crypto_key
APP_JWT_SECRET=your_jwt_secret

# Services
MEILISEARCH_MASTER_KEY=your_search_key
PLANKA_CRYPTO_KEY=your_planka_key
PLANKA_JWT_SECRET=your_planka_secret
```

### Database Setup

```bash
# Initialize database
npm run db:push

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate
```

## 🚀 Deployment

### Development

```bash
npm run dev
```

### Production

```bash
# Build application
npm run build

# Start production server
npm start

# Or use Docker Compose
docker-compose up -d
```

### Docker Services

Use the provided `docker-compose.yml` to run all services:

```bash
docker-compose up -d
```

This will start:
- Frontend (Next.js)
- API Gateway
- PostgreSQL
- Redis
- OnlyOffice
- Ollama
- NextCloud
- Planka
- Meilisearch
- MinIO
- Nginx (reverse proxy)

## 🔍 Troubleshooting

### Common Issues

**AI Assistant Not Working**
```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Restart Ollama if needed
docker restart ollama
```

**Document Editor Not Working**
```bash
# Check OnlyOffice status
curl http://localhost:8002/welcome

# Restart OnlyOffice if needed
docker restart onlyoffice
```

**Database Connection Issues**
```bash
# Reset database
npm run db:reset

# Check PostgreSQL status
psql -h localhost -U oxlas -d oxlas
```

### Clear Cache

If you encounter any issues:

```bash
rm -rf .next
npm run dev
```

## 📚 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [Phase 2 Ready](./PHASE2_READY.md) - Development roadmap and status
- [API Documentation](./docs/api/) - API reference
- [Deployment Guide](./docs/deployment/) - Deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Next.js** - React framework
- **shadcn/ui** - UI component library
- **Tailwind CSS** - CSS framework
- **Ollama** - AI model hosting
- **OnlyOffice** - Document editing
- **NextCloud** - File storage
- **Planka** - Project management
- And all the open-source projects that make Oxlas possible.

---

Built with ❤️ for teams and organizations seeking a comprehensive workspace solution.
