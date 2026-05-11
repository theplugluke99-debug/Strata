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

## Directory structure — components/quote/
```
shared/
  BackButton.jsx       — back chevron button
  ProgressDots.jsx     — step indicator dots
  EstimateBar.jsx      — live price estimate footer
  MeasuringTool.jsx    — room dimension inputs + skip toggle
  Chip.jsx             — reusable chip/toggle button
  GoldBtn.jsx          — gold CTA button with optional helper text
  GoldNote.jsx         — gold left-border note with diamond icon
  FloNudge.jsx         — Flo avatar + italic serif message
  SectionLabel.jsx     — 9px uppercase gold label
  Divider.jsx          — 32px gold divider bar
homeowner/
  HomeownerFlow.jsx    — step orchestrator (steps 0/1/2/99)
  RoomSelector.jsx     — room grid + bedroom stepper
  RoomConfig.jsx       — per-room sub-step router (<150 lines)
  DesignPicker.jsx     — design card + colour swatch picker
  FloRecommendation.jsx — Good/Better/Best recommendation tiles
  MeasureGuide.jsx     — collapsible measuring education panel
  data/
    rooms.js           — RESIDENTIAL_ROOMS (array), ROOM_ICONS (object), BedroomIcon
    designs.js         — DESIGNS[flooringType] = [{id, label, desc, svg|img}]
    colours.js         — COLOURS[designId] = [{hex, name}]
    pricing.js         — WASTAGE_RATES (per-type), PRICE_RANGES (per-type)
    floorings.js       — FLOORING_TYPES [{name, image, description, tag}]
  steps/
    FlooringTypeStep.jsx  — flooring type card selection
    GradeStep.jsx         — mood/atmosphere selector
    CurrentFloorStep.jsx  — practical flags (pets, UFH, etc.)
    DimensionsStep.jsx    — MeasuringTool wrapper
    DesignStep.jsx        — DesignPicker wrapper
    StairsStep.jsx        — stairs type + runner style
landlord/
  LandlordFlow.jsx     — 4-step landlord flow
commercial/
  CommercialFlow.jsx   — 4-step commercial flow
publicsector/
  PublicSectorChat.jsx — Flo chat with contact form submission
```

## Component rules
- Shared UI: components/quote/shared/
- Static data: components/quote/homeowner/data/
- Step components: components/quote/homeowner/steps/
- Never define data arrays inside component files
- Never redefine shared components inline — always import
- RoomConfig.jsx must stay under 150 lines — add sub-steps as new step files

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
