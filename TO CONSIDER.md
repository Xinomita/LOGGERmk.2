# TO CONSIDER

Development notes, ideas, and features to implement later.

---

## Color System

**Users will need to be able to select a color to assign to a logging variable as a sort of tag - from a color library, like Google Calendar**

- Consider ~12 vibrant/neon colors for neo-brutalist aesthetic
- Color picker UI in variable configuration
- Each variable gets one color tag
- Colors sync across: slider accent, graph line, legend indicator
- Default palette suggestions based on common patterns

---

## Variable Range Configuration

**Need to think about how the ranges of each logging variable will be setup - tempting to make it manual, but idk... hmm**

- Manual: User sets min/max/baseline/step for each variable
- Auto: App suggests ranges based on variable type (weight, sleep, etc.)
- Hybrid: Smart defaults that user can override
- Consider: First-time setup wizard vs on-the-fly adjustment
- Dynamic ranges that adjust over time based on logged data?

---

## Slider Range Behavior Types

**Two distinct categories of variables require different range update behaviors:**

### Dynamic Range Sliders (Continuous Variables)
- **Examples**: Bodyweight, waist circumference, body fat %
- **Behavior**: When logged, the baseline and range shift to center on new value
- **Rationale**: If you log +5kg bodyweight, the new range should shift up by 5kg to allow continued upward tracking
- **Implementation**: After logging, `baseline = baseline + loggedValue`, reset slider to 0 (new center)

### Fixed Range Sliders (Scaled Variables)
- **Examples**: Mood (0-10), energy (0-10), pain level (0-10)
- **Behavior**: Range stays constant regardless of logged values
- **Rationale**: Logging mood 10/10 shouldn't shift range to 10-20; scale must remain fixed for consistency
- **Implementation**: Baseline never changes, slider resets to 0 (neutral/center) after logging

**Key distinction**: Dynamic sliders track absolute measurements that drift over time. Fixed sliders track subjective ratings on a consistent scale.

---
