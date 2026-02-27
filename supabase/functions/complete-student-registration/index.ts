import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Body = {
  first_name?: string;
  last_name?: string;
  email?: string;
  city?: string;
  phone?: string;
  selected_plan?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json().catch(() => ({}))) as Body;

    const first_name = body.first_name?.trim() || (user.user_metadata?.first_name as string) || "";
    const last_name = body.last_name?.trim() || (user.user_metadata?.last_name as string) || "";
    const email = body.email?.trim().toLowerCase() || user.email || "";
    const city = body.city?.trim() || null;
    const phone = body.phone?.trim() || null;
    const selected_plan = body.selected_plan?.trim() || null;

    const { data: existingRoles, error: existingRolesError } = await supabaseAdmin
      .from("user_roles")
      .select("role, status")
      .eq("user_id", user.id);

    if (existingRolesError) {
      return new Response(JSON.stringify({ error: existingRolesError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hasPrivilegedRole = (existingRoles || []).some((r) => r.role === "admin" || r.role === "teacher");
    if (hasPrivilegedRole) {
      return new Response(
        JSON.stringify({ error: "This endpoint is only for student registration completion" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          user_id: user.id,
          first_name,
          last_name,
          email,
          city,
          phone,
          selected_plan,
        },
        { onConflict: "user_id" },
      );

    if (profileError) {
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const existingStudentRole = (existingRoles || []).find((r) => r.role === "student");

    if (!existingStudentRole) {
      const { error: roleInsertError } = await supabaseAdmin.from("user_roles").insert({
        user_id: user.id,
        role: "student",
        status: "pending",
      });

      if (roleInsertError) {
        return new Response(JSON.stringify({ error: roleInsertError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        user_id: user.id,
        role: "student",
        status: existingStudentRole?.status ?? "pending",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
