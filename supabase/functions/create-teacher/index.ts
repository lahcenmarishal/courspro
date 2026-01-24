// Supabase Edge Function - Create a teacher account with full authentication
// This endpoint is restricted to admin users only.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type CreateTeacherBody = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  bio?: string;
  specialization?: string;
  diploma?: string;
  years_experience?: number;
  city?: string;
  address?: string;
  certificates_url?: string;
  avatar_url?: string;
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

    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Extract the token and verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: callerUser }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !callerUser) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is an admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: "Unauthorized - Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const body = (await req.json()) as CreateTeacherBody;
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    const first_name = (body.first_name ?? "").trim();
    const last_name = (body.last_name ?? "").trim();

    // Validate required fields
    if (!email || !password || password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Email et mot de passe requis (min 6 caractères)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!first_name || !last_name) {
      return new Response(
        JSON.stringify({ error: "Prénom et nom requis" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create the user in auth.users
    const { data: created, error: createError } = await supabaseAdmin.auth.admin
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
        JSON.stringify({ error: createError?.message ?? "Impossible de créer l'utilisateur" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const userId = created.user.id;

    // Create profile row (note: handle_new_user trigger may already create one)
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      user_id: userId,
      first_name,
      last_name,
      email,
      phone: body.phone || null,
      bio: body.bio || null,
      specialization: body.specialization || null,
      diploma: body.diploma || null,
      years_experience: body.years_experience || 0,
      city: body.city || null,
      address: body.address || null,
      certificates_url: body.certificates_url || null,
      avatar_url: body.avatar_url || null,
    }, { onConflict: 'user_id' });

    if (profileError) {
      console.error("Profile error:", profileError);
    }

    // Create teacher role with approved status
    const { error: roleInsertError } = await supabaseAdmin.from("user_roles").insert({
      user_id: userId,
      role: "teacher",
      status: "approved",
    });

    if (roleInsertError) {
      return new Response(
        JSON.stringify({ error: roleInsertError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({ 
        ok: true, 
        user_id: userId, 
        email,
        message: `Enseignant ${first_name} ${last_name} créé avec succès. Il peut se connecter avec: ${email}` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
