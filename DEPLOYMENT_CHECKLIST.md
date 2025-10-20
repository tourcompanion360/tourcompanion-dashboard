# Production Deployment Checklist

## Pre-Deployment (T-1 hour):
- [ ] Backup current database (Supabase auto-backup)
- [ ] Review all migration files
- [ ] Test migrations on local/staging database
- [ ] Verify admin panel test checklist ready
- [ ] Notify team of deployment window

## Deployment (T-0):
- [ ] Run migration 1: RLS performance optimization
- [ ] Run migration 2: Consolidate duplicate policies
- [ ] Run migration 3: Remove unused indexes
- [ ] Run manual: Remove dev mode policies (SQL Editor)
- [ ] Enable: Auth leaked password protection (Dashboard)
- [ ] Enable: Additional MFA options (Dashboard)

## Post-Deployment (T+15min):
- [ ] Run admin panel test checklist
- [ ] Run database health check queries
- [ ] Monitor error logs for 30 minutes
- [ ] Test creator dashboard performance
- [ ] Test end client portal access
- [ ] Verify analytics functions work

## Success Criteria:
- [ ] Admin panel fully functional
- [ ] Page load times 50-70% faster
- [ ] No RLS policy errors
- [ ] All Supabase advisor warnings cleared (except unused indexes INFO level)
- [ ] Zero application errors in logs

## If Issues:
- [ ] Execute rollback plan immediately
- [ ] Document issue in `DEPLOYMENT_ISSUES.md`
- [ ] Schedule fix for next deployment