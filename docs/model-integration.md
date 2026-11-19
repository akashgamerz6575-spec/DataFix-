# LLM Integration Notes

## Provider strategy

Use a provider adapter in the FastAPI backend so the app is not coupled to one vendor. GroqCloud is the intended first provider using a personal account. GoodEarth-owned OpenRouter credentials must not be used.

## Model selection

Do not hard-code a model ID until the personal Groq account is created. Query the current Groq model list and inspect the account's current rate limits. The model list and free-tier quotas can change.

At the time this scaffold was prepared, Groq's model documentation lists `qwen/qwen3.8-27b` and `openai/gpt-oss-120b`; its rate-limit documentation lists free-tier request/token quotas for supported models. Confirm the model is available to the team's account before selecting it. See:

- https://console.groq.com/docs/models
- https://console.groq.com/docs/rate-limits

## What the model is allowed to do

- Explain patterns found in profiling output.
- Suggest likely root causes.
- Produce a schema-validated repair proposal.
- Explain the proposal and uncertainty in plain language.

## What the model must not do

- Receive an entire sensitive dataset by default.
- Directly execute code or SQL against user data.
- Directly mutate the DataFrame or write the exported file.
- Invent missing values without evidence.
- Mark a repair as successful before deterministic validation passes.

Send compact summaries and carefully selected, redacted samples. If no reliable repair can be inferred, return `needs_human_review` rather than guessing.
