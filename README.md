# Galt AI Workspace – Full-Stack Productivity Suite
> **A fully integrated, AI-powered workspace with 12+ modules for modern teams.**
This project brings together email, docs, projects, AI assistant, knowledge graph, automation, and real-time collaboration into a single, unified interface.
Built on Next.js, Prisma, and Ollama — ready for AI-first development.
---
## 🌟 Features
- 📥 **Inbox** – Email management with search & filtering
- 🗂️ **Projects** – Project tracking (iframe or native)
- 💾 **Drive** – File storage & management
- 📄 **Docs** – Collaborative editing (OnlyOffice)
- 👥 **Team** – Team member dashboard
- 🎥 **Meet** – Video conferencing
- 🧠 **Brain** – AI-powered knowledge graph
- 🤖 **AI** – LLM assistant (Ollama-ready)
- ⚡ **Flow** – No-code automation
- 📅 **Calendar** – Scheduling
- ❤️ **Care** – Support system
- 📝 **Notes** – Smart note-taking
- 💬 **Chat** – Real-time messaging (Socket.IO)
---
## 🛠️ Tech Stack
- **Frontend**: Next.js 15, React Server Components, Tailwind CSS
- **UI**: shadcn/ui + custom components
- **Auth**: NextAuth.js (Credentials + OAuth-ready)
- **Database**: Prisma ORM (SQLite dev, PostgreSQL production-ready)
- **AI**: Ollama + Llama3 (mock → real switch implemented)
- **Search**: Meilisearch (fallback in place)
- **Real-time**: Socket.IO
- **DevOps**: Docker-compose ready, scripts included
---
## 🚀 Getting Started
### 1. Clone the repo
```bash
git clone https://github.com/ancourn/Galt22Aug.git
cd Galt22Aug
```
### 2. Install dependencies
```bash
npm install
```
### 3. Set up environment
```bash
cp .env.example .env
```
> Update `.env` with your database, Ollama, and Meilisearch settings.
### 4. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)
### 5. (Optional) View database
```bash
npx prisma studio
```
---
## 📦 Project Structure
```
src/
├── app/
│   ├── ai/       - AI assistant
│   ├── brain/    - Knowledge graph
│   ├── flow/     - Automation engine
│   └── ...       - All modules restored
├── components/   - Shared UI
├── lib/
│   ├── ai.ts     - AI service (mock → real)
│   └── db.ts     - Prisma client
prisma/
├── schema.prisma - DB schema
scripts/
├── enable-ai.sh  - Enable real Ollama AI
├── switch-db.sh  - Switch SQLite ↔ PostgreSQL
```
---
## 📝 Development Notes
This project was built by integrating the **Oxx AI workspace** into a unified full-stack application.  
All modules were previously split — this version **restores full functionality** and prepares for AI and production deployment.
> **Next Phase**: Enable real AI (Ollama), add Google login, deploy to Vercel.
---
## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first.
---
## 📄 License
MIT