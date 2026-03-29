# 🚀 Nexus Intelligence: Advanced AI-Driven Threat Research Platform

Nexus Intelligence is a cutting-edge, full-stack application designed to automate the production of high-authority technical research and threat intelligence articles. By leveraging specialized AI agents, it bridges the gap between raw threat data and comprehensive, deep-dive technical journalism.

![Nexus Intelligence Banner](https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop)

## ✨ Features

- **🧠 Multi-Agent Orchestration**: Powered by **CrewAI**, utilizing a specialized "crew" of digital personas:
  - **Senior Threat Intelligence Analyst**: Identifies emerging 2026 digital risks.
  - **Cybersecurity Research Lead**: Crafts authoritative technical headlines.
  - **Principal Security Architect**: Designs granular procedural outlines and implementation paths.
  - **Technical Intelligence Journalist**: Produces 1500+ word, high-density research reports.
- **⚡ Real-time Intelligence**: Integrated with **Perplexity AI (Sonar model)** for up-to-the-minute technical data and threat vector analysis.
- **🎨 Modern Aesthetic**: A premium, responsive UI built with **Next.js 15**, **Tailwind CSS**, and **Framer Motion** for smooth, interactive experiences.
- **🔒 Enterprise-Grade Backend**: Built with **FastAPI**, featuring structured logging, rate limiting (SlowAPI), and robust Pydantic validation.
- **📊 Real-time Progress Tracking**: Watch the AI agents think, research, and write in real-time through an interactive dashboard.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **AI Integration**: [Google Genkit](https://firebase.google.com/docs/genkit)
- **Database/Auth**: [Firebase](https://firebase.google.com/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Agent Orchestration**: [CrewAI](https://www.crewai.com/)
- **LLM Integration**: [Perplexity AI](https://www.perplexity.ai/) via LiteLLM
- **Data Validation**: [Pydantic v2](https://docs.pydantic.dev/)
- **Caching/State**: Redis (Optional)
- **Logging**: Loguru

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Perplexity API Key
- Firebase Account

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file based on `.env.example` and add your `PERPLEXITY_API_KEY`.
5. Run the server:
   ```bash
   python main.py
   ```

### Frontend Setup
1. Navigate to the root directory:
   ```bash
   cd ..
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your Firebase and Environment variables in `.env.local`.
4. Run the development server:
   ```bash
   npm run dev
   ```

## 🤖 AI Workflow

The platform follows a sophisticated research pipeline:

1. **Vector Identification**: Analyzes current tech trends to find high-impact exploitation or defense vectors.
2. **Authority Headlines**: Generates professional titles that command attention in the security community.
3. **Internal Blueprinting**: The architect agent builds a procedural walkthrough of the technology.
4. **Content Osmosis**: The journalist agent expands the blueprint into a full-scale, technically dense whitepaper.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ by the Garvit Haswani.
