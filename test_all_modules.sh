#!/bin/bash

echo "Testing all modules accessibility..."
echo "=================================="

# Test main page
echo "1. Testing main page..."
curl -s -o /dev/null -w "Main page: %{http_code}\n" http://localhost:3000

# Test all module pages
modules=(
  "inbox"
  "projects" 
  "drive"
  "docs"
  "team"
  "meet"
  "brain"
  "ai"
  "notes"
  "calendar"
  "care"
  "flow"
  "wiki"
  "chat"
  "forms"
  "dashboard"
)

for module in "${modules[@]}"; do
    echo "Testing /$module..."
    curl -s -o /dev/null -w "$module: %{http_code}\n" http://localhost:3000/$module
done

# Test API endpoints
echo ""
echo "Testing API endpoints..."
echo "========================"

apis=(
  "api/health"
  "api/projects"
  "api/notes"
  "api/ai"
  "api/search"
)

for api in "${apis[@]}"; do
    echo "Testing /$api..."
    curl -s -o /dev/null -w "$api: %{http_code}\n" http://localhost:3000/$api
done

echo ""
echo "All modules test completed!"