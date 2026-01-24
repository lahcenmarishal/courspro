// Supabase Edge Function - Update or Create teacher auth
// This endpoint is restricted to admin users only.
// If the teacher has no auth account, it creates one. If they do, it updates the password.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type UpdatePasswordBody = {
  profile_id: string;
  email: string;
  new_password: string;
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
    const body = (await req.json()) as UpdatePasswordBody;
    const { profile_id, email, new_password } = body;

    // Validate required fields
    if (!profile_id || !email || !new_password || new_password.length < 6) {
      return new Response(
        JSON.stringify({ error: "profile_id, email et new_password requis (min 6 caractères)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get the teacher's profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", profile_id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Profil enseignant non trouvé" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify the profile is a teacher
    const { data: teacherRole, error: teacherRoleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", profile.user_id)
      .eq("role", "teacher")
      .maybeSingle();

    if (teacherRoleError || !teacherRole) {
      return new Response(
        JSON.stringify({ error: "Cet utilisateur n'est pas un enseignant" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if the user_id corresponds to an actual auth user
    const { data: authUserData } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
    
    if (authUserData?.user) {
      // User exists in auth, just update the password and email
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        profile.user_id,
        { 
          password: new_password,
          email: email,
          email_confirm: true
        }
      );

      if (updateError) {
        return new Response(
          JSON.stringify({ error: updateError.message }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Update email in profile if changed
      if (profile.email !== email) {
        await supabaseAdmin
          .from("profiles")
          .update({ email: email })
          .eq("id", profile_id);
      }

      return new Response(
        JSON.stringify({ 
          ok: true, 
          message: "Mot de passe mis à jour avec succès",
          email: email
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } else {
      // User doesn't exist in auth, create a new auth user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: new_password,
        email_confirm: true,
        user_metadata: {
          first_name: profile.first_name,
          last_name: profile.last_name,
        },
      });

      if (createError) {
        return new Response(
          JSON.stringify({ error: createError.message }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      if (!newUser.user) {
        return new Response(
          JSON.stringify({ error: "Échec de la création du compte" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const newUserId = newUser.user.id;

      // Update the profile with the new user_id and email
      const { error: updateProfileError } = await supabaseAdmin
        .from("profiles")
        .update({ 
          user_id: newUserId,
          email: email
        })
        .eq("id", profile_id);

      if (updateProfileError) {
        console.error("Error updating profile:", updateProfileError);
      }

      // Update the user_role with the new user_id
      const { error: updateRoleError } = await supabaseAdmin
        .from("user_roles")
        .update({ user_id: newUserId })
        .eq("user_id", profile.user_id);

      if (updateRoleError) {
        console.error("Error updating role:", updateRoleError);
      }

      return new Response(
        JSON.stringify({ 
          ok: true, 
          message: "Compte créé avec succès",
          email: email
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
