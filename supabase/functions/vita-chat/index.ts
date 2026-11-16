// Función segura de VITA. La clave ANTHROPIC_API_KEY vive solo aquí (secreto de Supabase), nunca en el frontend.
// Despliegue: supabase functions deploy vita-chat && supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { mode = 'chat', messages = [], answers = null } = await req.json();
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return json({ demo: true, reply: '' }); // sin credenciales: el frontend usa modo demostración

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { data: services } = await supabase
      .from('services').select('id,name,category,description,duration_minutes,price_cop').eq('active', true);

    const catalog = (services ?? [])
      .map((s) => `- [${s.id}] ${s.name} (${s.category}) · ${s.duration_minutes} min · COP ${s.price_cop} · ${s.description}`)
      .join('\n') || '(catálogo vacío)';

    const system = `Eres VITA, asesora virtual de Vitalia Beauty Experience (salón de belleza en Barranquilla, Colombia).
Tono: amable, profesional y cercano. Responde en español, breve (máx. 120 palabras).
Usa SOLO los servicios y precios del catálogo siguiente; nunca inventes servicios, precios ni horarios.
Si algo no está en el catálogo, dilo y sugiere contactar por WhatsApp. Para reservar: elegir servicio, fecha y hora en la sección Reservas.
CATÁLOGO:\n${catalog}`;

    let msgs = messages.slice(-10).map((m: any) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content ?? '').slice(0, 1500) }));
    let extra = '';
    if (mode === 'recommend') {
      extra = '\nResponde ÚNICAMENTE con JSON válido: {"ids":["id1","id2","id3"],"reason":"..."} usando ids del catálogo (máx. 4).';
      msgs = [{ role: 'user', content: `Respuestas de la clienta: ${JSON.stringify(answers)}` }];
    }
    if (!msgs.length || msgs[0].role !== 'user') return json({ error: 'Mensaje inválido' }, 400);

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-haiku-5-5', max_tokens: 500, system: system + extra, messages: msgs }),
    });
    if (!r.ok) return json({ demo: true, reply: '' });
    const out = await r.json();
    const text = (out.content ?? []).map((b: any) => b.text ?? '').join('');
    if (mode === 'recommend') {
      try { return json({ demo: false, ...JSON.parse(text.replace(/```json|```/g, '').trim()) }); }
      catch { return json({ demo: true }); }
    }
    return json({ demo: false, reply: text });
  } catch (_e) {
    return json({ demo: true, reply: '' });
  }
});
