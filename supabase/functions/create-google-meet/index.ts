import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CreateMeetRequest {
  sessionTitle: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  attendees?: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create supabase client with user's token
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const body: CreateMeetRequest = await req.json();
    const { sessionTitle, sessionDate, startTime, endTime, attendees = [] } = body;

    if (!sessionTitle || !sessionDate || !startTime || !endTime) {
      throw new Error("Missing required fields: sessionTitle, sessionDate, startTime, endTime");
    }

    // Check if user has stored Google tokens
    const { data: tokens, error: tokensError } = await supabase
      .from("user_google_tokens")
      .select("access_token, refresh_token, expires_at")
      .eq("user_id", user.id)
      .single();

    if (tokensError || !tokens) {
      // No tokens stored - return auth URL for OAuth flow
      const redirectUri = `${SUPABASE_URL}/functions/v1/google-calendar-callback`;
      const scope = encodeURIComponent("https://www.googleapis.com/auth/calendar.events");
      const state = encodeURIComponent(JSON.stringify({ userId: user.id, returnUrl: req.headers.get("origin") || "" }));
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${scope}` +
        `&access_type=offline` +
        `&prompt=consent` +
        `&state=${state}`;

      return new Response(
        JSON.stringify({ 
          needsAuth: true, 
          authUrl,
          message: "Veuillez autoriser l'accès à Google Calendar" 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Check if token is expired
    let accessToken = tokens.access_token;
    if (new Date(tokens.expires_at) <= new Date()) {
      // Refresh the token
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: tokens.refresh_token,
          grant_type: "refresh_token",
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        console.error("Token refresh failed:", error);
        throw new Error("Failed to refresh Google token. Please re-authorize.");
      }

      const newTokens = await tokenResponse.json();
      accessToken = newTokens.access_token;

      // Update stored tokens
      await supabase
        .from("user_google_tokens")
        .update({
          access_token: newTokens.access_token,
          expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
        })
        .eq("user_id", user.id);
    }

    // Create Google Calendar event with Meet link
    const startDateTime = `${sessionDate}T${startTime}:00`;
    const endDateTime = `${sessionDate}T${endTime}:00`;

    const eventBody = {
      summary: sessionTitle,
      description: `Séance de cours - ${sessionTitle}`,
      start: {
        dateTime: startDateTime,
        timeZone: "Africa/Casablanca",
      },
      end: {
        dateTime: endDateTime,
        timeZone: "Africa/Casablanca",
      },
      conferenceData: {
        createRequest: {
          requestId: `courspro-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      attendees: attendees.map((email) => ({ email })),
    };

    const calendarResponse = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventBody),
      }
    );

    if (!calendarResponse.ok) {
      const error = await calendarResponse.text();
      console.error("Calendar API error:", error);
      throw new Error(`Failed to create Google Calendar event: ${error}`);
    }

    const event = await calendarResponse.json();
    const meetLink = event.conferenceData?.entryPoints?.find(
      (ep: { entryPointType: string }) => ep.entryPointType === "video"
    )?.uri;

    if (!meetLink) {
      throw new Error("Google Meet link was not generated");
    }

    return new Response(
      JSON.stringify({
        success: true,
        meetLink,
        eventId: event.id,
        eventHtmlLink: event.htmlLink,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating Google Meet:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
