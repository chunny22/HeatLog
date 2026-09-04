// Supabase Edge Function (Deno). Deploy with: supabase functions deploy day-insight
// Requires the GEMINI_API_KEY secret: supabase secrets set GEMINI_API_KEY=<key>
//
// Holds the Gemini API key server-side so it's never exposed to the browser.
// Stateless: the client sends the day's exercise summary, this just forwards
// a prompt to Gemini and returns the text — no database access needed here.

const GOAL_LABELS: Record<string, string> = {
  lose_weight: 'losing weight (fat loss)',
  build_muscle: 'building muscle (hypertrophy)',
  lean_tone: 'getting lean and toned (recomposition)',
  bulk_strength: 'bulking / gaining strength',
  general_fitness: 'general fitness',
}

interface ExerciseSummary {
  name: string
  category: string
  muscles: string[]
}

interface RequestBody {
  goals: string[]
  exercises: ExerciseSummary[]
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { goals, exercises }: RequestBody = await req.json()

    if (!exercises || exercises.length === 0) {
      return new Response(JSON.stringify({ error: 'No exercises provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const goalLabels = (goals && goals.length > 0 ? goals : ['general_fitness']).map(
      (g) => GOAL_LABELS[g] ?? 'general fitness',
    )
    const exerciseList = exercises
      .map((e) => `- ${e.name} (${e.category}; targets: ${e.muscles.join(', ')})`)
      .join('\n')

    const prompt = `You are a friendly, encouraging personal trainer reviewing a single day of a client's workout log.

Client's goals: ${goalLabels.join(' and ')}.

Today's exercises:
${exerciseList}

In 1-2 short sentences (max ~40 words total), tell the client whether today's workout adequately covers their goals, and briefly name anything obviously missing (e.g. a muscle group or training type left uncovered). If they have multiple goals, weigh the tradeoffs briefly rather than listing each separately. Be specific but concise. Casual, encouraging tone. Do not use markdown, headers, or bullet points — plain sentences only.`

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured')
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          // This model still "thinks" before answering (every current Gemini model
          // does, even Lite -- thinkingBudget: 0 is rejected as invalid on all of
          // them), but it's far lighter about it than the full "flash" tier: ~1s
          // vs ~5s for this prompt in testing, with equivalent answer quality.
          generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
        }),
      },
    )

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      throw new Error(`Gemini API error: ${geminiRes.status} ${errText}`)
    }

    const geminiData = await geminiRes.json()
    const insight: string = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''

    if (!insight) {
      throw new Error('Gemini returned an empty response')
    }

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
