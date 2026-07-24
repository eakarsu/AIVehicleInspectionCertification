const https = require('https');
require('dotenv').config({ path: '../.env' });

function parseAIJson(content) {
  try { return JSON.parse(content); } catch {}
  try {
    const stripped = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(stripped);
  } catch {}
  try {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch {}
  return null;
}

async function callOpenRouter(prompt, systemPrompt = '') {
  const apiKey = process.env.OPENROUTER_API_KEY || '';
  const model = process.env.OPENROUTER_MODEL || '';
  const baseUrl = (process.env.OPENROUTER_BASE_URL || '').replace(/\/$/, '');
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is required');
  if (!model) throw new Error('OPENROUTER_MODEL is required');
  if (baseUrl !== 'https://openrouter.ai/api/v1') {
    throw new Error('OPENROUTER_BASE_URL must be https://openrouter.ai/api/v1');
  }
  const endpoint = new URL(`${baseUrl}/chat/completions`);

  const payload = JSON.stringify({
    model,
    messages: [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt }
    ],
    max_tokens: 2000,
    temperature: 0.7
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: endpoint.hostname,
      path: endpoint.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Vehicle Inspection'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(parsed.error.message || 'OpenRouter API error'));
          } else {
            const content = parsed.choices?.[0]?.message?.content || '';
            if (!content.trim()) return reject(new Error('OpenRouter returned an empty response'));
            resolve({ content, model: parsed.model, usage: parsed.usage });
          }
        } catch (e) {
          reject(new Error('Failed to parse OpenRouter response'));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function persistAIResult(sequelize, userId, endpoint, inputData, result) {
  await sequelize.query(
    'INSERT INTO ai_results (user_id, endpoint, input_data, result) VALUES ($1, $2, $3, $4)',
    { bind: [userId, endpoint, JSON.stringify(inputData), JSON.stringify(result)], type: sequelize.QueryTypes.INSERT }
  );
}

module.exports = { callOpenRouter, parseAIJson, persistAIResult };
