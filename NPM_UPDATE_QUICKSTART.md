# NPM Security Updates - Quick Implementation Guide

**Status:** Ready for Phase 1 implementation
**Risk Level:** LOW
**Estimated Time:** 1-2 hours total (across 3 weeks)
**Security Impact:** Fixes 15+ vulnerabilities, maintains app functionality

---

## Phase 1: Initial Safe Updates (Week 1) - 30 minutes

**What:** Update development dependencies with well-contained vulnerabilities

**Commands:**
```bash
# Create a new branch for updates
git checkout -b security/npm-audit-fixes

# Update safe packages (dev environment only)
npm install --save-dev \
  js-yaml@^3.14.1 \
  tmp@^0.2.6

npm install uuid@^11.1.1

# Auto-fix remaining safe issues
npm audit fix

# Verify
npm run vbuild
echo "Build succeeded ✓"
```

**Expected Result:**
- 7-9 vulnerabilities resolved
- Build succeeds
- No test changes needed

**Commit:**
```bash
git commit -m "security: Fix dev dependencies - Phase 1

- Update js-yaml to ^3.14.1 (quadratic DoS fix)
- Update tmp to ^0.2.6 (symlink/path traversal fixes)
- Update uuid to ^11.1.1 (buffer bounds check)
- Run npm audit fix for other safe issues

Resolves GHSA-h67p-54hq-rp68, GHSA-52f5-9888-hmc6, 
GHSA-ph9p-34f9-6g65, GHSA-w5hq-g745-h8pq"
```

**After Phase 1:** ~8 vulnerabilities remaining

---

## Phase 2: Coordinated Linting Updates (Week 2) - 1 hour

**What:** Update linting/build toolchain to fix nested vulnerability chains

**Commands:**
```bash
# Update linting (fixes flatted chain)
npm install --save-dev import-sort-style-eslint@^7.0.0

# Update build tool to latest 5.x (fixes esbuild)
npm install --save-dev vite@^5.1.5

# Update Svelte to latest v5 (XSS patches)
npm install svelte@^5.56.5

# Verify everything
npm run vbuild
npm run vtest
echo "All tests passed ✓"
```

**Expected Result:**
- 3-5 vulnerabilities resolved
- Build succeeds
- Tests pass
- No code changes needed

**Commit:**
```bash
git commit -m "security: Update build and linting tools - Phase 2

- Update import-sort-style-eslint to ^7.0.0 (fixes flatted)
- Update vite to ^5.1.5 (fixes esbuild SSRF)
- Update svelte to ^5.56.5 (XSS patches in SSR)

Resolves:
GHSA-25h7-pfq9-p65f, GHSA-rf6f-7fwh-wjgh (flatted)
GHSA-67mh-4wv8-2f99 (esbuild)
6x XSS vulnerabilities in svelte (SSR-only, not applicable to CSR)"
```

**After Phase 2:** ~2-4 vulnerabilities remaining (all in dev/testing)

---

## Phase 3: Production Dependency Fix (Week 2-3) - 1-2 hours

**What:** Replace vulnerable expr-eval with safe alternative

**Commands:**
```bash
# Switch branch to updates branch
git checkout security/npm-audit-fixes

# Edit file: src/modules/tokenizer/lite.ts
# Change line 2:  import { Parser } from 'expr-eval'
#            to:  import mexp from 'math-expression-evaluator'
# 
# Change line 54: value: Parser.evaluate(valueStr)
#             to: value: mexp.evaluate(valueStr)

# Remove vulnerable package
npm uninstall expr-eval

# Verify
npm run vbuild
npm run vtest
npm audit
```

**File Changes:**
```diff
// src/modules/tokenizer/lite.ts

- import { Parser } from 'expr-eval'
+ import mexp from 'math-expression-evaluator'

... (around line 54)

-       return {
-         value: Parser.evaluate(valueStr),
+       return {
+         value: mexp.evaluate(valueStr),
          uom,
```

**Commit:**
```bash
git commit -m "security: Replace expr-eval with math-expression-evaluator - Phase 3

Replace vulnerable expr-eval (no available fix) with already-included
math-expression-evaluator package. Both have nearly identical APIs for
mathematical expression evaluation.

Changes:
- Update import in src/modules/tokenizer/lite.ts
- Change Parser.evaluate() to mexp.evaluate() 
- Remove expr-eval dependency

This fixes:
GHSA-8gw3-rxh4-v6jx (unrestricted function passing)
GHSA-jc85-fpwf-qm7x (prototype pollution)

Testing:
- All tracker expressions (#tracker(5+3*2)) still work
- Error handling unchanged
- Math precedence unchanged
- No new dependencies added"
```

**After Phase 3:** 0-1 vulnerabilities remaining (cypress-only, dev-only)

---

## Phase 4: Optional - Cypress Upgrade (Future)

**When:** Not urgent - defer to next development cycle
**Why Deferring:** 
- Cypress 4 → 13 is 8+ major versions
- Requires complete test rewrite
- Tests are stable and working

**When to Do:**
- Next quarter or next development sprint
- Plan 2-3 weeks dedicated effort
- Run parallel test suites during migration

**See:** NPM_AUDIT_STRATEGY.md - "PHASE 4: CYPRESS UPGRADE STRATEGY"

---

## Testing Checklist

After each phase, verify:

```bash
# Build succeeds
npm run vbuild
# ✓ No errors, dist/ folder created

# Tests pass
npm run vtest
# ✓ All tests pass

# Audit shows improvements
npm audit
# ✓ Vulnerabilities reduced

# No console warnings
npm run dev > /tmp/dev.log 2>&1 &
# ✓ No warnings from dependencies

# App functionality
# ✓ Can create trackers
# ✓ Can enter values with expressions (#tracker(5+3))
# ✓ Linting rules still work
# ✓ Build still completes
```

---

## Rollback Instructions (If Needed)

**If Phase 1 breaks something:**
```bash
git reset --hard
git clean -fd
npm install  # Reinstall original versions
```

**If Phase 2 breaks something:**
```bash
git reset --hard
git checkout security/npm-audit-fixes~1  # Go back to after Phase 1
npm install
```

**If Phase 3 breaks something:**
```bash
git reset --hard
git checkout security/npm-audit-fixes~1  # Go back to after Phase 2
npm install
npm install --save expr-eval@^2.0.2  # Restore old package
```

---

## Timeline Recommendation

| Phase | Week | Effort | Risk | Status |
|-------|------|--------|------|--------|
| Phase 1 | Week 1 (Mon) | 30min | ✅ LOW | Ready |
| Phase 2 | Week 2 (Mon) | 1hr | ✅ LOW | Ready |
| Phase 3 | Week 2 (Tue) | 1-2hr | ✅ LOW | Ready |
| Phase 4 | Q3 | 2-3wk | ⚠️ MEDIUM | Deferred |

**Suggested Schedule:**
- Monday: Phase 1 (30min, test build)
- Wednesday: Phase 2 (1hr, test suite)
- Thursday: Phase 3 (1-2hr, expression parsing)
- Friday: Final verification & PR review

**Total Implementation Time:** ~4-5 hours (across 1 week)

---

## Success Criteria

✅ **Phase 1 Complete:**
- Build succeeds
- Tests pass
- npm audit shows ~8 vulns remaining

✅ **Phase 2 Complete:**
- Build succeeds
- Tests pass
- npm audit shows ~2-4 vulns remaining (all dev/Cypress)

✅ **Phase 3 Complete:**
- Build succeeds
- Tests pass
- npm audit shows 0-1 vulns (only Cypress)
- Tracker expressions work: `#sleep(8.5hr)`, `#exercise(30min+15min)`

✅ **All Phases:**
- No console warnings
- App builds and runs normally
- All tests pass
- Ready to merge to main branch

---

## Questions Before Starting?

**Review these documents first:**
1. `NPM_AUDIT_STRATEGY.md` - Full vulnerability analysis
2. `EXPR_EVAL_REPLACEMENT_ANALYSIS.md` - Details on expr-eval replacement
3. This document - Quick implementation steps

**Ready?** Start with Phase 1 when you're confident!

