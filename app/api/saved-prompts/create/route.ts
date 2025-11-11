import { createClient } from '@supabase/supabase-js';

type RequestBody = {
  prompt_id?: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  });
}

export async function POST(req: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonResponse({ error: 'Supabase environment variables are not configured.' }, { status: 500 });
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!body.prompt_id || typeof body.prompt_id !== 'string') {
    return jsonResponse({ error: 'prompt_id is required.' }, { status: 400 });
  }

  const baseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: req.headers.get('Authorization') ?? '',
      },
    },
  });

  const {
    data: { session },
    error: sessionError,
  } = await baseClient.auth.getSession();

  if (sessionError) {
    return jsonResponse({ error: sessionError.message }, { status: 500 });
  }

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const rlsClient = createClient(supabaseUrl, session.access_token, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  });

  const { error: insertError } = await rlsClient
    .from('saved_prompts')
    .insert({
      user_id: session.user.id,
      prompt_id: body.prompt_id,
    })
    .select('id')
    .maybeSingle();

  if (insertError) {
    if (insertError.code === '23505') {
      return jsonResponse({ success: true, message: 'Already saved' }, { status: 200 });
    }
    return jsonResponse({ error: insertError.message }, { status: 500 });
  }

  return jsonResponse({ success: true }, { status: 200 });
}



