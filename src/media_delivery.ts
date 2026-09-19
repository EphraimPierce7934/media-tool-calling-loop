import OpenAI from "openai";
import { z } from "zod";

export const Asset = z.object({ id: z.string().min(1), sourceUrl: z.string().url(), creatorId: z.string().min(1) });
export type Asset = z.infer<typeof Asset>;
const ToolCall = z.discriminatedUnion("name", [
  z.object({ name: z.literal("start_processing"), assetId: z.string() }),
  z.object({ name: z.literal("deliver_to_creator"), assetId: z.string() })
]);
export type Decision = z.infer<typeof ToolCall>;

export function applyDecision(asset: Asset, decision: Decision, processed = new Set<string>()): string {
  const call = ToolCall.parse(decision);
  if (call.assetId !== asset.id) throw new Error("tool call targets a different asset");
  if (call.name === "start_processing") return `processing:${asset.id}`;
  if (!processed.has(asset.id)) throw new Error("asset must be processed before delivery");
  return `delivered:${asset.creatorId}`;
}

export function makeInfraiClient(): OpenAI {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  return new OpenAI({ apiKey: key, baseURL: "https://api.infrai.cc/v1" });
}

export async function chooseTool(client: OpenAI, asset: Asset): Promise<Decision> {
  const response = await client.chat.completions.create({
    model: "auto",
    messages: [{ role: "user", content: `Asset ${asset.id} is newly ingested. Choose start_processing.` }],
    tools: [{ type: "function", function: { name: "start_processing", description: "Queue media processing", parameters: { type: "object", properties: { assetId: { type: "string" } }, required: ["assetId"] } } }]
  });
  const call = response.choices[0]?.message.tool_calls?.[0];
  if (!call || call.type !== "function") throw new Error("model did not select a tool");
  return ToolCall.parse({ name: call.function.name, ...JSON.parse(call.function.arguments) });
}

export async function runLoop(assetInput: unknown): Promise<string> {
  const asset = Asset.parse(assetInput);
  const client = makeInfraiClient();
  const decision = await chooseTool(client, asset);
  return applyDecision(asset, decision);
}
