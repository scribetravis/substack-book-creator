// API: Fetch and parse a Substack RSS feed
// Returns structured post data for LLM analysis

const { XMLParser } = require('fast-xml-parser');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { substackUrl } = req.body;
  if (!substackUrl) return res.status(400).json({ error: 'substackUrl is required' });

  try {
    // Normalize the URL to get the RSS feed
    const feedUrl = normalizeFeedUrl(substackUrl);

    const response = await fetch(feedUrl, {
      headers: { 'User-Agent': 'ScribeMedia-BookCreator/1.0' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      return res.status(400).json({
        error: 'Could not reach that Substack. Please check the URL and try again.',
        details: `HTTP ${response.status}`
      });
    }

    const xml = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });
    const feed = parser.parse(xml);

    // Handle RSS 2.0 format (Substack uses this)
    const channel = feed.rss?.channel;
    if (!channel) {
      return res.status(400).json({ error: 'Invalid RSS feed format. Please provide a valid Substack URL.' });
    }

    const items = Array.isArray(channel.item) ? channel.item : channel.item ? [channel.item] : [];

    const posts = items.map((item, i) => {
      const content = item['content:encoded'] || item.description || '';
      const plainText = stripHtml(content);
      return {
        index: i,
        title: item.title || `Post ${i + 1}`,
        date: item.pubDate || '',
        link: item.link || '',
        wordCount: plainText.split(/\s+/).length,
        // First 500 words for theme analysis (Call 1)
        preview: plainText.split(/\s+/).slice(0, 500).join(' '),
        // Full text for deep analysis (Call 2/3) — capped at 3000 words per post
        fullText: plainText.split(/\s+/).slice(0, 3000).join(' ')
      };
    });

    const totalWords = posts.reduce((sum, p) => sum + p.wordCount, 0);

    return res.status(200).json({
      feedTitle: channel.title || 'Unknown',
      feedDescription: channel.description || '',
      feedAuthor: channel['itunes:author'] || channel.title || '',
      postCount: posts.length,
      totalWords,
      posts
    });

  } catch (err) {
    if (err.name === 'TimeoutError') {
      return res.status(504).json({ error: 'The Substack took too long to respond. Please try again.' });
    }
    console.error('RSS fetch error:', err);
    return res.status(500).json({ error: 'Something went wrong fetching the feed. Please try again.' });
  }
};

function normalizeFeedUrl(input) {
  let url = input.trim().replace(/\/+$/, '');

  // If it's already a feed URL
  if (url.endsWith('/feed') || url.endsWith('/feed/')) return url;

  // If it's a substack.com/@handle URL
  const handleMatch = url.match(/substack\.com\/@([\w-]+)/);
  if (handleMatch) {
    return `https://${handleMatch[1]}.substack.com/feed`;
  }

  // If it's a substack.com/home/post URL, extract the subdomain
  if (url.includes('substack.com')) {
    const subdomainMatch = url.match(/https?:\/\/([\w-]+)\.substack\.com/);
    if (subdomainMatch) return `https://${subdomainMatch[1]}.substack.com/feed`;
  }

  // If it's a custom domain or bare subdomain, append /feed
  if (!url.startsWith('http')) url = 'https://' + url;
  return url + '/feed';
}

function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
