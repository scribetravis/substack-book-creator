// API: Capture lead data and send to HubSpot CRM

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const HUBSPOT_KEY = process.env.HUBSPOT_API_KEY;

  const { name, email, phone, substackUrl, linkedinUrl, linkedinText, scribeScore, northStarSummary, contentCoverage, postCount } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // If HubSpot is configured, create/update contact
  if (HUBSPOT_KEY) {
    try {
      await createHubSpotContact(HUBSPOT_KEY, {
        email,
        firstname: name.split(' ')[0],
        lastname: name.split(' ').slice(1).join(' ') || '',
        phone: phone || '',
        website: substackUrl || '',
        linkedin_url: linkedinUrl || '',
        lead_source: 'Substack Book Creator',
        scribe_score: scribeScore ? String(scribeScore) : '',
        north_star_summary: northStarSummary || '',
        content_coverage: contentCoverage ? String(contentCoverage) : '',
        substack_post_count: postCount ? String(postCount) : ''
      });
    } catch (err) {
      // Log but don't fail — lead capture is best-effort
      console.error('HubSpot error:', err.message);
    }
  }

  return res.status(200).json({ success: true });
};

async function createHubSpotContact(apiKey, properties) {
  // Try to create contact, if already exists update
  const createRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ properties })
  });

  if (createRes.status === 409) {
    // Contact already exists — update instead
    const existing = await createRes.json();
    const contactId = existing.message?.match(/ID: (\d+)/)?.[1];
    if (contactId) {
      await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ properties })
      });
    }
  } else if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`HubSpot create failed: ${createRes.status} — ${errText}`);
  }
}
