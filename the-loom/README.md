# The Loom

A riddle machine that forges **AI-resistant sealed challenges**.

## The lock

Each challenge has two secrets:

1. **The riddle** — a fair lateral puzzle with one precise answer.
2. **The filament** — an instance-specific word spelled by a copper thread in a letter lattice on that page. It never appears in the riddle text.

Only the binding `answer filament` mints a seal (`LOOM-XXXX-XXXX-XXXX`). Solvers show the host the seal; near-misses and “ask ChatGPT the riddle” attempts cannot mint it.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
