# Security Vulnerabilities - Post-Launch Fix

## npm audit findings (6 vulnerabilities):

### Moderate Severity (5):
1. **esbuild <=0.24.2**: Development server security issue
   - Impact: Only affects local development
   - Fix: Update to esbuild 0.24.3+ after deployment
   - Risk: LOW (not in production)

2-5. **vite/vitest dependencies**: Depend on vulnerable esbuild
   - Same as above

### High Severity (1):
6. **xlsx**: Prototype pollution + ReDoS
   - Impact: Only if processing untrusted Excel files
   - Current usage: None in production code
   - Fix: Remove xlsx or update after testing
   - Risk: LOW (not actively used)

## Action Plan:
- Week 1: Update non-breaking dependencies
- Week 2: Test esbuild/vite updates in staging
- Week 3: Deploy updated dependencies

## Rationale:
Fixing these requires `npm audit fix --force` which might break build. Too risky for tomorrow's deployment.