import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
    const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      throw new Error("Google OAuth credentials not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const stateParam = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      console.error("OAuth error:", error);
      return new Response(
        `<html><body><script>
          window.opener?.postMessage({ type: 'google-oauth-error', error: '${error}' }, '*');
          window.close();
        </script><p>Erreur d'authentification. Cette fenêtre va se fermer.</p></body></html>`,
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    if (!code || !stateParam) {
      throw new Error("Missing code or state parameter");
    }

    const state = JSON.parse(decodeURIComponent(stateParam));
    const { userId, returnUrl } = state;

    if (!userId) {
      throw new Error("Missing userId in state");
    }

    // Exchange code for tokens
    const redirectUri = `${SUPABASE_URL}/functions/v1/google-calendar-callback`;
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      throw new Error("Failed to exchange authorization code");
    }

    const tokens = await tokenResponse.json();

    // Store tokens in database
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { error: upsertError } = await supabase
      .from("user_google_tokens")
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (upsertError) {
      console.error("Error storing tokens:", upsertError);
      throw new Error("Failed to store tokens");
    }

    // Return success page that communicates with opener
    const successHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Autorisation r&eacute;ussie</title>
<style>
body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0f0f0; }
.card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
.success { color: #10b981; font-size: 3rem; }
h1 { margin: 1rem 0 0.5rem; }
p { color: #666; }
</style>
</head>
<body>
<div class="card">
<div class="success">&#10003;</div>
<h1>Autorisation r&eacute;ussie</h1>
<p>Vous pouvez fermer cette fen&ecirc;tre.</p>
</div>
<script>
window.opener?.postMessage({ type: 'google-oauth-success' }, '*');
setTimeout(function() { window.close(); }, 2000);
</script>
</body>
</html>`;

    return new Response(successHtml, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("Callback error:", error);
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"></head><body><script>
        window.opener?.postMessage({ type: 'google-oauth-error', error: '${errMsg.replace(/'/g, "\\'")}' }, '*');
        window.close();
      </script><p>Erreur. Cette fen&ecirc;tre va se fermer.</p></body></html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
});
