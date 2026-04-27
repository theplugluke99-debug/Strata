import { FLO_SYSTEM_PROMPT } from '@/lib/floPrompt';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

async function embedQuery(text) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000),
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.data[0].embedding;
}

async function searchLexicons(embedding, topK = 6) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/match_lexicon_chunks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'apikey': SUPABASE_SERVICE_KEY,
    },
    body: JSON.stringify({
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: topK,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase search failed: ${err}`);
  }
  return res.json();
}

function buildContext(chunks) {
  if (!chunks || chunks.length === 0) return '';
  return chunks
    .map(c => `[${c.lexicon_name}]\n${c.content}`)
    .join('\n\n---\n\n');
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, context = {}, history = [] } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return Response.json({ success: false, error: 'message is required' }, { status: 400 });
    }

    console.log('[flo/chat] message:', message.slice(0, 100));

    let relevantContext = '';
    try {
      const embedding = await embedQuery(message);
      const chunks = await searchLexicons(embedding, 6);
      relevantContext = buildContext(chunks);
      console.log('[flo/chat] retrieved', chunks?.length || 0, 'chunks from RAG');
    } catch (ragErr) {
      console.warn('[flo/chat] RAG retrieval failed, continuing without:', ragErr.message);
    }

    const contextNote = context.role === 'fitter'
      ? 'You are speaking with a fitter.'
      : context.role === 'surveyor'
      ? 'You are speaking with a surveyor.'
      : 'You are speaking with a customer.';

    const ragSection = relevantContext
      ? `\n\nRELEVANT KNOWLEDGE FROM YOUR FLOORING DATABASE:\n${relevantContext}`
      : '';

    const systemPrompt = `${FLO_SYSTEM_PROMPT}\n\n${contextNote}${ragSection}`;

    const messages = [
      ...history.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    });

    const anthropicData = await anthropicRes.json();

    if (anthropicData.error) {
      console.error('[flo/chat] Anthropic error:', anthropicData.error);
      return Response.json({ success: false, error: 'Flo is unavailable right now' }, { status: 500 });
    }

    const response = anthropicData.content?.[0]?.text || '';
    console.log('[flo/chat] response length:', response.length);

    return Response.json({ success: true, response });

  } catch (err) {
    console.error('[flo/chat] error:', err.message);
    return Response.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
