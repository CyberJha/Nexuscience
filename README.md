# NEXUSCIENCE 🔬⚡

> An intelligent, autonomous tool-using AI assistant powered by a ReAct (Reasoning + Acting) agent architecture, high-speed Groq language models, mathematical calculation, Wikipedia knowledge retrieval, and live Tavily web intelligence — crafted in the signature **Mistral AI** design system (warm cream surfaces, editorial serif typography, sunset gradients, and signature horizontal sunset stripe bar).

Developed as a modern full-stack transition of the original LangChain research notebook (`Ai (1).ipynb`), production-engineered for local development and seamless zero-configuration **Vercel** serverless deployment. Features client-managed API key and model selection controls with browser persistence.

---

## 🌟 Overview & Key Capabilities

NEXUSCIENCE solves the classic limitations of frozen language models (hallucinations, math inaccuracy, outdated knowledge) by empowering the model with a **ReAct reasoning loop** and access to three specialized tools:

1. 🔢 **Mathematical Calculator**: High-precision evaluation of arithmetic and mathematical expressions (e.g. `56 - 10`, `math.sqrt(144)`, `15 * 4 / 2`, trigonometric/logarithmic functions). Safe tokenized parsing ensures zero risk of arbitrary code execution.
2. 📚 **Wikipedia Knowledge Retrieval**: Live integration with MediaWiki REST APIs (`top_k_results=2`, `doc_content_chars_max=4000`) for factual summaries on people, historical events, scientific theories, and academic concepts.
3. 🌐 **Tavily Live Web Search**: Real-time web discovery (`max_results=3`) yielding up-to-date news, current events, and live web citations.
4. 🧠 **Stateless Serverless Conversational Memory**: Full preservation of multi-turn conversational context (`ConversationBufferMemory`) adapted for serverless runtimes. Resolves references and pronouns (e.g., *"Who is Albert Einstein?"* → *"When was he born?"*).
5. ⚡ **Groq Ultra-Fast Inference**: Defaults to `openai/gpt-oss-120b` (with zero temperature) or configurable fallback to `llama-3.3-70b-versatile`.
6. 📡 **Server-Sent Events (SSE) Progressive Streaming**: Real-time visual feedback for agent states (`Thinking...`, `Using Calculator`, `Searching Wikipedia`, `Searching the web`, `Synthesizing answer`) and dynamic inline tool execution cards.

---

## 🏗️ Architecture & Execution Pipeline

```text
                             USER QUERY
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │ Next.js App Router UI │
                     └───────────┬───────────┘
                                 │ POST /api/chat (SSE Stream)
                                 ▼
                     ┌───────────────────────┐
                     │ ReAct Agent Loop      │
                     │  (Max 6 Iterations)   │
                     └───────────┬───────────┘
                                 │
                   ┌─────────────┼─────────────┐
                   ▼             ▼             ▼
             ┌───────────┐ ┌───────────┐ ┌───────────┐
             │Calculator │ │ Wikipedia │ │Web Search │
             │Tool (Math)│ │(MediaWiki)│ │ (Tavily)  │
             └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
                   │             │             │
                   └─────────────┼─────────────┘
                                 ▼
                          Tool Observation
                                 │
                                 ▼
                          Groq LLM Engine
                      (openai/gpt-oss-120b)
                                 │
                                 ▼
                      Synthesized Final Answer
```

### The ReAct (Reasoning + Acting) Cycle

The agent strictly follows the structured ReAct format:
- **Thought**: The model plans what step or tool is required.
- **Action**: The model selects exactly one tool name: `[calculator, wikipedia_search, web_search]`.
- **Action Input**: The input parameter passed to the tool.
- **Observation**: The output returned by the executed tool.
- *(Repeats until sufficient data is collected, capped at 6 iterations)*
- **Final Answer**: Comprehensive Markdown synthesis delivered to the user.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling & Aesthetics** | Tailwind CSS v4, Lucide Icons, Custom Glassmorphism |
| **Animation** | Framer Motion (restrained, GPU-friendly transitions) |
| **Markdown Rendering** | `react-markdown`, `remark-gfm` with custom styled code copy blocks |
| **Backend & API** | Next.js Route Handlers (`ReadableStream`, Server-Sent Events) |
| **LLM Provider** | Groq API (`openai/gpt-oss-120b`, `llama-3.3-70b-versatile`) |
| **Tools** | Safe Math Parser, Wikipedia API, Tavily Search API |
| **Deployment Target** | Vercel Serverless / Node.js Runtime |

---

## 📁 Repository Structure

```text
nexuscience/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts         # SSE streaming route for agent execution
│   ├── globals.css              # Dark theme styling, glassmorphism, markdown
│   ├── layout.tsx               # Root layout, fonts & SEO metadata
│   └── page.tsx                 # Application entry point
├── components/
│   ├── architecture/
│   │   └── ArchitectureModal.tsx # Interactive visual architecture diagram & tabs
│   ├── chat/
│   │   ├── ChatComposer.tsx     # Multiline auto-resizing input with stop/send
│   │   ├── ChatInterface.tsx    # State management & SSE orchestrator
│   │   ├── EmptyState.tsx       # Welcoming hero & interactive prompt starters
│   │   ├── MarkdownRenderer.tsx # High-contrast markdown, tables, & code blocks
│   │   └── MessageItem.tsx      # User/Assistant cards with tool indicators
│   ├── tools/
│   │   ├── AgentStatusIndicator.tsx # Pulsing real-time reasoning pill
│   │   └── ToolActivityCard.tsx # Inline expandable tool execution indicators
│   └── ui/
│       ├── Header.tsx           # Brand header with Architecture & New Chat
│       └── SystemInfoModal.tsx  # Product specs and academic project notes
├── lib/
│   ├── agent/
│   │   ├── memory.ts            # ConversationBufferMemory adapter
│   │   ├── prompts.ts           # Exact ReAct prompt template builder
│   │   └── reactAgent.ts        # Core ReAct loop engine & Groq client
│   ├── tools/
│   │   ├── calculator.ts        # Safe Python math evaluator
│   │   ├── index.ts             # Tool registry and prompt formatting
│   │   ├── tavily.ts            # Tavily live web search tool
│   │   └── wikipedia.ts         # Wikipedia MediaWiki search tool
│   └── types/
│       └── index.ts             # TypeScript definitions
├── .env.example                 # Environment variables template
├── package.json
└── README.md
```

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+ / v22+
- **npm** or **pnpm** / **yarn**

### 2. Clone and Install
```bash
git clone https://github.com/your-username/nexuscience.git
cd nexuscience
npm install
```

### 3. Configure Environment Variables
Create a local `.env.local` file by copying `.env.example`:
```bash
cp .env.example .env.local
```

Open `.env.local` and insert your API keys:
```env
# Required: Groq API Key (Get free key at https://console.groq.com)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Required for Web Search: Tavily API Key (Get free key at https://app.tavily.com)
TAVILY_API_KEY=tvly-your_tavily_api_key_here

# Optional: Override default Groq model (defaults to openai/gpt-oss-120b)
GROQ_MODEL=openai/gpt-oss-120b
```

> **Security Note:** Secrets are strictly handled server-side in API routes and are **never** exposed to client-side bundles or browser DevTools.

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Vercel

NEXUSCIENCE is designed from the ground up for 1-click **Vercel** serverless deployment:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete NEXUSCIENCE production web agent"
   git push origin main
   ```
2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   - Select your `nexuscience` repository.
3. **Configure Environment Variables in Vercel**:
   In the Vercel project configuration, add:
   - `GROQ_API_KEY` = your Groq API key
   - `TAVILY_API_KEY` = your Tavily API key
4. **Deploy**:
   - Click **Deploy**. Vercel will build the Next.js production bundle.
5. **Verify**:
   - Test calculations, Wikipedia searches, web queries, and multi-turn conversational follow-ups.

---

## 🧪 Acceptance Tests & Examples

| Query | Expected Tool | Expected Behavior |
| :--- | :--- | :--- |
| **"What is 56 - 10?"** | `calculator` | Evaluates math safely → `Result: 46` → Final answer `46`. |
| **"Calculate math.sqrt(144) + 15 * 4 / 2"** | `calculator` | Evaluates functions and operator precedence → Result `42`. |
| **"Tell me about Daniel Radcliffe using Wikipedia."** | `wikipedia_search` | Queries MediaWiki API → Extracts career & bio → Synthesizes response with facts. |
| **"Search the web for the latest developments in AI."** | `web_search` | Calls Tavily live search → Synthesizes recent 2024–2026 releases and citations. |
| **"Who is Albert Einstein?"** followed by **"When was he born?"** | Conversational Buffer Memory | Recognizes "he" refers to Albert Einstein from prior turn history. |

---

## 🎓 Academic Presentation Summary

When presenting to evaluators, professors, or peers:
- **Core Concept**: NEXUSCIENCE implements an **Agentic AI pattern** (ReAct: Synergizing Reasoning and Acting in Language Models, Yao et al., 2022).
- **Tool Selection Mechanism**: The Groq LLM evaluates the prompt schema, decides whether mathematical calculation, encyclopedic lookup, or live web search is needed, and outputs an `Action:` directive.
- **Serverless Resilience**: Replaces fragile in-memory server stores with client-assisted conversational buffer memory, making it 100% resilient across stateless cloud edge workers.
- **Safety**: Calculator uses a sandboxed recursive-descent math parser rather than unrestricted Python `eval()`.

---

## 📄 License
MIT License. Built for research, academic evaluation, and AI agent demonstration.
