import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NEXUSCIENCE — Frontier Tool-Using AI Agent',
  description:
    'An intelligent tool-using AI assistant powered by a ReAct agent, capable of mathematical reasoning, Wikipedia knowledge retrieval, and live Tavily web search.',
  keywords: ['Mistral AI', 'AI Agent', 'ReAct', 'Groq', 'LangChain', 'Tavily', 'Wikipedia', 'Calculator'],
  authors: [{ name: 'NEXUSCIENCE Team' }],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/logo.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#ffffff] text-[#1f1f1f] antialiased selection:bg-[#ffd06a] selection:text-[#1f1f1f]">
        {children}
      </body>
    </html>
  );
}
