#!/usr/bin/env node

// Strata Flo — One-time lexicon embedding script
// Chunks all 17 lexicons and stores embeddings in Supabase
// Run once: node embed-lexicons.js

const fs = require('fs');
const path = require('path');
const https = require('https');

// Config
const CHUNK_SIZE = 800; // words per chunk
const CHUNK_OVERLAP = 100; // words overlap between chunks
const BATCH_SIZE = 10; // embeddings per API call

// Lexicon files
const LEXICON_FILES = [
  { name: 'Carpet', file: 'strata_lexicon_01_carpet.md' },
  { name: 'Hardwood', file: 'strata_lexicon_02_hardwood.md' },
  { name: 'Engineered Wood', file: 'strata_lexicon_03_engineered_wood.md' },
  { name: 'Laminate', file: 'strata_lexicon_04_laminate.md' },
  { name: 'LVT and LVP', file: 'strata_lexicon_05_lvt_lvp.md' },
  { name: 'Vinyl Sheet and Linoleum', file: 'strata_lexicon_06_vinyl_sheet_linoleum.md' },
  { name: 'Ceramic and Porcelain Tile', file: 'strata_lexicon_07_ceramic_porcelain_tile.md' },
  { name: 'Natural Stone', file: 'strata_lexicon_08_natural_stone.md' },
  { name: 'Resin and Poured Floors', file: 'strata_lexicon_09_resin_poured_floors.md' },
  { name: 'Subfloors and Preparation', file: 'strata_lexicon_10_subfloors_preparation.md' },
  { name: 'Underfloor Heating', file: 'strata_lexicon_11_underfloor_heating.md' },
  { name: 'Commercial and Specialist', file: 'strata_lexicon_12_commercial_specialist.md' },
  { name: 'Cork and Rubber', file: 'strata_lexicon_13_cork_rubber.md' },
  { name: 'Reclaimed and Heritage', file: 'strata_lexicon_14_reclaimed_heritage.md' },
  { name: 'Pricing Guide', file: 'strata_pricing_guide.md' },
  { name: 'Room by Room Guide', file: 'strata_room_by_room_guide.md' },
  { name: 'Diagnosis and Decision Tree', file: 'strata_diagnosis_decision_tree.md' },
];

// Split text into overlapping chunks
function chunkText(text, chunkSize, overlap) {
  const words = text.split(/\s+/);
  const chunks = [];
  let i = 0;
  while (i < words.length) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 50) {
      chunks.push(chunk);
    }
    i += chunkSize - overlap;
  }
  return chunks;
}

// Call OpenAI embeddings API
function getEmbeddings(texts, apiKey) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'text-embedding-3-small',
      input: texts,
    });

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/embeddings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) reject(new Error(parsed.error.message));
          else resolve(parsed.data.map(d => d.embedding));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Insert chunks into Supabase
function insertChunks(chunks, supabaseUrl, serviceKey) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(chunks);
    const url = new URL(`${supabaseUrl}/rest/v1/lexicon_chunks`);

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Prefer': 'return=minimal',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`Supabase error ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  // Load env vars
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('ERROR: .env.local not found. Run this from your strata project root.');
    process.exit(1);
  }

  const env = {};
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) env[key.trim()] = vals.join('=').trim();
  });

  const OPENAI_KEY = env.OPENAI_API_KEY;
  const SUPABASE_URL = env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY;

  if (!OPENAI_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('ERROR: Missing OPENAI_API_KEY, SUPABASE_URL, or SUPABASE_SERVICE_KEY in .env.local');
    process.exit(1);
  }

  // Find lexicon files
  const lexiconDir = path.join(__dirname, 'app', 'api', 'flo', 'lexicons', 'source');
  const uploadsDir = '/mnt/user-data/uploads';
  
  console.log('🌿 Strata Flo — Lexicon Embedding Script');
  console.log('=========================================');

  let totalChunks = 0;
  let allChunksToInsert = [];

  // Process each lexicon
  for (const lexicon of LEXICON_FILES) {
    // Try multiple possible locations
    let filePath = null;
    const possiblePaths = [
      path.join(__dirname, lexicon.file),
      path.join(__dirname, 'lexicons', lexicon.file),
      path.join(__dirname, 'app', 'api', 'flo', 'lexicons', 'source', lexicon.file),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) { filePath = p; break; }
    }

    if (!filePath) {
      console.log(`⚠️  Skipping ${lexicon.name} — file not found: ${lexicon.file}`);
      continue;
    }

    const text = fs.readFileSync(filePath, 'utf8');
    const chunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP);
    console.log(`📄 ${lexicon.name}: ${chunks.length} chunks`);

    chunks.forEach((content, index) => {
      allChunksToInsert.push({
        lexicon_name: lexicon.name,
        chunk_index: index,
        content,
        embedding: null, // filled below
      });
    });

    totalChunks += chunks.length;
  }

  if (allChunksToInsert.length === 0) {
    console.error('ERROR: No lexicon files found. Make sure the .md files are in the same directory as this script.');
    process.exit(1);
  }

  console.log(`\n✅ Total chunks to embed: ${totalChunks}`);
  console.log(`💰 Estimated cost: $${(totalChunks * 800 / 1000000 * 0.02).toFixed(4)} USD\n`);

  // Embed in batches
  console.log('🔄 Embedding chunks...');
  let processed = 0;

  for (let i = 0; i < allChunksToInsert.length; i += BATCH_SIZE) {
    const batch = allChunksToInsert.slice(i, i + BATCH_SIZE);
    const texts = batch.map(c => c.content);

    try {
      const embeddings = await getEmbeddings(texts, OPENAI_KEY);
      embeddings.forEach((emb, j) => {
        allChunksToInsert[i + j].embedding = emb;
      });
      processed += batch.length;
      process.stdout.write(`\r   ${processed}/${totalChunks} chunks embedded...`);
      
      // Rate limit: 3 requests per second
      await sleep(350);
    } catch (err) {
      console.error(`\nERROR embedding batch at index ${i}:`, err.message);
      process.exit(1);
    }
  }

  console.log(`\n✅ All chunks embedded\n`);

  // Insert into Supabase in batches
  console.log('💾 Inserting into Supabase...');
  const INSERT_BATCH = 50;
  let inserted = 0;

  for (let i = 0; i < allChunksToInsert.length; i += INSERT_BATCH) {
    const batch = allChunksToInsert.slice(i, i + INSERT_BATCH);
    
    // Format embedding as Postgres vector string
    const formatted = batch.map(c => ({
      lexicon_name: c.lexicon_name,
      chunk_index: c.chunk_index,
      content: c.content,
      embedding: JSON.stringify(c.embedding),
    }));

    try {
      await insertChunks(formatted, SUPABASE_URL, SUPABASE_SERVICE_KEY);
      inserted += batch.length;
      process.stdout.write(`\r   ${inserted}/${totalChunks} chunks saved...`);
    } catch (err) {
      console.error(`\nERROR inserting batch at index ${i}:`, err.message);
      process.exit(1);
    }
  }

  console.log(`\n\n🎉 Done! ${inserted} chunks stored in Supabase.`);
  console.log('Flo now has full knowledge of all 17 lexicons via RAG.');
  console.log('\nNext step: update app/api/flo/chat/route.js to use RAG retrieval.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
