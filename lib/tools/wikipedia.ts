/**
 * Wikipedia Search Tool
 * Mirrors LangChain WikipediaAPIWrapper:
 * - top_k_results = 2
 * - doc_content_chars_max = 4000
 * Exact output format matching the notebook.
 */

export async function executeWikipediaSearch(
  topic: string,
  topK: number = 2,
  maxChars: number = 4000
): Promise<string> {
  const cleanedTopic = topic.trim().replace(/^['"]+|['"]+$/g, '');
  if (!cleanedTopic) {
    return '[TOOL USED: wikipedia_search]\nWikipedia search error: Empty search topic provided.';
  }

  try {
    // Step 1: Search Wikipedia for top pages
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      cleanedTopic
    )}&utf8=&format=json&srlimit=${topK}`;

    const searchRes = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'NexuscienceAI/1.0 (academic research project; contact@nexuscience.edu)',
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!searchRes.ok) {
      return `[TOOL USED: wikipedia_search]\nWikipedia search error: HTTP ${searchRes.status} ${searchRes.statusText}`;
    }

    const searchData = await searchRes.json();
    const searchResults: Array<{ title: string; pageid: number }> =
      searchData?.query?.search || [];

    if (searchResults.length === 0) {
      return `[TOOL USED: wikipedia_search]\nNo good Wikipedia Search Result was found for: "${cleanedTopic}"`;
    }

    // Step 2: Fetch detailed page summaries for the top results
    const pageOutputs: string[] = [];

    for (const item of searchResults.slice(0, topK)) {
      try {
        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          item.title
        )}`;
        const summaryRes = await fetch(summaryUrl, {
          headers: {
            'User-Agent': 'NexuscienceAI/1.0 (academic research project)',
            Accept: 'application/json',
          },
        });

        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          const extract = summaryData.extract || '';
          pageOutputs.push(`Page: ${item.title}\nSummary: ${extract}`);
        } else {
          // Fallback to text extract from query API
          const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=&explaintext=&titles=${encodeURIComponent(
            item.title
          )}&format=json`;
          const extractRes = await fetch(extractUrl, {
            headers: {
              'User-Agent': 'NexuscienceAI/1.0 (academic research project)',
              Accept: 'application/json',
            },
          });
          if (extractRes.ok) {
            const extractData = await extractRes.json();
            const pages = extractData?.query?.pages || {};
            const page = Object.values(pages)[0] as { extract?: string } | undefined;
            const extract = page?.extract || 'No extract available.';
            pageOutputs.push(`Page: ${item.title}\nSummary: ${extract}`);
          }
        }
      } catch (err: unknown) {
        pageOutputs.push(`Page: ${item.title}\nSummary: (Summary retrieval failed: ${String(err)})`);
      }
    }

    let combined = pageOutputs.join('\n\n');
    if (combined.length > maxChars) {
      combined = combined.slice(0, maxChars) + '... [truncated]';
    }

    return `[TOOL USED: wikipedia_search]\n${combined}`;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return `[TOOL USED: wikipedia_search]\nWikipedia search error: ${msg}`;
  }
}
