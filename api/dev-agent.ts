/** @doc Serverless endpoint driving the Dev Agent (start / step / status / stop). */
import { handleDevAgent, type DevAgentPayload } from "../src/lib/devagent/core";

export const config = { runtime: "nodejs", maxDuration: 300 };

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
  try {
    const payload = (await req.json().catch(() => null)) as DevAgentPayload | null;
    const result = await handleDevAgent(payload);
    return new Response(JSON.stringify(result.body), { status: result.status, headers: cors });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Dev agent failed";
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: cors });
  }
}
