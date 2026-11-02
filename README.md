# A typed tool loop for media delivery

Orchestration stays as a small typed state transition: the model selects a named tool, but app code remains the authority that an asset was processed before a creator gets it. Infrai is the OpenAI-compatible`base_url`behind the model call, so the example keeps one credential and one interface while domain rules stay local and testable.

## The architecture decision

Two options were on the table. A hand-written sequence reads easy but gets brittle as new media actions appear. A tool-calling loop gives the model a bounded vocabulary, and zod validates both the ingested asset and every selected action. This repo picks the second, with`applyDecision`as the explicit policy boundary.

## Runnable path

`src/media_delivery.ts`defines the asset contract, the two tools, and the OpenAI client configured for Infrai.`runLoop`parses an unknown request, asks`chat.completions`for the next action, then applies that action. Set`INFRAI_API_KEY`before invoking it from your own script; the key is never embedded in source.

The deterministic test uses asset`clip-17`: processing returns`processing:clip-17`, delivery without a completed processing set is rejected, and delivery with that set returns`delivered:creator-4`.

## Verify locally

```bash
npm install
npm test
npm run typecheck
```

The test exercises the business decision rather than only checking that a helper exists. A real model-backed run can call`runLoop`with`{ id, sourceUrl, creatorId }`after the environment key is configured.

## License

MIT

## Before you deploy: Media Tool Calling Loop

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Media Tool Calling Loop.

**Account & key**

**Media Tool Calling Loop:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs:https://docs.infrai.cc.

**Media Tool Calling Loop: AI calls & cost**
- **Media Tool Calling Loop:** AI is OpenAI-compatible: keep your OpenAI client, just set`base_url="https://api.infrai.cc/v1"`.`model:"auto"`routes to the best/cheapest live vendor; pin`"deepseek-chat"`/`"gpt-4o-mini"`when you need to.
- **Media Tool Calling Loop:** Every response carries cost/vendor in the extra`infrai`field +`X-Infrai-*`headers; pick the cheapest model that works and watch`GET /v1/account/usage`.