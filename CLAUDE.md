# Strata — Claude Code Rules

## Stack
Next.js, Vercel, Airtable, Anthropic API, Supabase pgvector

## Live site
stratafloors.co.uk

## Design tokens
Always import from components/quote/tokens.js — never redefine inline.
BG: #111110
SURFACE: #1a1a18
BORDER: #2a2a28
TEXT: #f2ede0
MUTED: rgba(242,237,224,0.45)
GOLD: #c9a96e
GOLD_DIM: rgba(201,169,110,0.15)
GOLD_BORDER: rgba(201,169,110,0.4)

## Typography — NEVER use CSS variables for fonts
Headings: 'Cormorant Garamond', Georgia, serif
Body/UI: system-ui, sans-serif
Section labels: system-ui 9-10px uppercase letter-spacing 0.14em color GOLD
Body copy: system-ui 12-13px MUTED fontWeight 300 lineHeight 1.65
Buttons: system-ui 12-13px fontWeight 600 letterSpacing 0.1em uppercase
NEVER use var(--font-outfit) or var(--font-cormorant) — always use the literal strings above.

## File size rule
Max 300 lines per file. If a file exceeds this, split it.

## Component rules
- Shared UI: components/quote/shared/
- Static data: components/quote/homeowner/data/
- Never define data arrays inside component files
- Never redefine shared components inline — always import

## Image rules
- All flooring photos: Next.js Image component with priority prop
- Never use plain img tags for flooring photos

## Quote form
- Lives entirely in components/quote/
- Do not touch app/page.js (landing page)
- State via useQuoteForm() from QuoteFormProvider
- Homeowner dispatch types: HO_SET_ROOMS, HO_UPDATE_ROOM, HO_SET_CURRENT_ROOM, HO_SET_ADDITIONAL_BEDROOMS

## API routes
- /api/submit — Airtable lead capture
- /api/flo/chat — Flo RAG (use https://www.stratafloors.co.uk/api/flo/chat absolute URL)
- /api/quote — AI estimate
- /api/recommend — Flo recommendation

## Git
git add .
git commit -m "message"
git pull origin main --rebase
git push
