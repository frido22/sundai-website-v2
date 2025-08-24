#!/bin/bash

echo "🚀 Setting up Sundai Website for local testing..."

# Start PostgreSQL with Docker
echo "📦 Starting PostgreSQL database..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "⚙️  Generating Prisma client..."
npx prisma generate

# Seed the database with test data
echo "🌱 Seeding database with test data..."
npm run seed

echo "✅ Setup complete!"
echo ""
echo "🎯 To test the voting system:"
echo "1. Run: npm run dev"
echo "2. Visit: http://localhost:3000"
echo "3. Sign up/in with Clerk (or use test data)"
echo "4. Go to any project and test the upvote/downvote buttons!"
echo ""
echo "📁 Database is running at: localhost:5432"
echo "🔍 To view database: npx prisma studio"