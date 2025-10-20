#!/usr/bin/env node
// Toggle tester status for a user by email: sets or unsets `is_tester` in `public.creators`.
// Usage:
//   node scripts/set-tester.js user@example.com           # set tester
//   node scripts/set-tester.js user@example.com --unset   # unset tester

import 'dotenv/config';
import { supabaseAdmin } from '../src/backend/config/db.js';

const die = (msg, code = 1) => {
  console.error(msg);
  process.exit(code);
};

const parseArgs = () => {
  const [, , email, flag] = process.argv;
  if (!email || email.startsWith('-')) {
    die('Usage: node scripts/set-tester.js <email> [--unset]');
  }
  const unset = flag === '--unset';
  return { email, unset };
};

const main = async () => {
  try {
    const { email, unset } = parseArgs();

    // 1) Find auth user by email
    const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    if (userErr) die(`Auth lookup failed: ${userErr.message}`);
    if (!userData?.user) die(`No auth user found for email: ${email}`);

    const userId = userData.user.id;

    // 2) Try update creators row
    const { data: updated, error: updErr } = await supabaseAdmin
      .from('creators')
      .update({ is_tester: !unset })
      .eq('user_id', userId)
      .select('id, user_id, is_tester')
      .limit(1);

    if (updErr) die(`Update failed: ${updErr.message}`);

    if (updated && updated.length > 0) {
      console.log(`Success: user_id=${userId} is_tester=${!unset}`);
      process.exit(0);
    }

    // 3) If no row existed, insert minimal creators row
    const { data: inserted, error: insErr } = await supabaseAdmin
      .from('creators')
      .insert([{ user_id: userId, is_tester: !unset }])
      .select('id, user_id, is_tester')
      .limit(1);

    if (insErr) die(`Insert failed: ${insErr.message}`);
    console.log(`Created creators row and set is_tester=${!unset} for user_id=${userId}`);
    process.exit(0);
  } catch (err) {
    die(`Error: ${err instanceof Error ? err.message : String(err)}`);
  }
};

await main();


