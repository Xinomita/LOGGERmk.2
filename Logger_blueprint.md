# Compound Tracking App - Development Blueprint

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER DATA LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Profile    │  │  Logged Data │  │  Compounds   │  │  Bloodwork   │    │
│  │  (static +   │  │  (variables, │  │  (permanent  │  │  (manual     │    │
│  │   detected)  │  │   notes)     │  │   + temp)    │  │   entry)     │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         └──────────────────┴─────────────────┴─────────────────┘            │
│                                      │                                      │
│                                      ▼                                      │
│                        ┌─────────────────────────┐                          │
│                        │   UNIVERSAL USER FILE   │                          │
│                        │  (feeds all AI calls)   │                          │
│                        └─────────────────────────┘                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PROCESSING LAYER                                  │
│  ┌──────────────────────┐              ┌──────────────────────┐             │
│  │  Statistical Engine  │              │   AI Engine          │             │
│  │  (hardcoded)         │              │   (structured JSON)  │             │
│  │  - Correlations      │─────────────▶│   - Interactions     │             │
│  │  - Trends            │  stats feed  │   - Variable suggest │             │
│  │  - Compacting        │  into AI     │   - Goal conflicts   │             │
│  │  - Half-life calc    │              │   - Finalization     │             │
│  └──────────────────────┘              └──────────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              UI LAYER                                       │
│     ┌────────────┐       ┌────────────┐       ┌────────────┐               │
│     │  LOGGING   │◄─────▶│ COMPOUNDS  │◄─────▶│     AI     │               │
│     │   PAGE     │       │    PAGE    │       │    PAGE    │               │
│     └────────────┘       └────────────┘       └────────────┘               │
│            │                    │                    │                      │
│            └────────────────────┴────────────────────┘                      │
│                                 │                                           │
│                          ┌──────┴──────┐                                    │
│                          │   PROFILE   │                                    │
│                          └─────────────┘                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Structures

### Universal User File
Single JSON object fed to all AI calls. Contains everything AI needs to know.

```json
{
  "profile": {
    "static": {
      "sex": "male",
      "age": 32,
      "weight_kg": 78
    },
    "conditions": ["diabetic", "history_of_anxiety"],
    "detected_traits": [
      {"trait": "caffeine_sensitive", "confidence": "high", "added": "2024-01-15"}
    ],
    "goals": [
      {"tag": "CLEAN_BULK", "original": "I want to bulk but not gain fat", "active": true},
      {"tag": "HAIR_RETENTION", "original": null, "active": true}
    ]
  },
  "compounds": {
    "permanent": [
      {
        "id": "zinc_glycinate",
        "dose_mg": 30,
        "roa": "oral",
        "frequency": "daily",
        "logging_mode": "negative",
        "stack": "morning_stack",
        "half_life_hours": 3,
        "cached_profile": { /* AI-generated compound effects, cached */ }
      }
    ],
    "temporary": [
      {
        "id": "aspirin",
        "dose_mg": 325,
        "roa": "oral",
        "taken_at": "2024-01-20T14:30:00Z",
        "expires_at": "2024-01-20T20:30:00Z"
      }
    ]
  },
  "logging_variables": [
    {"id": "sleep_hours", "type": "slider", "config": {"min": 0, "max": 12, "step": 0.25}},
    {"id": "hair_shedding", "type": "categorical", "config": {"options": ["Low", "Normal", "Elevated"]}}
  ],
  "statistics_summary": {
    "week": { /* compacted weekly stats */ },
    "month": { /* compacted monthly stats */ },
    "correlations": [
      {"compound": "caffeine", "variable": "anxiety", "change_pct": 47, "n_days": 21}
    ]
  },
  "bloodwork": {
    "latest": {"date": "2024-01-10", "markers": {"igf1": 245, "glucose_fasted": 92}},
    "historical": [ /* previous entries */ ]
  },
  "notes_summary": "User mentioned increased stress at work starting Jan 15. Reports better sleep when taking magnesium with dinner vs morning."
}
```

### Compound Profile (Cached)
Generated once per compound, cached until stack changes affect it.

```json
{
  "compound": "zinc_glycinate",
  "generated_at": "2024-01-15T10:00:00Z",
  "effects": ["testosterone_support", "copper_depletion", "immune_support"],
  "common_sides": ["gi_distress", "metallic_taste"],
  "half_life_hours": 3,
  "dose_context": "standard"
}
```

### Interaction Object
AI-generated when stack changes. Stored per compound pair.

```json
{
  "between": ["zinc_glycinate", "copper_supplement"],
  "severity": "moderate",
  "type": "antagonism",
  "mechanism": {
    "pathway": "Intestinal absorption competition",
    "effect": "Zinc inhibits copper uptake at brush border",
    "outcome": "Reduced copper bioavailability"
  },
  "action": "adjust_timing",
  "timing_note": "Separate by 4+ hours",
  "generated_at": "2024-01-15T10:00:00Z"
}
```

### Goal Conflict Object

```json
{
  "goal": "hair_retention",
  "compounds_involved": ["nandrolone", "finasteride"],
  "severity": "critical",
  "mechanism": {
    "pathway": "5α-reductase inhibition",
    "effect": "Blocks DHN conversion, increases tissue androgenicity",
    "outcome": "Accelerated follicle miniaturization"
  },
  "action": "avoid_combination",
  "alternative": "Use testosterone base if combining with finasteride"
}
```

### Logging Variable Suggestion

```json
{
  "suggested_variables": [
    {
      "name": "Hair Shedding",
      "priority": "high",
      "linked_compounds": ["nandrolone", "finasteride"],
      "reason": "Paradoxical androgenic effect requires monitoring",
      "options": [
        {
          "tier": 1,
          "name": "Shower Hair Count",
          "type": "number",
          "config": {"unit": "hairs", "decimal_places": 0},
          "requires": "Drain catch",
          "precision": "high"
        },
        {
          "tier": 2,
          "name": "Hair Shedding Level",
          "type": "categorical",
          "config": {"options": ["Low", "Normal", "Elevated", "Significant"]},
          "requires": null,
          "precision": "low"
        }
      ]
    }
  ]
}
```

---

## Page Specifications

### 1. LOGGING PAGE (Light Theme)

**Purpose**: Daily data entry, variable tracking, quick compound logging

**Components**:

```
┌─────────────────────────────────────────┐
│ TREND BANNER (scrolling)                │
│ "Sleep +12% this week" | "⚠ Interaction"│
├─────────────────────────────────────────┤
│ VARIABLE GRAPH                          │
│ - Multi-line, shared Y-axis (normalized)│
│ - Select variable → true Y-axis shows   │
│ - ~1/4 page height, expandable          │
├─────────────────────────────────────────┤
│ VARIABLE TRACKERS                       │
│ ┌─────────────────────────────────────┐ │
│ │ SLEEP         [━━━━━●━━━] 7.5h     │ │
│ │ ENERGY        [━━━●━━━━━] 6/10     │ │
│ │ HAIR SHEDDING [Normal ▼]           │ │
│ │ + Suggested: Anxiety (accept/deny) │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ PLAINTEXT NOTES                         │
│ [Free text entry, AI-parsed weekly]     │
├─────────────────────────────────────────┤
│ QUICK COMPOUND ADD                      │
│ [Compound] [Dose] [ROA] [Time] [+ADD]   │
│ → Adds to half-life graph as temporary  │
│ → Triggers immediate interaction check  │
│ → Modal popup if critical interaction   │
└─────────────────────────────────────────┘
```

**Data Flow**:
- Variable entries → timestamped → stored in logged data
- Quick-add compound → temp compound created → interaction check triggered
- Notes → stored raw → AI summarizes weekly into notes_summary

**Connections**:
- Graph data ← logged data store
- Suggested variables ← AI engine (triggered by compound changes)
- Trend banner ← statistical engine
- Quick-add interactions ← AI engine (immediate check)

---

### 2. COMPOUNDS PAGE (Dark Theme)

**Purpose**: Stack configuration, permanent compound management, half-life visualization

**Components**:

```
┌─────────────────────────────────────────┐
│ HALF-LIFE GRAPH                         │
│ - Concentration curves per compound     │
│ - "NOW" marker (animated)               │
│ - Past 24h + projected 24h              │
│ - Temp compounds: dashed border         │
│ - ~1/4 page height, expandable          │
├─────────────────────────────────────────┤
│ STACK BUILDER                           │
│ ┌─────────────────────────────────────┐ │
│ │ Morning Stack                       │ │
│ │  • Caffeine 200mg [daily] [neg log] │ │
│ │  • Zinc 30mg [daily] [neg log]      │ │
│ │ ┌───────────────────────────────┐   │ │
│ │ │ [+ Add Compound]              │   │ │
│ │ │  - Search / history dropdown  │   │ │
│ │ │  - Dose, ROA, frequency       │   │ │
│ │ │  - Logging mode (pos/neg)     │   │ │
│ │ │  - Assign to stack            │   │ │
│ │ └───────────────────────────────┘   │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ [FINALIZE STACK] button                 │
│ → Generates comprehensive AI report     │
│ → Consumes finalization token           │
│ → Opens AI page with results            │
├─────────────────────────────────────────┤
│ COMPOUND HISTORY                        │
│ - Previous quick-adds available to      │
│   promote to permanent                  │
└─────────────────────────────────────────┘
```

**Data Flow**:
- Stack changes → trigger compound profile caching
- Add compound → AI suggests logging variables (inline dropdown)
- Finalize → bundles all data → AI engine → AI page

**Connections**:
- Half-life graph ← compounds (permanent + temporary) + half-life database
- Stack config → writes to compounds in user file
- Compound add → triggers AI variable suggestions
- Finalize button → triggers full AI analysis → navigates to AI page

---

### 3. AI PAGE (Theme TBD)

**Purpose**: Interaction visualization, detailed analysis, finalization reports

**Components**:

```
┌─────────────────────────────────────────┐
│ NODE MAP                                │
│ - Compounds as nodes                    │
│ - Permanent: solid border               │
│ - Temporary: dashed border (fade out)   │
│ - Edges colored by severity             │
│ - Tap node → highlight edges            │
│ - Tap edge → show interaction card      │
│ - ~1/4 page, expandable                 │
├─────────────────────────────────────────┤
│ INTERACTION CARDS (filterable)          │
│ ┌─────────────────────────────────────┐ │
│ │ ● CRITICAL                          │ │
│ │ Nandrolone + Finasteride            │ │
│ │ ──────────────────────────────────  │ │
│ │ 5α-reductase inhibition             │ │
│ │ Blocks DHN conversion...            │ │
│ │ → Accelerated follicle loss         │ │
│ │ ──────────────────────────────────  │ │
│ │ ✕ Avoid combination                 │ │
│ │ Consider: Testosterone base         │ │
│ └─────────────────────────────────────┘ │
│ [Filter: Critical | Moderate | Info]    │
├─────────────────────────────────────────┤
│ GOAL CONFLICTS                          │
│ - Same card format as interactions      │
│ - Shows goal tag + conflicting compounds│
├─────────────────────────────────────────┤
│ FINALIZATION REPORT (if generated)      │
│ ┌─────────────────────────────────────┐ │
│ │ Generated: Jan 20, 2024             │ │
│ │ ├─ Interactions (3 critical, 2 mod) │ │
│ │ ├─ Optimizations (timing, cofactors)│ │
│ │ ├─ Timeline (week 1-2, 3-4, 5+)     │ │
│ │ ├─ Monitoring (bloodwork, logging)  │ │
│ │ └─ [Coach notes - if enabled]       │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ BLOODWORK CORRELATIONS                  │
│ - Shows compound overlays on markers    │
│ - "IGF-1 +40% since adding MK-677"      │
└─────────────────────────────────────────┘
```

**Data Flow**:
- Node map ← compounds (permanent + active temporary)
- Interaction cards ← cached interaction objects
- Finalization report ← AI engine (on-demand)
- Bloodwork correlations ← statistical engine + bloodwork data

**Connections**:
- Receives finalization trigger from compounds page
- Displays cached interactions (regenerated on stack change)
- Bloodwork data ← profile section

---

### 4. PROFILE SECTION

**Purpose**: User configuration, medical history, goals, detected traits, bloodwork entry

**Components**:

```
┌─────────────────────────────────────────┐
│ CORE INFO (hardcoded fields)            │
│ - Sex, Age, Weight                      │
│ - Required for basic function           │
├─────────────────────────────────────────┤
│ MEDICAL QUIZ                            │
│ - "Optional" but app purpose defeated   │
│   if skipped                            │
│ - Allergies, conditions, medications    │
│ - Freeform answers → AI reformats to    │
│   structured tags                       │
├─────────────────────────────────────────┤
│ GOALS                                   │
│ - Preset options (MUSCLE_GAIN, etc.)    │
│ - Freeform entry → AI generates tag     │
│ - Original text preserved               │
│ - Toggle active/inactive                │
├─────────────────────────────────────────┤
│ DETECTED TRAITS                         │
│ - Proposed by AI from logged patterns   │
│ - User must approve to add              │
│ - Can remove anytime                    │
│ ┌─────────────────────────────────────┐ │
│ │ ✓ Caffeine sensitive (high conf)    │ │
│ │ ✓ Responds well to tongkat          │ │
│ │ ? Proposed: Overmethylator          │ │
│ │   [Accept] [Dismiss]                │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ BLOODWORK                               │
│ - Manual entry (guided by stack)        │
│ - Historical trends graph               │
│ - Compound start/stop overlays          │
│ - Suggested markers based on stack      │
└─────────────────────────────────────────┘
```

**Data Flow**:
- Core info → static profile
- Quiz answers → AI reformats → conditions list
- Goals → stored with tag + original
- Detected traits ← statistical engine (pattern detection) → user approval → profile

**Profile Evolution Trigger**:
- Minimum data: 7 × (number of logged variables) data points
- Statistical engine detects correlation
- Proposes trait with confidence level
- User approves/dismisses
- Approved traits influence all future AI calls

**Connections**:
- Profile feeds into universal user file
- Bloodwork suggestions ← current compound list
- Detected traits ← statistical engine correlations

---

## Processing Systems

### Statistical Engine (Hardcoded)

**Functions**:
1. **Correlation detection**: Compound presence vs variable values
2. **Trend calculation**: Week-over-week, month-over-month changes
3. **Half-life calculations**: Pharmacokinetic curves
4. **Data compacting**: Summarize history for AI context

**Compacting Rules**:
- Daily data: kept raw for 30 days
- Weekly summaries: mean, variance, high, low per variable
- Monthly summaries: same structure, generated from weeks
- Notes: AI summarizes weekly if > threshold wordcount

**Outputs**:
- `statistics_summary` in user file
- Trend banner content
- Profile evolution proposals

**Does NOT**:
- Interpret meaning (that's AI's job)
- Generate recommendations
- Determine causation

---

### AI Engine

**Model Requirements**:
- GPT-4o / Claude Sonnet tier for core analysis
- GPT-4o-mini / Haiku for simpler tasks (variable suggestions)

**Tiered Usage**:

| Operation | Model Tier | Trigger |
|-----------|------------|---------|
| Compound profile generation | High | First time compound added |
| Quick-add interaction check | Low | Each quick-add |
| Variable suggestions | Low | Compound added to permanent |
| Goal conflict check | Low | Goal added/changed |
| Full finalization | High | User clicks Finalize |
| Notes summarization | Low | Weekly batch |

**Caching Strategy**:
- Compound profiles: Cache until that compound's context changes
- Interactions: Cache per compound pair, invalidate on stack change
- Finalization: No cache, always regenerate (user pays for fresh)

**Cache Invalidation Rules**:
- Adding compound X: Regenerate X's profile + all interactions involving X
- Removing compound: Remove from interaction cache, don't regenerate others
- Dose change >25%: Regenerate that compound's profile + interactions
- Goal change: Regenerate goal conflicts only

**Output Constraints**:
- All outputs are structured JSON
- Enums for severity, action types
- Character limits on free text fields
- No prose generation except finalization coach_notes (if enabled)

---

## Warning System

### Warning Types

| Type | Trigger | Surface | Persistence |
|------|---------|---------|-------------|
| **Immediate/Modal** | Quick-add creates critical interaction | Blocking popup | Until dismissed |
| **Passive/Badge** | Scheduled stack has interaction | Badge on compound, card on AI page | Until stack changed |
| **Informational** | Non-critical interaction or optimization | Card on AI page only | Permanent |
| **Trend** | Statistical threshold reached (≥10% change) | Trend banner | Rolling |

### Greying-Out Behavior
When compound A is active (via quick-add or scheduled dose), compounds with critical interactions grey out in:
- Stack builder (can still add, but visual warning)
- Quick-add autocomplete (shown but marked)

Not a hard block—user can override. Just friction.

---

## Interconnection Map

```
LOGGING PAGE                 COMPOUNDS PAGE                AI PAGE
─────────────────────────────────────────────────────────────────────
                                   │
Variable Graph ◄────────── Statistical Engine
     │                             │
     │                    ┌────────┴────────┐
     ▼                    ▼                 ▼
Logged Data ──────► Universal User File ◄── Compound Config
     │                    │                 │
     │                    │                 │
     │                    ▼                 │
     │              AI Engine ◄─────────────┘
     │                    │
     │         ┌──────────┼──────────┐
     │         ▼          ▼          ▼
     │   Interactions  Variables  Finalization
     │         │          │          │
     │         │          │          │
     ▼         ▼          ▼          ▼
Quick-Add ──► Popup    Suggestion   Report
Warning       (modal)   (inline)    (AI page)
                                      │
                                      ▼
                               Node Map + Cards


PROFILE ◄──────────────────────────────────────────────────────────►
    │
    ├── Static info ──────────► Universal User File
    ├── Quiz answers ──► AI reformat ──► Conditions
    ├── Goals ────────────────► Universal User File
    ├── Detected traits ◄───── Statistical Engine proposals
    │         │
    │         └── User approval ──► Universal User File
    │
    └── Bloodwork ────────────► Universal User File
              │
              └──► AI page correlations
```

---

## Build Order Recommendations

### Phase 1: Core Loop
1. **Profile (static only)**: Sex, age, weight fields
2. **Compound data structure**: Permanent compounds, basic config
3. **Half-life database integration**: Lookup + ROA selection
4. **Logging page (basic)**: Manual variable entry, no AI suggestions
5. **Statistical engine (basic)**: Store data, calculate simple trends

**Milestone**: User can add compounds, log variables, see basic trends

### Phase 2: AI Integration
6. **Universal user file assembly**: Combine all data sources
7. **AI engine (compound profiles)**: Generate + cache on add
8. **AI engine (interactions)**: Pair analysis on stack change
9. **AI page (node map + cards)**: Visualize interactions
10. **Quick-add flow**: Temporary compounds + immediate checks

**Milestone**: User gets AI-powered interaction warnings

### Phase 3: Intelligence Layer
11. **Variable suggestions**: AI recommends based on stack
12. **Goal system**: Preset + freeform with AI tagging
13. **Goal conflict detection**: AI checks goals vs compounds
14. **Finalization reports**: Full analysis on demand
15. **Statistical engine (correlations)**: Compound-variable relationships

**Milestone**: Full AI analysis with personalization

### Phase 4: Profile Evolution
16. **Pattern detection**: Statistical triggers for traits
17. **Trait proposals**: UI for accept/dismiss
18. **Profile integration**: Traits influence AI outputs
19. **Data compacting**: Weekly/monthly summaries
20. **Notes parsing**: AI summarization

**Milestone**: App learns user's patterns over time

### Phase 5: Polish
21. **Bloodwork integration**: Manual entry + correlations
22. **Trend banner**: Statistical highlights + warnings
23. **Notification system**: Push for time-sensitive warnings
24. **Onboarding flow**: Guided first-use experience

---

## Appendix: Hardcoded Elements

### Half-Life Database
- Lookup by compound name
- Multiple ROA entries per compound
- Fields: compound_id, roa, half_life_hours, source
- Unknown compounds: "Unknown" displayed, no curve rendered

### Logging Variable Pool
Pre-defined ~50-75 variables across categories:
- **Sleep**: hours, latency, quality
- **Physical**: weight, waist, energy
- **Digestive**: bowel_movements, bloating
- **Mental**: focus, anxiety, mood
- **Sexual**: libido, morning_wood
- **Compound-specific**: added via AI suggestion

Each variable has: id, display_name, type, config, category

### Goal Presets
~20-30 common goals:
- MUSCLE_GAIN, FAT_LOSS, CLEAN_BULK
- COGNITIVE_ENHANCEMENT, FOCUS
- SLEEP_OPTIMIZATION
- LONGEVITY, SKIN_HEALTH
- HAIR_RETENTION, LIBIDO
- STRESS_REDUCTION, ANXIETY_MANAGEMENT

User can add freeform; AI generates matching tag.

---

## Appendix: Backburner Items

For future releases, not current scope:

- Peptide calculator (reconstitution math)
- Pre-built stack templates
- Social/community features (stack sharing, anonymized data)
- Coach tone in finalization
- Wearable integrations
- Lab API partnerships
- PDF OCR for bloodwork
