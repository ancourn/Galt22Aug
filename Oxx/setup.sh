#!/bin/bash
# setup.sh - Oxlas Phase 2 Setup
echo "🚀 Setting up Oxlas Phase 2..."

# Create directories
echo "📁 Creating directories..."
mkdir -p \
  db \
  ssl \
  data \
  sessions \
  uploads \
  volumes/postgres_data \
  volumes/redis_data \
  volumes/nextcloud_data \
  volumes/onlyoffice_data \
  volumes/planka_data \
  volumes/jitsi_data

# Create .env if not exists
if [ ! -f .env ]; then
  echo "🔐 Generating .env..."
  cat > .env << 'EOL'
POSTGRES_PASSWORD=$(openssl rand -hex 16)
APP_CRYPTO_KEY=$(openssl rand -base64 32)
APP_JWT_SECRET=$(openssl rand -base64 32)
MEILISEARCH_MASTER_KEY=$(openssl rand -base64 32)
EOL
  echo "✅ .env generated"
else
  echo "✅ .env already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Oxlas Phase 2 setup complete!"
echo "👉 Run: npm run dev"