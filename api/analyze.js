// API: LLM analysis engine using Claude Haiku
// Three analysis modes: themes, northstar, roadmap

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: 'LLM not configured' });

  const { mode, posts, authorName, linkedinText, chosenDirection } = req.body;

  if (!mode || !posts) {
    return res.status(400).json({ error: 'mode and posts are required' });
  }

  try {
    let systemPrompt, userPrompt;

    if (mode === 'themes') {
      systemPrompt = SCRIBE_SYSTEM_PROMPT;
      userPrompt = buildThemePrompt(posts, authorName, linkedinText);
    } else if (mode === 'northstar') {
      systemPrompt = SCRIBE_SYSTEM_PROMPT;
      userPrompt = buildNorthStarPrompt(posts, authorName, linkedinText);
    } else if (mode === 'roadmap') {
      systemPrompt = SCRIBE_SYSTEM_PROMPT;
      userPrompt = buildRoadmapPrompt(posts, authorName, chosenDirection);
    } else {
      return res.status(400).json({ error: 'Invalid mode. Use: themes, northstar, or roadmap' });
    }

    const result = await callClaude(ANTHROPIC_KEY, systemPrompt, userPrompt);
    return res.status(200).json({ result });

  } catch (err) {
    console.error('Analyze error:', err);
    return res.status(500).json({
      error: 'Analysis failed. We\'re experiencing high demand — please try again in a moment.'
    });
  }
};

async function callClaude(apiKey, systemPrompt, userPrompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt + '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no explanation — just the JSON object.'
        }
      ]
    }),
    signal: AbortSignal.timeout(90000)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error: ${response.status} — ${errText}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error('Empty response from Claude');

  // Clean response — strip markdown code fences if present
  const cleaned = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

// ────────────────────────────────────────────
// SCRIBE METHOD SYSTEM PROMPT
// ────────────────────────────────────────────

const SCRIBE_SYSTEM_PROMPT = `You are a Scribe Media Book Coach applying the Scribe Method — the proven 9-phase book writing framework developed by Tucker Max and Zach Obront, used to publish 2,000+ nonfiction books.

YOUR ROLE: Analyze an author's existing newsletter/blog content and generate professional book positioning using the Scribe Method framework.

THE SCRIBE METHOD — KEY CONCEPTS:

1. THE NORTH STAR (Phase 2: Positioning)
Every book needs a North Star — the alignment of three elements:
- BOOK OBJECTIVE: What will this book accomplish for the author? (establish authority, generate leads, share a mission, create a legacy)
- TARGET READER: WHO specifically is this book for? Not "everyone" — a specific person with a specific need. Describe them by role, situation, and pain point.
- AUTHOR POSITIONING: Why is THIS author the one to write this book? What unique experience, expertise, or perspective makes them credible?

The North Star Check: These three elements must align. The target reader must care about the objective, and the author must be credible to that reader.

2. THE BOOK ROADMAP (Phase 3: Outlining)
A chapter-by-chapter outline that maps the book's structure BEFORE writing begins. Each chapter should:
- Serve a clear purpose in the overall argument
- Build on previous chapters
- Include stories, frameworks, and actionable insights
- Map to the author's existing content where possible

3. ANTI-SLOP RULES:
- NEVER use generic book-writing advice. Every recommendation MUST reference specific posts by title.
- NEVER invent quotes, credentials, or facts not present in the provided content.
- NEVER use filler phrases like "in today's world" or "it's important to note."
- Write like a seasoned Book Coach speaking to a promising author — warm, specific, direct.
- If you can't determine something with confidence, say so. Never guess.

Always respond in valid JSON matching the requested format.`;

// ────────────────────────────────────────────
// PROMPT BUILDERS
// ────────────────────────────────────────────

function buildThemePrompt(posts, authorName, linkedinText) {
  const postSummaries = posts.map(p =>
    `POST: "${p.title}" (${p.date})\n${p.preview}`
  ).join('\n\n---\n\n');

  return `AUTHOR: ${authorName || 'Unknown'}
${linkedinText ? `LINKEDIN CONTEXT: ${linkedinText}` : ''}

CONTENT TO ANALYZE (${posts.length} posts):

${postSummaries}

TASK: Identify the core themes, unique perspectives, and book potential in this author's writing.

Respond in JSON format:
{
  "themes": [
    {
      "name": "Theme name",
      "description": "One sentence describing this theme",
      "postTitles": ["Post 1", "Post 2"],
      "strength": "strong|moderate|emerging"
    }
  ],
  "authorVoice": "2-3 sentences describing the author's distinctive writing voice and perspective, referencing specific posts",
  "uniqueAngles": ["Angle 1 with post reference", "Angle 2 with post reference"],
  "audienceSignals": "Who this author seems to be writing for, based on content evidence",
  "bookPotential": "1-10 score with explanation referencing specific content"
}`;
}

function buildNorthStarPrompt(posts, authorName, linkedinText) {
  const postSummaries = posts.map(p =>
    `POST: "${p.title}" (${p.date})\n${p.preview}`
  ).join('\n\n---\n\n');

  return `AUTHOR: ${authorName || 'Unknown'}
${linkedinText ? `LINKEDIN CONTEXT: ${linkedinText}` : ''}

CONTENT (${posts.length} posts):

${postSummaries}

TASK: Generate 2-3 potential book directions using the Scribe Method North Star framework. Each direction must be grounded in the author's actual content — reference specific posts.

Respond in JSON format:
{
  "directions": [
    {
      "id": 1,
      "bookTitle": "Proposed book title",
      "subtitle": "Proposed subtitle",
      "bookObjective": "What this book accomplishes for the author (1-2 sentences)",
      "targetReader": "Specific person — role, situation, pain point (2-3 sentences)",
      "authorPositioning": "Why this author is the one to write this (2-3 sentences, referencing specific posts/expertise)",
      "northStarStatement": "One compelling sentence that captures the book's essence",
      "keyPosts": ["Post titles that map to this direction"],
      "contentCoverage": "Percentage of this book that already exists in their content, with explanation"
    }
  ],
  "recommendation": "Which direction is strongest and why (2-3 sentences referencing specific content)"
}`;
}

function buildRoadmapPrompt(posts, authorName, chosenDirection) {
  // For roadmap, use fuller post content (top 10 most relevant)
  const postContent = posts.slice(0, 15).map(p =>
    `POST: "${p.title}" (${p.date})\n${p.fullText || p.preview}`
  ).join('\n\n---\n\n');

  return `AUTHOR: ${authorName || 'Unknown'}

CHOSEN NORTH STAR DIRECTION:
Title: ${chosenDirection.bookTitle}
Subtitle: ${chosenDirection.subtitle}
Objective: ${chosenDirection.bookObjective}
Target Reader: ${chosenDirection.targetReader}
Author Positioning: ${chosenDirection.authorPositioning}

AUTHOR'S CONTENT (${posts.length} posts):

${postContent}

TASK: Generate a detailed Chapter Roadmap using the Scribe Method. Map existing content to chapters, identify what's new, and score the book's readiness.

Respond in JSON format:
{
  "proposedTitles": [
    { "title": "Title option", "subtitle": "Subtitle option" }
  ],
  "chapters": [
    {
      "number": 1,
      "title": "Chapter title",
      "summary": "What this chapter covers and its purpose in the book's argument (2-3 sentences)",
      "existingPosts": ["Post titles that map to this chapter"],
      "newContentNeeded": "What additional content the author would need to create (1-2 sentences)",
      "hasExistingContent": true
    }
  ],
  "introduction": {
    "hook": "Proposed opening hook for the book (2-3 sentences, drawing from the author's best content)",
    "premise": "The book's core argument in one sentence"
  },
  "scribeScore": {
    "contentDepth": { "score": 7, "explanation": "Explanation citing specific posts" },
    "audienceClarity": { "score": 7, "explanation": "Explanation citing specific evidence" },
    "uniquePerspective": { "score": 7, "explanation": "Explanation citing specific posts" },
    "bookReadiness": { "score": 7, "explanation": "Overall assessment" }
  },
  "contentCoveragePercent": 65,
  "coachNote": "A warm, specific note from a Scribe Book Coach to this author about what excites you about their book potential. Reference their specific content. 3-4 sentences. This should feel personal, not generic."
}`;
}
