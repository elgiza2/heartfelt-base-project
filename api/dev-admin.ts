/** @doc Vercel serverless endpoint backing the Freestyle key pool on the /m page. */
import { handleDevAdmin, type DevAdminPayload } from "../src/lib/devagent/adminCore";

export const config = { runtime: "nodejs" };

export default async function handler(req: Request): Promise<Response> {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: cors });
  }
  const payload = (await req.json().catch(() => null)) as DevAdminPayload | null;
  const result = await handleDevAdmin(payload, process.env.M_ADMIN_PASSWORD);
  return new Response(JSON.stringify(result.body), { status: result.status, headers: cors });
}
