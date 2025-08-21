# Team Collaboration & Task Management System - Development Setup Guide

This guide provides instructions for setting up the development environment after pulling the `feature/team-collaboration-task-management` branch.

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- Git

### Setup Steps

1. **Clone and Switch Branch**
   ```bash
   git clone https://github.com/ancourn/Galt22Aug.git
   cd Galt22Aug
   git checkout feature/team-collaboration-task-management
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Setup** ⚠️ **Important**
   ```bash
   # This will create/update the database schema with new tables
   npm run db:push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   Open http://localhost:3000 in your browser

## 🗄️ Database Setup Details

### What Happens When You Run `npm run db:push`

The `db:push` command will:

1. **Create New Tables:**
   - `Team` - Team management
   - `TeamMember` - Team membership with roles
   - `Task` - Comprehensive task management
   - `TaskComment` - Task commenting system
   - `TimeEntry` - Time tracking for tasks
   - `TaskAttachment` - File attachments for tasks

2. **Update Existing Tables:**
   - `User` - Add relations for teams and tasks
   - `Project` - Add team relation and task relation

3. **Create Indexes:**
   - Optimized indexes for performance on frequently queried fields
   - Composite indexes for common query patterns

### Database Schema Overview

#### Team Management
```sql
-- Teams table
CREATE TABLE Team (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  avatar TEXT,
  ownerId TEXT NOT NULL,
  metadata TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Team members table
CREATE TABLE TeamMember (
  id TEXT PRIMARY KEY,
  teamId TEXT NOT NULL,
  userId TEXT NOT NULL,
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
  joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT,
  UNIQUE(teamId, userId)
);
```

#### Task Management
```sql
-- Tasks table
CREATE TABLE Task (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo', -- 'todo', 'in_progress', 'review', 'done'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  type TEXT DEFAULT 'task', -- 'task', 'bug', 'feature', 'epic'
  projectId TEXT,
  teamId TEXT,
  assigneeId TEXT,
  reporterId TEXT NOT NULL,
  dueDate DATETIME,
  startDate DATETIME,
  completedAt DATETIME,
  estimatedHours INTEGER,
  actualHours INTEGER,
  metadata TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Task comments table
CREATE TABLE TaskComment (
  id TEXT PRIMARY KEY,
  taskId TEXT NOT NULL,
  userId TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Environment Variables

Ensure your `.env` file has the following:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Socket.IO (for real-time features)
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
```

## 🔧 Development Features

### Real-Time Collaboration

The system includes real-time features powered by Socket.IO:

- **Team Updates**: Live team creation, member additions, modifications
- **Task Updates**: Real-time task status changes, assignments, comments
- **Smart Broadcasting**: Events are sent only to relevant users/teams

### API Endpoints

#### Teams API
- `GET /api/teams` - Get all teams for current user
- `POST /api/teams` - Create new team
- `GET /api/teams/[id]` - Get specific team details
- `PUT /api/teams/[id]` - Update team
- `DELETE /api/teams/[id]` - Delete team
- `POST /api/teams/[id]/members` - Add team member

#### Tasks API
- `GET /api/tasks` - Get tasks with filtering
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get specific task
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task
- `POST /api/tasks/[id]/comments` - Add task comment

### Frontend Pages

#### Teams Page (`/teams`)
- Team creation dialog
- Team overview cards with statistics
- Member management with avatars
- Search and filtering capabilities
- Real-time updates

#### Tasks Page (`/tasks`)
- Comprehensive task creation form
- Task cards with visual indicators
- Advanced filtering (status, priority, search)
- Assignment and time tracking
- Overdue task notifications

## 🧪 Testing the Features

### 1. Create a Team
1. Navigate to `/teams`
2. Click "Create Team"
3. Fill in team details
4. Verify team appears in the list

### 2. Create a Task
1. Navigate to `/tasks`
2. Click "Create Task"
3. Fill in task details (title, description, priority, etc.)
4. Verify task appears in the list

### 3. Test Real-Time Features
1. Open the application in two different browser windows
2. Create a team or task in one window
3. Verify the update appears in real-time in the other window

### 4. Test Task Assignment
1. Create a task
2. Assign it to a user
3. Verify the assignment appears in the task card
4. Test status changes and due date updates

## 🐛 Troubleshooting

### Database Issues

**Problem:** `npm run db:push` fails
```bash
# Solution: Clean the database and try again
rm -f dev.db
npm run db:push
```

**Problem:** Migration conflicts
```bash
# Solution: Reset the database
npx prisma db push --force-reset
npm run db:seed  # If you have seed data
```

### Development Server Issues

**Problem:** Socket.IO connection fails
```bash
# Solution: Ensure the server is running and check environment variables
npm run dev
# Check browser console for connection errors
```

**Problem:** API endpoints return 404
```bash
# Solution: Restart the development server
# Sometimes Next.js needs to detect new API routes
```

### Build Issues

**Problem:** TypeScript errors
```bash
# Solution: Check types and run linting
npm run lint
npm run build
```

## 📝 Development Notes

### Code Structure

```
src/
├── app/
│   ├── api/
│   │   ├── teams/          # Team management API
│   │   ├── tasks/          # Task management API
│   │   └── mail/           # Enhanced mail API
│   ├── teams/              # Teams page
│   └── tasks/              # Tasks page
├── components/
│   ├── mail/               # Mail components
│   └── oxlas/              # Main navigation components
├── hooks/
│   ├── use-mail.ts         # Mail functionality hook
│   ├── use-real-time-mail.ts # Real-time mail hook
│   └── use-socket-realtime.ts # Socket.IO hook
└── lib/
    ├── socket.ts           # Enhanced Socket.IO setup
    └── db.ts              # Database client
```

### Key Dependencies

- **@prisma/client**: Database ORM
- **socket.io**: Real-time communication
- **socket.io-client**: Client-side Socket.IO
- **next-auth**: Authentication
- **shadcn/ui**: UI components
- **lucide-react**: Icons
- **tailwindcss**: Styling

### Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:seed      # Seed database with test data

# Type checking
npx tsc --noEmit     # Type check without emitting files
```

## 🎯 Next Steps

After setting up the development environment:

1. **Explore the Features**: Navigate through `/teams` and `/tasks` pages
2. **Test Real-Time Updates**: Open multiple browser windows to test live updates
3. **Review the Code**: Examine the implementation patterns and structure
4. **Extend the Features**: Add new features or enhance existing ones
5. **Contribute**: Follow the contribution guidelines in the main README

## 📞 Support

If you encounter any issues during setup:

1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all dependencies are properly installed
4. Verify environment variables are correctly set
5. Check the GitHub issues for similar problems

For additional help, create an issue on the GitHub repository with detailed information about your setup and the problem you're experiencing.

---

**Happy Coding! 🚀**

This Team Collaboration & Task Management system is now ready for development and can be extended with additional features as needed.