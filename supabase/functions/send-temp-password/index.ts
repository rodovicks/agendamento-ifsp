// Edge Function: send-temp-password
// Fluxo: recebe email, gera senha temporária, atualiza usuário via Admin API
// e envia email com a senha. Não revela se o email existe (resposta sempre 200 quando possível).

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GOTRUE_URL = Deno.env.get('GOTRUE_URL') ?? `${SUPABASE_URL}/auth/v1`;

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY'); // opcional
const RESEND_FROM = Deno.env.get('RESEND_FROM') ?? 'no-reply@example.com';

function genTempPassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()';
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  let out = '';
  for (let i = 0; i < length; i++) out += chars[arr[i] % chars.length];
  return out;
}

async function findUserByEmail(email: string) {
  const url = `${GOTRUE_URL}/admin/users?email=${encodeURIComponent(email)}`;
  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE}`,
      apikey: SERVICE_ROLE,
    },
  });
  if (!resp.ok) {
    // Pode ser 404 se não existir; tratamos acima
    return { ok: false, status: resp.status } as const;
  }
  const json = await resp.json();
  const user = Array.isArray(json?.users) ? json.users[0] : json;
  if (!user?.id) return { ok: true, user: null } as const;
  return { ok: true, user } as const;
}

async function updateUserPassword(userId: string, password: string) {
  const url = `${GOTRUE_URL}/admin/users/${userId}`;
  const resp = await fetch(url, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${SERVICE_ROLE}`,
      apikey: SERVICE_ROLE,
    },
    body: JSON.stringify({ password, user_metadata: { must_change_password: true } }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Falha ao atualizar senha: ${resp.status} ${text}`);
  }
}

async function sendEmailViaResend(to: string, tempPassword: string) {
  if (!RESEND_API_KEY) return; // opcional
  const subject = 'Sua senha temporária';
  const html = `
    <p>Recebemos uma solicitação de recuperação de senha para este email.</p>
    <p>Sua senha temporária é: <strong>${tempPassword}</strong></p>
    <p>Use-a para entrar e, em seguida, você deverá definir uma nova senha.</p>
  `;
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: RESEND_FROM, to, subject, html }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    // Não falha o fluxo por causa do email; apenas loga
    console.error('Falha ao enviar email:', resp.status, text);
  }
}

serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { email } = await req.json().catch(() => ({}));
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'email_required' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Busca o usuário por email (não revelar existência)
    const found = await findUserByEmail(email);
    if (!found.ok) {
      // Ainda respondemos 200 para não vazar enumeração
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    if (found.user?.id) {
      const tmp = genTempPassword(12);
      await updateUserPassword(found.user.id, tmp);
      await sendEmailViaResend(email, tmp);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    console.error('send-temp-password error', e);
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
});

