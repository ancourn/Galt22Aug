#!/bin/bash

# Database switcher script for Oxx AI-Powered Workspace
# Usage: ./scripts/switch-db.sh [sqlite|postgresql]

set -e

DB_TYPE=${1:-sqlite}
ENV_FILE=".env"
SCHEMA_FILE="prisma/schema.prisma"

echo "🔄 Switching Oxx to use $DB_TYPE..."

case $DB_TYPE in
  "sqlite")
    echo "📝 Configuring for SQLite..."
    
    # Update .env file
    sed -i.bak 's|^DATABASE_URL=.*|DATABASE_URL="file:./dev.db"|' "$ENV_FILE"
    
    # Update Prisma schema
    sed -i.bak 's|provider = "postgresql"|provider = "sqlite"|' "$SCHEMA_FILE"
    
    echo "✅ SQLite configuration applied"
    echo "📊 Database file: ./dev.db"
    ;;
    
  "postgresql")
    echo "🐘 Configuring for PostgreSQL..."
    
    # Update .env file
    sed -i.bak 's|^DATABASE_URL=.*|DATABASE_URL="postgresql://oxlas:oxlas123@localhost:5432/oxlas"|' "$ENV_FILE"
    
    # Update Prisma schema
    sed -i.bak 's|provider = "sqlite"|provider = "postgresql"|' "$SCHEMA_FILE"
    
    echo "✅ PostgreSQL configuration applied"
    echo "🔗 Make sure PostgreSQL is running on localhost:5432"
    echo "💡 Use 'docker-compose up -d postgres' to start PostgreSQL"
    ;;
    
  *)
    echo "❌ Invalid database type: $DB_TYPE"
    echo "Usage: $0 [sqlite|postgresql]"
    exit 1
    ;;
esac

# Clean up backup files
rm -f "$ENV_FILE.bak" "$SCHEMA_FILE.bak"

echo "🔄 Running Prisma commands..."
npx prisma generate
npx prisma db push

echo "✅ Database switch complete!"
echo "🚀 Run 'npm run dev' to start the development server"