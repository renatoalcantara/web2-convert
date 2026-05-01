import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { conversions } from "@/db/schema";
import { genai, MODEL } from "@/lib/gemini";
import { MODERN_SYSTEM_PROMPT, MODERN_USER_PROMPT_PREFIX } from "@/lib/prompts";
import { stripHtmlFences } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [conv] = await db.select().from(conversions).where(eq(conversions.id, id)).limit(1);
  if (!conv) return new Response("not found", { status: 404 });
  if (!conv.retroHtml) return new Response("retro not ready", { status: 409 });

  if (conv.modernHtml) {
    return new Response(sse({ type: "complete", html: conv.modernHtml }), { headers: sseHeaders() });
  }

  const imageBytes = await fetch(conv.imageUrl).then((r) => r.arrayBuffer());
  const imageBase64 = Buffer.from(imageBytes).toString("base64");

  await db.update(conversions).set({ status: "modern_streaming", updatedAt: new Date() }).where(eq(conversions.id, id));

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (event: object) => controller.enqueue(enc.encode(sse(event)));
      let collected = "";

      try {
        const response = await genai.models.generateContentStream({
          model: MODEL,
          contents: [
            {
              role: "user",
              parts: [
                { inlineData: { mimeType: conv.imageMime, data: imageBase64 } },
                {
                  text: `${MODERN_USER_PROMPT_PREFIX}${conv.retroHtml}\n--- END RETRO HTML ---`,
                },
              ],
            },
          ],
          config: {
            systemInstruction: MODERN_SYSTEM_PROMPT,
            maxOutputTokens: 8192,
          },
        });

        for await (const chunk of response) {
          const text = chunk.text;
          if (text) {
            collected += text;
            send({ type: "delta", text });
          }
        }

        const html = stripHtmlFences(collected);
        await db
          .update(conversions)
          .set({ modernHtml: html, status: "done", updatedAt: new Date() })
          .where(eq(conversions.id, id));
        send({ type: "complete", html });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "unknown error";
        await db
          .update(conversions)
          .set({ status: "error", errorMessage: msg, updatedAt: new Date() })
          .where(eq(conversions.id, id));
        send({ type: "error", message: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: sseHeaders() });
}

function sse(payload: object) {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };
}
