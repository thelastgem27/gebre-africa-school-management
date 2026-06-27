import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function getAuthUser(authHeader?: string): Promise<{ id: string; email?: string } | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function verifyAuthUserId(authUserId: string): Promise<{ id: string; email?: string } | null> {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(authUserId);
    if (error || !data?.user) return null;
    return { id: data.user.id, email: data.user.email };
  } catch { return null; }
}
