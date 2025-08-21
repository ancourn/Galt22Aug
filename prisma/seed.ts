import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default users
  const hashedPassword = await bcrypt.hash('developer', 10);
  
  const developerUser = await prisma.user.upsert({
    where: { email: 'dev@oxx.local' },
    update: {},
    create: {
      email: 'dev@oxx.local',
      name: 'Developer',
      role: 'admin',
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en'
      }
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@oxx.local' },
    update: {},
    create: {
      email: 'demo@oxx.local',
      name: 'Demo User',
      role: 'user',
      preferences: {
        theme: 'dark',
        notifications: true,
        language: 'en'
      }
    },
  });

  console.log('✅ Users created');

  // Create sample projects for developer user
  const projects = [
    {
      title: 'AI-Powered Workspace',
      description: 'Building an intelligent workspace with AI integration and real-time collaboration',
      status: 'active',
      priority: 'high',
      userId: developerUser.id,
      metadata: {
        tags: ['ai', 'workspace', 'collaboration'],
        progress: 75,
        deadline: '2024-12-31'
      }
    },
    {
      title: 'Knowledge Graph Implementation',
      description: 'Implementing a knowledge graph system for connecting related content across modules',
      status: 'active',
      priority: 'medium',
      userId: developerUser.id,
      metadata: {
        tags: ['knowledge-graph', 'ai', 'data'],
        progress: 45,
        deadline: '2024-11-30'
      }
    },
    {
      title: 'Mobile App Development',
      description: 'Creating a mobile companion app for the workspace platform',
      status: 'planning',
      priority: 'low',
      userId: developerUser.id,
      metadata: {
        tags: ['mobile', 'app', 'react-native'],
        progress: 10,
        deadline: '2025-01-15'
      }
    }
  ];

  for (const project of projects) {
    await prisma.project.create({
      data: project
    });
  }

  // Create sample projects for demo user
  const demoProjects = [
    {
      title: 'Personal Blog',
      description: 'Building a personal blog with Next.js and Tailwind CSS',
      status: 'active',
      priority: 'medium',
      userId: demoUser.id,
      metadata: {
        tags: ['blog', 'nextjs', 'tailwind'],
        progress: 60,
        deadline: '2024-10-31'
      }
    },
    {
      title: 'Portfolio Website',
      description: 'Creating a professional portfolio website to showcase projects',
      status: 'completed',
      priority: 'high',
      userId: demoUser.id,
      metadata: {
        tags: ['portfolio', 'web', 'design'],
        progress: 100,
        deadline: '2024-09-15'
      }
    }
  ];

  for (const project of demoProjects) {
    await prisma.project.create({
      data: project
    });
  }

  console.log('✅ Projects created');

  // Create sample notes for developer user
  const notes = [
    {
      title: 'AI Integration Ideas',
      content: `## AI Integration Roadmap

### Phase 1: Basic AI Features
- Natural language processing for search
- Smart content suggestions
- Automated task categorization

### Phase 2: Advanced AI Features
- Predictive analytics for project management
- Intelligent document summarization
- Automated workflow optimization

### Phase 3: AI-Powered Automation
- Smart triggers based on user behavior
- Autonomous task generation
- Predictive resource allocation`,
      userId: developerUser.id,
      tags: JSON.stringify(['ai', 'planning', 'integration']),
      metadata: {
        type: 'planning',
        priority: 'high',
        category: 'technical'
      }
    },
    {
      title: 'Meeting Notes - Team Sync',
      content: `## Team Sync Meeting - October 15, 2024

### Attendees
- Development Team
- Product Manager
- Design Lead

### Discussion Points
1. **Progress Update**: AI module integration is 75% complete
2. **Challenges**: Real-time collaboration needs optimization
3. **Next Steps**: Focus on knowledge graph implementation

### Action Items
- [ ] Optimize Socket.IO performance
- [ ] Complete knowledge graph schema
- [ ] Test AI integration with real data
- [ ] Prepare demo for stakeholders`,
      userId: developerUser.id,
      tags: JSON.stringify(['meeting', 'team', 'action-items']),
      metadata: {
        type: 'meeting',
        priority: 'medium',
        category: 'collaboration'
      }
    },
    {
      title: 'Technical Architecture Decisions',
      content: `## Architecture Decisions Log

### Database Choice: Prisma + SQLite
**Decision**: Use Prisma ORM with SQLite for development
**Rationale**: 
- Rapid development cycle
- Easy schema migrations
- Single file deployment
- Sufficient for initial user base

### Real-time Communication: Socket.IO
**Decision**: Implement Socket.IO for real-time features
**Rationale**:
- WebSocket fallback support
- Room-based messaging
- Event-driven architecture
- Large community support

### Authentication: NextAuth.js
**Decision**: Use NextAuth.js for authentication
**Rationale**:
- Session management
- Multiple provider support
- TypeScript integration
- Security best practices`,
      userId: developerUser.id,
      tags: JSON.stringify(['architecture', 'technical', 'decisions']),
      metadata: {
        type: 'documentation',
        priority: 'high',
        category: 'technical'
      }
    },
    {
      title: 'User Experience Improvements',
      content: `## UX Enhancement Ideas

### Navigation Improvements
- [ ] Add breadcrumbs for better orientation
- [ ] Implement keyboard shortcuts
- [ ] Improve mobile navigation
- [ ] Add search functionality

### Interface Enhancements
- [ ] Dark mode optimization
- [ ] Loading states and skeletons
- [ ] Error boundary improvements
- [ ] Accessibility enhancements

### Performance Optimizations
- [ ] Lazy loading for components
- [ ] Image optimization
- [ ] Code splitting strategies
- [ ] Caching mechanisms`,
      userId: developerUser.id,
      tags: JSON.stringify(['ux', 'improvements', 'planning']),
      metadata: {
        type: 'planning',
        priority: 'medium',
        category: 'design'
      }
    }
  ];

  for (const note of notes) {
    await prisma.note.create({
      data: note
    });
  }

  // Create sample notes for demo user
  const demoNotes = [
    {
      title: 'Learning Resources',
      content: `## Web Development Learning Path

### Frontend Technologies
- **React**: Component-based architecture
- **Next.js**: Full-stack React framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS

### Backend Technologies
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **Prisma**: Next-generation ORM
- **PostgreSQL**: Relational database

### DevOps & Tools
- **Docker**: Containerization
- **Git**: Version control
- **CI/CD**: Continuous integration/deployment
- **Testing**: Unit and integration tests`,
      userId: demoUser.id,
      tags: JSON.stringify(['learning', 'resources', 'web-development']),
      metadata: {
        type: 'reference',
        priority: 'medium',
        category: 'education'
      }
    },
    {
      title: 'Project Ideas',
      content: `## Future Project Ideas

### Personal Projects
1. **Recipe Manager**
   - Ingredient tracking
   - Meal planning
   - Shopping list generation

2. **Fitness Tracker**
   - Workout logging
   - Progress visualization
   - Goal setting

3. **Budget Planner**
   - Expense tracking
   - Savings goals
   - Financial insights

### Professional Projects
1. **Task Management System**
   - Team collaboration
   - Time tracking
   - Project analytics

2. **Content Management System**
   - Markdown support
   - Media management
   - SEO optimization`,
      userId: demoUser.id,
      tags: JSON.stringify(['ideas', 'projects', 'planning']),
      metadata: {
        type: 'brainstorming',
        priority: 'low',
        category: 'ideas'
      }
    }
  ];

  for (const note of demoNotes) {
    await prisma.note.create({
      data: note
    });
  }

  console.log('✅ Notes created');

  // Create sample knowledge graph nodes
  const knowledgeNodes = [
    {
      moduleId: 'projects',
      title: 'AI-Powered Workspace',
      type: 'project',
      content: 'Building an intelligent workspace with AI integration',
      url: '/projects',
      metadata: { projectId: '1', priority: 'high' }
    },
    {
      moduleId: 'notes',
      title: 'AI Integration Ideas',
      type: 'document',
      content: 'AI integration roadmap and implementation plan',
      url: '/notes',
      metadata: { noteId: '1', category: 'planning' }
    },
    {
      moduleId: 'projects',
      title: 'Knowledge Graph Implementation',
      type: 'project',
      content: 'Implementing knowledge graph for content connections',
      url: '/projects',
      metadata: { projectId: '2', priority: 'medium' }
    }
  ];

  for (const node of knowledgeNodes) {
    await prisma.knowledgeNode.create({
      data: node
    });
  }

  // Create sample knowledge graph edges
  const knowledgeEdges = [
    {
      fromNodeId: '1',
      toNodeId: '2',
      relation: 'references',
      weight: 0.8,
      metadata: { type: 'citation' }
    },
    {
      fromNodeId: '2',
      toNodeId: '3',
      relation: 'related_to',
      weight: 0.9,
      metadata: { type: 'conceptual' }
    }
  ];

  for (const edge of knowledgeEdges) {
    await prisma.knowledgeEdge.create({
      data: edge
    });
  }

  console.log('✅ Knowledge graph created');

  // Create sample search documents
  const searchDocuments = [
    {
      moduleId: 'projects',
      title: 'AI-Powered Workspace',
      content: 'Building an intelligent workspace with AI integration and real-time collaboration features',
      url: '/projects',
      metadata: { type: 'project', status: 'active' }
    },
    {
      moduleId: 'notes',
      title: 'AI Integration Ideas',
      content: 'Comprehensive roadmap for AI integration including natural language processing and smart suggestions',
      url: '/notes',
      metadata: { type: 'note', category: 'planning' }
    },
    {
      moduleId: 'projects',
      title: 'Knowledge Graph Implementation',
      content: 'Implementation of knowledge graph system for connecting related content across different modules',
      url: '/projects',
      metadata: { type: 'project', status: 'active' }
    }
  ];

  for (const doc of searchDocuments) {
    await prisma.searchDocument.create({
      data: doc
    });
  }

  console.log('✅ Search documents created');

  // Create sample automations
  const automations = [
    {
      name: 'Project Status Notification',
      description: 'Send notification when project status changes',
      enabled: true,
      trigger: {
        type: 'project_status_change',
        condition: { status: { in: ['completed', 'archived'] } }
      },
      actions: [
        { type: 'send_notification', message: 'Project status has been updated' },
        { type: 'update_knowledge_graph', action: 'sync_project_status' }
      ]
    },
    {
      name: 'New Note Tagging',
      description: 'Automatically tag new notes based on content',
      enabled: true,
      trigger: {
        type: 'note_created',
        condition: { content: { length: { gt: 100 } } }
      },
      actions: [
        { type: 'analyze_content', action: 'extract_keywords' },
        { type: 'update_tags', method: 'automatic' }
      ]
    }
  ];

  for (const automation of automations) {
    await prisma.automation.create({
      data: automation
    });
  }

  console.log('✅ Automations created');

  console.log('🎉 Database seeding completed!');
  console.log('📊 Summary:');
  console.log(`   - Users: 2`);
  console.log(`   - Projects: 5`);
  console.log(`   - Notes: 6`);
  console.log(`   - Knowledge Nodes: 3`);
  console.log(`   - Knowledge Edges: 2`);
  console.log(`   - Search Documents: 3`);
  console.log(`   - Automations: 2`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });