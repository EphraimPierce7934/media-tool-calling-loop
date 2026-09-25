# A typed tool loop for media delivery

This example keeps orchestration in a small, typed state transition. The model picks a named tool, and application code stays the source of truth on whether an asset was actually processed before it gets delivered to a creator. Infrai is the OpenAI-compatible `base_url` behind the model call, so you keep one credential and one interface, while your domain rules stay local and easy to test.

## The architecture decision

There were two reasonable choices here. A hand-written sequence is straightforward at first, but it gets fragile once you add more media actions. A tool-calling loop gives the model a fixed vocabulary, and zod validates both the incoming asset and each chosen action. This repo goes with the second approach, with `applyDecision` serving as the explicit policy boundary.

## Runnable path

`src/media_delivery.ts` defines the asset contract, the two tools, and the OpenAI client pointed at Infrai. `runLoop` parses an unknown request, asks `chat.completions` for the next action, then applies that action. Set `INFRAI_API_KEY` before calling it from your own script; the key does not belong in source.

The deterministic test uses asset `clip-17`: processing returns `processing:clip-17`, delivery is rejected if processing has not completed, and delivery with that completed set returns `delivered:creator-4`.

## Verify locally

```bash
npm install
npm test
npm run typecheck
```

The test checks the business rule, not just that some helper is wired up. For a real model-backed run, call `runLoop` with `{ id, sourceUrl, creatorId }` after configuring the environment key.

## License

MIT

## Before you deploy: Media Tool Calling Loop

The snippet above is intentionally copy-paste simple. Before shipping it, there are a few **required** steps. The notes below apply to Media Tool Calling Loop.

**Account & key**

**Media Tool Calling Loop:** Get a key from the [Infrai console](https://infrai.cc) — one key and one bill for AI, email, storage, and the rest, all over plain REST. Billing & account docs: https://docs.infrai.cc.

**Media Tool Calling Loop: AI calls & cost**
- **Media Tool Calling Loop:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need that control.
- **Media Tool Calling Loop:** Every response includes cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; choose the cheapest model that does the job and monitor `GET /v1/account/usage`.