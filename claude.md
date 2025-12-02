# Claude Code Session Guidelines

## Token Conservation Rules

### Output Limiting
All commands with potentially large outputs MUST be limited:

```bash
# Limit to first 20 lines
command | head -20

# Limit to last 20 lines
command | tail -20

# Grep with max results
grep -m 10 "pattern" file

# Check file size before reading
wc -l filename
```

### Read Tool Usage
- Use `offset` and `limit` parameters for files >500 lines
- Check line count with `wc -l` before full reads
- Only read necessary sections

### Skip Unnecessary Operations
- ❌ No `npm run dev` for verification (wastes tokens)
- ❌ No large build outputs unless debugging
- ❌ No `git log` without `--oneline` and `-n` limit
- ❌ No recursive operations without filters
- ✅ Trust that code compiles, verify only on errors

## Development Workflow

### Vercel Deployment
- Auto-deploys on push to any branch
- Preview URLs for all branches
- Production URL tracks main branch

### Git Workflow
- Develop on: `claude/review-logger-blueprint-*` branches
- Commit frequently with descriptive messages
- Push to trigger Vercel preview builds
