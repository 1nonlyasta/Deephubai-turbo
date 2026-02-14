import dotenv from 'dotenv';
dotenv.config();

export async function performSearch(query: string): Promise<string> {
    const apiKey = process.env.SERPER_API_KEY;

    if (!apiKey) {
        console.warn('Serper API Key missing. Skipping search.');
        return '';
    }

    try {
        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: query,
                num: 3 // Top 3 results 
            })
        });

        if (!response.ok) {
            throw new Error(`Serper API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const snippets = data.organic?.map((r: any) => `${r.title}: ${r.snippet}`).join('\n');
        
        return snippets ? `Real-Time Search Results:\n${snippets}` : '';

    } catch (error) {
        console.error('Search extraction failed:', error);
        return ''; // Graceful fail
    }
}
