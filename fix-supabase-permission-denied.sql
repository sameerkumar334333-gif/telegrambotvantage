-- Fix "permission denied for table submissions" (GRANT privileges) + RLS policies
-- Run in Supabase SQL Editor
--
-- Why this happens:
-- - RLS policies control ROW access, but you ALSO need table privileges (GRANT).
-- - Your bot was using the anon key, so role = 'anon' and needs GRANT + policy.
--
-- Recommended production approach:
-- - Use SUPABASE_SERVICE_ROLE_KEY in backend (bypasses RLS).
-- - Keep anon access locked down for public clients.
--
-- If you still want anon/authenticated to access these tables, run below.

-- 1) GRANTS (fixes "permission denied")
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.submissions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.messages TO anon, authenticated;

-- 2) RLS POLICIES (fixes "new row violates row-level security policy" etc.)
-- Ensure RLS is enabled (already enabled in your schema, but safe to re-run)
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Submissions policies
DROP POLICY IF EXISTS "anon can select submissions" ON public.submissions;
DROP POLICY IF EXISTS "anon can insert submissions" ON public.submissions;
DROP POLICY IF EXISTS "authenticated can select submissions" ON public.submissions;
DROP POLICY IF EXISTS "authenticated can insert submissions" ON public.submissions;

CREATE POLICY "anon can select submissions" ON public.submissions
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon can insert submissions" ON public.submissions
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "authenticated can select submissions" ON public.submissions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated can insert submissions" ON public.submissions
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Messages policies
DROP POLICY IF EXISTS "anon can select messages" ON public.messages;
DROP POLICY IF EXISTS "anon can insert messages" ON public.messages;
DROP POLICY IF EXISTS "authenticated can select messages" ON public.messages;
DROP POLICY IF EXISTS "authenticated can insert messages" ON public.messages;

CREATE POLICY "anon can select messages" ON public.messages
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon can insert messages" ON public.messages
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "authenticated can select messages" ON public.messages
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated can insert messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 3) Verify
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename IN ('submissions', 'messages')
ORDER BY tablename, policyname;

