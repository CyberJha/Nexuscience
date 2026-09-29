/**
 * Tavily Web Search Tool
 * Mirrors LangChain TavilySearchResults(max_results=3)
 * Returns structured search results with title, url, content, score.
 */

export interface TavilyResultItem {
  title: string;
  url: string;
  content: string;
  score: number;
}

export async function executeWebSearch(
  query: string,
  maxResults: number = 3,
  apiKeyOverride?: string
): Promise<string> {
  const apiKey = (apiKeyOverride && apiKeyOverride.trim() !== '') 
    ? apiKeyOverride.trim() 
    : process.env.TAVILY_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return '[TOOL USED: web_search]\nWeb search failed: TAVILY_API_KEY is not configured. Please input your Tavily API key in the Model & API Settings modal to enable live web search.';
  }

  const cleanedQuery = query.trim().replace(/^['"]+|['"]+$/g, '');
  if (!cleanedQuery) {
    return '[TOOL USED: web_search]\nWeb search failed: Empty search query provided.';
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: cleanedQuery,
        max_results: maxResults,
        search_depth: 'basic',
        include_answer: false,
        include_raw_content: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let errorDetail = `HTTP ${response.status}`;
      try {
        const errJson = JSON.parse(errText);
        errorDetail = errJson.detail?.error || errJson.message || errorDetail;
      } catch {
        // use fallback
      }
      return `[TOOL USED: web_search]\nWeb search failed: ${errorDetail}`;
    }

    const data = await response.json();
    const results: TavilyResultItem[] = (data.results || []).map((r: {
      title?: string;
      url?: string;
      content?: string;
      score?: number;
    }) => ({
      title: r.title || 'Untitled',
      url: r.url || '',
      content: r.content || '',
      score: r.score ?? 0.9,
    }));

    if (results.length === 0) {
      return `[TOOL USED: web_search]\nNo web results found for: "${cleanedQuery}"`;
    }

    // Format output matching LangChain TavilySearchResults string representation
    const formatted = JSON.stringify(results, null, 2);
    return `[TOOL USED: web_search]\n\n${formatted}`;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return `[TOOL USED: web_search]\nWeb search failed: ${msg}`;
  }
}
