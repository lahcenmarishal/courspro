import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CreateUserBody = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: "admin" | "teacher" | "student" | "parent";
  phone?: string;
  city?: string;
  selected_plan?: string;
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

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const body = (await req.json()) as CreateUserBody;
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    const first_name = (body.first_name ?? "").trim();
    const last_name = (body.last_name ?? "").trim();
    const role = body.role ?? "student";
    const phone = (body.phone ?? "").trim();
    const city = (body.city ?? "").trim();
    const selected_plan = (body.selected_plan ?? "").trim();

    if (!email || !password || password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Email et mot de passe requis (min 6 caractères)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!first_name || !last_name) {
      return new Response(
        JSON.stringify({ error: "Prénom et nom requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: created, error: createError } = await supabaseAdmin.auth.admin
      .createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { first_name, last_name, phone, city, selected_plan },
      });

    if (createError || !created.user) {
      return new Response(
        JSON.stringify({ error: createError?.message ?? "Impossible de créer l'utilisateur" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userId = created.user.id;

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      user_id: userId,
      first_name,
      last_name,
      email,
      phone: phone || null,
      city: city || null,
      selected_plan: selected_plan || null,
    }, { onConflict: 'user_id' });

    if (profileError) {
      console.error("Profile error:", profileError);
    }

    const { error: roleInsertError } = await supabaseAdmin.from("user_roles").insert({
      user_id: userId,
      role: role,
      status: "approved",
    });

    if (roleInsertError) {
      return new Response(
        JSON.stringify({ error: roleInsertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // If student with a plan, create subscription
    if (role === "student" && selected_plan) {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 1);

      await supabaseAdmin.from("subscriptions").insert({
        student_id: userId,
        type: "monthly",
        status: "active",
        price_paid: 0,
        start_date: now.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        user_id: userId,
        email,
        role,
        message: `Utilisateur ${first_name} ${last_name} (${role}) créé avec succès`,
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
