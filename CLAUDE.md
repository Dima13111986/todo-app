# CLAUDE.md — Todo App

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript (strict mode)
- **Framework**: Express 5
- **Testing**: Jest + Supertest + ts-jest
- **Storage**: In-memory array (no database)

## Project Structure

```
src/
  app.ts          # Express app, routes, in-memory store
  index.ts        # Entry point — only calls app.listen()
  __tests__/
    todos.test.ts # Integration tests via supertest
```

## Commands

```bash
npm run dev     # Run with ts-node (development)
npm run build   # Compile TypeScript to dist/
npm start       # Run compiled JS from dist/
npm test        # Run Jest test suite
```

## Naming Conventions

- **Files**: camelCase (`app.ts`, `index.ts`)
- **Interfaces/Types**: PascalCase (`Todo`, `TodoBody`)
- **Variables/Functions**: camelCase (`nextId`, `resetStore`)
- **Test files**: `*.test.ts` inside `src/__tests__/`
- **Route handlers**: inline in `app.ts`, no separate controller files unless routes grow beyond ~3 resources

## Architecture Rules

- `app.ts` exports the Express `app` and `resetStore()` — no `listen()` call inside
- `index.ts` is the only place that calls `app.listen()`
- Keep all route logic in `app.ts` until the project grows enough to justify splitting
- `resetStore()` is for tests only — never call it in production code

## Testing

- Every route must have integration tests using Supertest
- Call `resetStore()` in `beforeEach` to isolate test state
- Test both happy paths and error cases (400, 404)
- Do not mock Express or the store — test the full request/response cycle

## Do NOT

- Do not add a database without updating tests accordingly
- Do not call `app.listen()` in `app.ts` — it breaks tests
- Do not use `any` type — enable strict TypeScript
- Do not skip input validation on POST routes
- Do not add new dependencies without a clear reason
- Do not test implementation details — test HTTP behavior (status codes, response bodies)

## Commit Style
- Conventional Commits: feat:, fix:, docs:, test:
