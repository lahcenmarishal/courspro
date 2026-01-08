// Supabase Edge Function (Deno) - Bootstrap initial admin account
// This endpoint is intentionally public BUT can only be used when no admin exists yet.
// It creates the first admin user + profile + role.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type BootstrapBody = {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const body = (await req.json()) as BootstrapBody;
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    const first_name = body.first_name ?? "Admin";
    const last_name = body.last_name ?? "Principal";

    if (!email || !password || password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Safety check: allow bootstrap ONLY if there is no admin yet
    const { data: existingAdmin, error: adminCheckError } = await supabase
      .from("user_roles")
      .select("id")
      .eq("role", "admin")
      .limit(1);

    if (adminCheckError) {
      return new Response(
        JSON.stringify({ error: adminCheckError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (existingAdmin && existingAdmin.length > 0) {
      return new Response(
        JSON.stringify({ error: "Admin already exists" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: created, error: createError } = await supabase.auth.admin
      .createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name,
          last_name,
        },
      });

    if (createError || !created.user) {
      return new Response(
        JSON.stringify({ error: createError?.message ?? "User not created" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const userId = created.user.id;

    // Create profile row
    await supabase.from("profiles").insert({
      user_id: userId,
      first_name,
      last_name,
      email,
    });

    // Create admin role
    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: "admin",
    });

    if (roleError) {
      return new Response(
        JSON.stringify({ error: roleError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({ ok: true, user_id: userId, email }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
