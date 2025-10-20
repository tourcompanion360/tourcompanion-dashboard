# Rollback Plan - If Issues Occur

## Immediate Rollback (< 5 minutes):
If admin panel or app breaks after migration:

1. Connect to Supabase SQL Editor
2. Run rollback migration: `supabase/migrations/[timestamp]_rollback_rls_optimization.sql`
3. Verify admin panel works
4. Notify team

## Partial Rollback:
If only specific table has issues:

```sql
-- Example: Rollback projects table only
DROP POLICY IF EXISTS "Creators can manage projects of their clients" ON public.projects;
CREATE POLICY "Creators can manage projects of their clients" ON public.projects
FOR ALL USING (
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);
```

## Full System Rollback:

If database corruption occurs (unlikely):

1. Supabase Dashboard > Settings > Database
2. Restore from latest backup (before migration)
3. Re-run previous migrations only
4. Test thoroughly before resuming