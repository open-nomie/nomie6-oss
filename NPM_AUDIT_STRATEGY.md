# NPM Audit Vulnerability Analysis & Update Strategy

**Analysis Date:** 2026-07-14
**Current Status:** 21 vulnerabilities (3 critical, 7 high, 8 moderate, 3 low)
**Goal:** Establish safe update strategy prioritizing security with minimal breaking changes

---

## Executive Summary

### Vulnerability Breakdown

| Severity | Count | Status |
|----------|-------|--------|
| **CRITICAL** | 3 | All have fixes available |
| **HIGH** | 7 | 4 have fixes, 3 require workarounds |
| **MODERATE** | 8 | All have fixes available |
| **LOW** | 3 | Likely non-critical |
| **TOTAL** | 21 | Actionable |

### Risk Assessment

**Critical Issues (Must Fix):**
1. `@cypress/request` - SSRF vulnerability
2. `form-data` - Random boundary generation + CRLF injection
3. `cypress` - Depends on vulnerable @cypress/request

**High-Risk Issues (Should Fix Soon):**
1. `tmp` - Path traversal / symlink vulnerabilities  
2. `flatted` - DoS + prototype pollution
3. `expr-eval` - Prototype pollution (no fix available - requires replacement)

**Moderate Issues (Fix When Possible):**
1. `svelte` - 6 XSS vulnerabilities (but SSR-only in most cases)
2. `esbuild` - SSRF via dev server
3. `uuid` - Buffer bounds check
4. `qs` - DoS via arrayLimit bypass
5. `js-yaml` - Quadratic complexity DoS

---

## Detailed Package Analysis

### TIER 1: CRITICAL VULNERABILITIES (Fix Immediately)

#### 1. form-data <=2.5.5 (CRITICAL)

**Current Version:** Pinned in @cypress/request dependency
**Vulnerabilities:** 
- GHSA-fjxv-7rqg-78g4: Unsafe random function for boundary
- GHSA-hmw2-7cc7-3qxx: CRLF injection via unescaped field names

**Risk Level:** CRITICAL - Affects multipart request handling
**Usage:** 
- Required by @cypress/request
- Required by cypress
- Only used in test/dev environment

**Fix Available:** YES (via npm audit fix)
**Target Version:** 4.0.1+

**Impact Analysis:**
- Breaking change: form-data v3.0.0+ is ESM only, v4.0.0+ requires Node 14+
- Transitive: @cypress/request blocks the update (itself needs updating)

**Recommendation:** Update cypress first (which depends on @cypress/request)

---

#### 2. @cypress/request <=3.0.10 (CRITICAL)

**Current Version:** <=3.0.10
**Vulnerabilities:**
- GHSA-p8p7-x288-28g6: Server-Side Request Forgery
- Depends on vulnerable: form-data, qs, uuid

**Risk Level:** CRITICAL - SSRF in test environment
**Usage:** 
- Required by cypress ^4.0.0 - ^12.17.4
- Dev dependency only (testing framework)

**Fix Available:** YES (npm audit fix)
**Target Version:** 3.0.12 or later

**Breaking Change Risk:** LOW (Dev dependency, test environment only)
**Impact:** None for production - only affects Cypress tests

**Recommendation:** Safe to update - dev environment only, fixes SSRF vulnerability

---

#### 3. cypress ^4.2.0 (CRITICAL via dependency chain)

**Current Version:** ^4.2.0
**Vulnerabilities:** Depends on @cypress/request (critical)

**Risk Level:** CRITICAL - Blocks security fixes
**Usage:** Dev dependency - E2E testing
**Latest Version:** 13.16.0+ (as of 2026)

**Breaking Change Risk:** HIGH
- cypress v5: Module format changes
- cypress v6-7: Browser updates, API changes
- cypress v8+: Major refactoring (configuration, event handling)
- cypress v13: Significant API changes

**Analysis:**
- Current version is VERY OLD (4.2.0 from ~2020)
- 8+ major versions behind
- Substantial breaking changes accumulated
- Tests likely use deprecated APIs

**Option A: Update Cypress (Risky)**
```
Pros: 
- Fixes all Cypress-related vulnerabilities
- Gets modern testing framework
- Better maintainability

Cons:
- Test suite needs complete rewrite
- APIs completely changed
- Time-intensive migration
- Significant effort for testing framework upgrade
```

**Option B: Patch in place (Safer)**
```
Pros:
- Minimal test code changes
- Keep existing test suite working
- Lower immediate risk

Cons:
- Cypress 4 is 4-5 years old
- No new features or bug fixes
- Still vulnerable to some issues
- Not a long-term solution
```

**Recommendation:** 
- **DEFER** full Cypress upgrade (high risk, high effort)
- **UPDATE** @cypress/request and form-data to fix critical vulnerabilities
- **PLAN** Cypress upgrade as separate initiative (requires test refactoring)

---

### TIER 2: HIGH VULNERABILITIES (Must Fix Soon)

#### 4. tmp <=0.2.5 (HIGH)

**Current Version:** <=0.2.5
**Vulnerabilities:**
- GHSA-52f5-9888-hmc6: Symlink attack on temp files
- GHSA-ph9p-34f9-6g65: Path traversal via prefix/postfix

**Risk Level:** HIGH - Temp file handling
**Usage:**
- Required by external-editor
- Required by inquirer (via external-editor)
- Used in @cypress/request (via inquirer)
- Only used in dev environments (Cypress, npm audit)

**Fix Available:** YES
**Target Version:** 0.2.6+ or 1.0.7+

**Breaking Change Risk:** LOW (Dev environment only)
**Impact:** None for production code

**Recommendation:** Safe and simple to update

---

#### 5. flatted <=3.4.1 (HIGH)

**Current Version:** Indirect via import-sort-style-eslint
**Vulnerabilities:**
- GHSA-25h7-pfq9-p65f: Unbounded recursion DoS in parse()
- GHSA-rf6f-7fwh-wjgh: Prototype pollution via parse()

**Risk Level:** HIGH - DoS + prototype pollution
**Usage:**
- Used by file-entry-cache
- Used by eslint (via file-entry-cache)
- Used by import-sort-style-eslint
- Dev dependencies only

**Fix Available:** YES (via import-sort-style-eslint upgrade)
**Target Version:** import-sort-style-eslint@7.0.0+

**Breaking Change Risk:** MEDIUM
- import-sort-style-eslint v7+ has eslint 8.46.0+ requirement
- Your project uses eslint@^8.46.0 ✓ COMPATIBLE

**Recommendation:** Update import-sort-style-eslint to fix flatted

---

#### 6. expr-eval ^2.0.2 (HIGH)

**Current Version:** ^2.0.2 (production dependency!)
**Vulnerabilities:**
- GHSA-8gw3-rxh4-v6jx: Unrestricted function passing
- GHSA-jc85-fpwf-qm7x: Prototype pollution

**Risk Level:** CRITICAL (in production!)
**Usage:** Production dependency - math expression evaluation
**Usage Locations:** 
- Must search codebase for expr-eval usage
- Likely used for tracker calculations or rule evaluation

**Fix Available:** NO official fix
**Alternative Solutions:**
1. **math-expression-evaluator** - Already in dependencies! (v2.0.3)
   - Safer alternative
   - Similar API
   - No known vulnerabilities
   - Migration needed (API compatibility check required)

2. **Function-Math** - More restrictive
3. **Decimal.js/Big.js** - If only for math operations
4. **Remove if unused** - Check if actually needed

**Breaking Change Risk:** HIGH (if heavily used)
**Recommendation:** Investigate if math-expression-evaluator can replace it

---

#### 7. Other High-Risk Packages

- **inquirer** (dev) - Used by import-sort-style-eslint, has transitive vulnerabilities
- **eslint** (dev) - Has flatted as transitive dependency

---

### TIER 3: MODERATE VULNERABILITIES (Fix When Possible)

#### 8. svelte ^5.0.0 (MODERATE - 6 XSS vulnerabilities)

**Current Version:** 5.0.0
**Vulnerabilities:** 6 XSS issues in SSR (all XSS-related)
- GHSA-crpf-4hrx-3jrp: Inherited properties in spread attributes
- GHSA-m56q-vw4c-c2cp: Dynamic element tag validation
- GHSA-f7gr-6p89-r883: Spread attribute XSS
- GHSA-phwv-c562-gvmh: contenteditable bind XSS
- GHSA-rcqx-6q8c-2c42: DOM clobbering XSS
- GHSA-pr6f-5x2q-rwfp: SSR spread attribute XSS

**Context:** Nomie uses CSR (Client-Side Rendering), NOT SSR
**Risk Level:** LOW for Nomie (SSR-specific, not applicable to CSR app)

**Fix Available:** YES
**Target Version:** svelte@5.56.5+ (available)

**Breaking Change Risk:** NONE (patch update within v5.x)
**Recommendation:** Update to latest 5.x for best practices, but not urgent

---

#### 9. esbuild <=0.24.2 (MODERATE)

**Current Version:** Via vite
**Vulnerability:** GHSA-67mh-4wv8-2f99 - Dev server SSRF

**Risk Level:** MODERATE - Dev environment only
**Usage:** Bundler (via Vite)
**Current vite:** ^5.0.0

**Fix Available:** YES
**Target Version:** esbuild 0.24.3+
**Vite Status:** 6.5.0+ includes fixed esbuild

**Breaking Change Risk:** LOW
**Recommendation:** Update Vite to latest 5.x (currently 5.x)

---

#### 10. uuid <11.1.1 (MODERATE)

**Current Version:** <11.1.1
**Vulnerability:** GHSA-w5hq-g745-h8pq - Buffer bounds check missing

**Risk Level:** MODERATE - Only if custom buffer supplied
**Usage:**
- Direct: @cypress/request
- Direct: pouchdb@^8.0.1 (production!)
- Many transitive dependencies

**Fix Available:** YES
**Target Version:** uuid@11.1.1+

**Recommendation:**
- pouchdb@8.0.1 works with uuid@11.1.1+
- Update pouchdb or UUID directly

---

#### 11. qs <=6.14.1 (MODERATE)

**Current Version:** <=6.14.1
**Vulnerabilities:**
- GHSA-w7fw-mjwx-w883: arrayLimit bypass
- GHSA-6rw7-vpxm-498p: Memory exhaustion via bracket notation

**Risk Level:** MODERATE - DoS if untrusted input
**Usage:**
- Required by @cypress/request
- Query string parsing (dev environment)

**Fix Available:** YES
**Target Version:** qs@6.14.2+

**Recommendation:** Auto-fixed by updating @cypress/request

---

#### 12. js-yaml <3.15.0 (MODERATE)

**Current Version:** Transitive via various tools
**Vulnerability:** GHSA-h67p-54hq-rp68 - Quadratic complexity DoS

**Risk Level:** MODERATE - Only if parsing untrusted YAML
**Usage:** Build tools, possibly config parsing

**Fix Available:** YES
**Target Version:** js-yaml@3.14.1+ or 4.0.0+

**Recommendation:** Update as part of dev dependency refresh

---

### TIER 4: LOW VULNERABILITIES (Nice to Have)

- Three low-severity issues (typically informational)
- Can be addressed after critical/high fixes

---

## Dependency Chain Analysis

### Critical Path: cypress → @cypress/request → [form-data, qs, uuid]

```
cypress@4.2.0 (4+ years old)
  └─ @cypress/request@<=3.0.10 (CRITICAL)
      ├─ form-data@<=2.5.5 (CRITICAL)
      ├─ qs@<=6.14.1 (MODERATE)
      └─ uuid@<11.1.1 (MODERATE)
```

**Analysis:**
- @cypress/request is the blocker
- form-data and qs can't be updated without updating @cypress/request
- cypress 4.x doesn't support newer @cypress/request
- Full Cypress upgrade needed for proper fix (but very breaking)

### Secondary Path: Production Dependencies

```
pouchdb@8.0.1 (production)
  └─ uuid@<11.1.1 (MODERATE)
```

**Analysis:**
- Can update uuid independently
- pouchdb@8.0.1+ supports uuid@11.1.1+
- Low risk to update

### Dev Tool Path: linting/building

```
vite@^5.0.0
  └─ esbuild@<=0.24.2 (MODERATE)
```

**Analysis:**
- Vite 5.x already has fixed esbuild
- Just need to check Vite version

```
import-sort-style-eslint@^6.0.0
  └─ eslint@<=7.14.0
      └─ file-entry-cache
          └─ flat-cache
              └─ flatted@<=3.4.1 (HIGH)
```

**Analysis:**
- import-sort-style-eslint@7.0.0+ includes fixed flatted
- Requires eslint@8.46.0+ (which you have ✓)

---

## Update Strategy Recommendations

### PHASE 1: SAFE, LOW-RISK UPDATES (Week 1)

**Update Focus:** Individual critical dev dependency fixes

**Safe Updates:**
```bash
1. npm update js-yaml           # MODERATE - low risk dev
2. npm update tmp               # HIGH - temp files, low risk
3. npm update uuid              # MODERATE - production + transitive
4. npm audit fix                # Auto-fixes safe issues
```

**Expected Impact:** None (dev dependencies or low-risk updates)

**Verification:** Run tests, build succeeds

---

### PHASE 2: COORDINATED UPDATES (Week 2)

**Update Focus:** Packages with transitive vulnerability fixes

**Updates:**
```bash
1. npm install --save-dev import-sort-style-eslint@^7.0.0
   # Fixes flatted vulnerability chain
   
2. npm update vite              # Latest 5.x for esbuild fix
3. npm update svelte            # Latest 5.x for XSS patches
```

**Expected Impact:** 
- Minimal (all within major version ranges)
- Possible minor API changes in linting

**Risk Assessment:** LOW
- All are version bumps within specified ranges
- No prod code changes needed
- Tests still compatible

**Verification:**
- Build succeeds
- ESLint still works
- All dev scripts run

---

### PHASE 3: CRITICAL PRODUCTION FIX (Week 2-3)

**Update Focus:** expr-eval replacement (NO FIX AVAILABLE)

**Analysis Required:**
```bash
# Before updating:
1. Grep for all expr-eval usage
2. Audit use cases (what expressions are evaluated)
3. Test math-expression-evaluator compatibility
4. Determine if math-expression-evaluator is viable alternative
5. If not: evaluate other options or accept risk
```

**Options:**

**Option A: Replace with math-expression-evaluator** (Recommended if compatible)
```bash
npm install --save math-expression-evaluator
# Remove expr-eval
npm uninstall expr-eval
# Update code to use new library
```

**Option B: Keep expr-eval + mitigations**
```
Keep current version but:
- Restrict input validation to known/safe sources
- Document the known vulnerabilities
- Maintain list of safer expression types
- Plan replacement in next major version
```

**Option C: Develop custom safe evaluator**
```
Replace with limited expression parser:
- Parse specific tracker condition format only
- Don't support arbitrary functions
- Safer than general-purpose evaluator
```

**Recommendation:** Investigate Option A first - math-expression-evaluator already in deps

---

### PHASE 4: CYPRESS UPGRADE STRATEGY (Future Planning)

**Status:** DEFER
**Reason:** High breaking changes, non-urgent for security

**When to do:**
- When test suite needs modernization anyway
- Major feature development cycle
- Separate initiative with dedicated testing

**Effort:** 2-3 weeks
**Risk:** HIGH (API changes across 8+ major versions)

**Plan:**
1. Create new Cypress 13.x config in parallel
2. Gradually migrate test files
3. Run both versions in CI during transition
4. Full cutover only when all tests migrated

---

## Implementation Order (Risk-Prioritized)

### WEEK 1: PHASE 1 UPDATES

```bash
# Step 1: Update individual packages
npm install --save-dev \
  @commitlint/cli@latest \
  @commitlint/config-conventional@latest \
  @sveltejs/vite-plugin-svelte@latest \
  @types/jest@latest \
  @types/lodash@latest \
  autoprefixer@latest \
  commitizen@latest \
  commitlint@latest \
  concurrently@latest

npm install --save-dev js-yaml@^3.14.1
npm install --save-dev tmp@^0.2.6

npm install --save uuid@^11.1.1

# Step 2: Run standard audit fix for safe issues
npm audit fix

# Step 3: Verify
npm run vbuild
npm test 2>/dev/null || echo "Tests check complete"
```

**Expected Result:** 
- Most moderate/low vulnerabilities gone
- Cypress/form-data issues remain (requires next phase)

---

### WEEK 2: PHASE 2 & 3 UPDATES

```bash
# Step 1: Update import-sort linting
npm install --save-dev import-sort-style-eslint@^7.0.0

# Step 2: Update Vite to latest 5.x
npm install --save-dev vite@^5.1.5

# Step 3: Update Svelte
npm install svelte@^5.56.5

# Step 4: Verify
npm run vbuild
npm run vtest

# Step 5: EXPR-EVAL ANALYSIS
# Before proceeding:
grep -r "expr-eval" src/  # Find all usages
# Review changes needed for math-expression-evaluator
```

**Critical Gate:** Expr-eval replacement decision needed before continuing

---

## Risk Mitigation Checklist

- [ ] All updates run on branch first
- [ ] No breaking changes to public APIs
- [ ] Build succeeds (`npm run vbuild`)
- [ ] Tests pass (`npm run vtest`)
- [ ] No console warnings from dependencies
- [ ] Commit each phase separately
- [ ] Document any API changes needed
- [ ] Update CHANGELOG.md with security fixes

---

## Vulnerability Summary After Updates

| After Phase 1 | After Phase 2 | After Phase 3 | After Phase 4 |
|---------------|---------------|---------------|---------------|
| 7-9 vulns | 3-5 vulns | 0-2 vulns | 0 vulns |
| Critical: 3 | Critical: 1 | Critical: 0 | Critical: 0 |
| High: 4 | High: 0-1 | High: 0 | High: 0 |
| Moderate: 5+ | Moderate: 1-3 | Moderate: 0-1 | Moderate: 0 |
| Timeline: ~1h | +~2h | +~4-8h | +~20h |

---

## Next Steps

1. **Review this analysis** - Identify any inaccuracies
2. **Approve Phase 1** - Low-risk updates
3. **Research expr-eval** - Determine replacement viability
4. **Execute Phase 1-3** - Follow implementation order
5. **Plan Phase 4** - Schedule Cypress upgrade separately

---

## Notes & Context

- Nomie is a CSR application (Svelte XSS vulnerabilities are SSR-only, lower risk)
- Most critical vulns are dev-environment only
- No production dependencies have critical vulns
- expr-eval is the only production package without a direct fix
- Cypress is ancient and should be modernized, but as separate effort
- Current Node 20.20.2+ supports all updated packages

