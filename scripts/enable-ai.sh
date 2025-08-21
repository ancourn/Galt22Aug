#!/bin/bash

# Oxx AI-Powered Workspace - Real AI Enablement Script
# This script enables real AI integration using Ollama/Llama3

set -e  # Exit on any error

echo "🚀 Enabling Real AI Integration for Oxx Workspace..."
echo "=================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the correct directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    print_error "Please run this script from the Oxx project root directory"
    exit 1
fi

# Stop mock service (if running)
print_status "🛑 Stopping mock AI service..."
pkill -f "ai-mock" 2>/dev/null || true
print_success "Mock AI service stopped"

# Check if Ollama is available
print_status "🔍 Checking Ollama availability..."
if ! command -v ollama &> /dev/null; then
    print_warning "Ollama not found locally. Checking Docker..."
    
    # Try to start Ollama via Docker
    if docker ps --format 'table {{.Names}}' | grep -q "ollama"; then
        print_success "Ollama Docker container found"
    else
        print_warning "Ollama container not found. Attempting to start..."
        if docker run -d --name ollama -p 11434:11434 ollama/ollama 2>/dev/null; then
            print_success "Ollama container started successfully"
            sleep 5  # Give it time to start
        else
            print_error "Failed to start Ollama container. Please ensure Docker is running and try again."
            print_error "You can also install Ollama locally: https://ollama.ai/"
            exit 1
        fi
    fi
else
    print_success "Ollama found locally"
fi

# Test Ollama connection
print_status "🔗 Testing Ollama connection..."
if curl -s http://localhost:11434/api/tags > /dev/null; then
    print_success "Ollama is running and accessible"
else
    print_error "Ollama is not accessible at http://localhost:11434"
    print_error "Please ensure Ollama is running and try again"
    exit 1
fi

# Pull Llama3 model
print_status "📥 Pulling Llama3 model (this may take a few minutes)..."
if curl -X POST http://localhost:11434/api/pull -d '{"name": "llama3"}' -s; then
    print_success "Llama3 model pulled successfully"
else
    print_error "Failed to pull Llama3 model"
    exit 1
fi

# Verify model was pulled
print_status "🔍 Verifying Llama3 model..."
if curl -s http://localhost:11434/api/tags | grep -q "llama3"; then
    print_success "Llama3 model is available"
else
    print_error "Llama3 model not found after pull"
    exit 1
fi

# Switch AI implementation
print_status "🔁 Switching to real AI implementation..."

# Check if ai.ts exists
if [ ! -f "src/lib/ai.ts" ]; then
    print_error "AI service file not found: src/lib/ai.ts"
    exit 1
fi

# Backup original file
cp src/lib/ai.ts src/lib/ai.ts.backup

# Switch from mock to real AI
if sed -i 's/ai-mock/ai-real/g' src/lib/ai.ts; then
    print_success "AI implementation switched to real AI"
else
    print_error "Failed to switch AI implementation"
    # Restore backup
    mv src/lib/ai.ts.backup src/lib/ai.ts
    exit 1
fi

# Verify the change
print_status "🔍 Verifying AI implementation change..."
if grep -q "ai-real" src/lib/ai.ts; then
    print_success "Real AI implementation confirmed"
else
    print_error "AI implementation switch verification failed"
    # Restore backup
    mv src/lib/ai.ts.backup src/lib/ai.ts
    exit 1
fi

# Test the real AI service
print_status "🧪 Testing real AI service..."
if curl -X POST http://localhost:3000/api/ai \
    -H "Content-Type: application/json" \
    -d '{"prompt":"Hello, AI! Please respond with a short greeting."}' \
    -s | grep -q "response"; then
    print_success "Real AI service is working!"
else
    print_warning "Real AI service test failed. The application may need to be restarted."
fi

# Create environment variables if needed
print_status "⚙️  Checking environment configuration..."
if [ ! -f ".env" ]; then
    print_warning "No .env file found. Creating one with default values..."
    cat > .env << EOF
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# AI Services
AI_SERVICE_URL="http://localhost:11434"
AI_MODEL="llama3"
EOF
    print_success "Environment file created"
else
    # Add AI variables if not present
    if ! grep -q "AI_SERVICE_URL" .env; then
        echo "" >> .env
        echo "# AI Services" >> .env
        echo "AI_SERVICE_URL=\"http://localhost:11434\"" >> .env
        echo "AI_MODEL=\"llama3\"" >> .env
        print_success "AI configuration added to .env file"
    fi
fi

# Restart the development server if it's running
print_status "🔄 Checking if development server needs restart..."
if pgrep -f "tsx server.ts" > /dev/null; then
    print_warning "Development server is running. You may need to restart it:"
    echo "   pkill -f 'tsx server.ts'"
    echo "   npm run dev"
    print_warning "Or simply press 'rs' in the nodemon terminal"
fi

# Summary
echo ""
echo "🎉 AI Integration Complete!"
echo "============================"
print_success "✅ Ollama is running and accessible"
print_success "✅ Llama3 model is downloaded and ready"
print_success "✅ AI implementation switched to real AI"
print_success "✅ Environment configuration updated"
echo ""
echo "🚀 Next Steps:"
echo "1. Visit your application: http://localhost:3000"
echo "2. Click any 'Ask AI' button in the dashboard"
echo "3. Try asking the AI questions like:"
echo "   - 'What is the status of my projects?'"
echo "   - 'Summarize my recent activities'"
echo "   - 'What should I work on next?'"
echo ""
echo "🔧 If you encounter any issues:"
echo "- Check that Ollama is running: curl http://localhost:11434/api/tags"
echo "- Restart the development server if needed"
echo "- Check the browser console for errors"
echo ""
echo "📚 To revert to mock AI:"
echo "   cp src/lib/ai.ts.backup src/lib/ai.ts"
echo ""
echo "🌟 Enjoy your AI-powered workspace!"