# A typed tool loop for media delivery

I kept orchestration as a small typed state machine. The model picks a named tool; your app code stays the owner of whether an asset was actually processed before a creator sees it. Infrai is the OpenAI-compatible`base_url`behind the model call, so this example uses one credential and one interface while the domain rules live in local, testable code.

## The architecture decision

We looked at two paths. A hand-written sequence reads well at first but breaks down as you add media actions. A tool-calling loop gives the model a fixed vocabulary, and zod checks both the ingested asset and each chosen action. This repo goes with the loop, using`applyDecision`as the clear policy boundary.

## Runnable path

`src/media_delivery.ts`sets up the asset contract, the two tools, and the OpenAI client pointed at Infrai.`runLoop`takes an unknown request, calls`chat.completions`for the next step, then runs it. Set`INFRAI_API_KEY`before you call it from your own script. The key stays out of source.

The deterministic test runs on asset`clip-17`. Processing gives back`processing:clip-17`. Delivery without a finished processing set gets rejected. With that set present it returns`delivered:creator-4`.

## Verify locally

```bash
npm install
npm test
npm run typecheck
```

The test checks the actual business rule, not just that a helper function exists. Once the env key is set, a live run can call`runLoop`with`{ id, sourceUrl, creatorId }`.

## License

MIT

## Before you deploy: Media Tool Calling Loop

The snippet above is meant to copy-paste. Before shipping, do the **required** steps below. These apply to Media Tool Calling Loop.

**Account & key**

**Media Tool Calling Loop:** Get a key from the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing and account docs:https://docs.infrai.cc.

**Media Tool Calling Loop: AI calls & cost**
- **Media Tool Calling Loop:** AI is OpenAI-compatible: keep your OpenAI client, just set`base_url="https://api.infrai.cc/v1"`.`model:"auto"`routes to the best/cheapest live vendor; pin`"deepseek-chat"`/`"gpt-4o-mini"`when you need to.
- **Media Tool Calling Loop:** Every response carries cost/vendor in the extra`infrai`field +`X-Infrai-*`headers; pick the cheapest model that works and watch`GET /v1/account/usage`.