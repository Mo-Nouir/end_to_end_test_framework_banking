# ParaBank Playwright E2E Framework

Production-oriented end-to-end automation framework for the [ParaBank](https://parabank.parasoft.com/) demo banking application, built with **Playwright** and **TypeScript**.

This project demonstrates maintainable QA engineering practices: Page Object Model, fixtures, UI + REST API coverage, test data factories, environment-based configuration, HTML reporting, and GitHub Actions CI/CD.

## Application under test

| Item | Value |
| --- | --- |
| App | ParaBank (Parasoft demo) |
| UI base URL | `https://parabank.parasoft.com/parabank` |
| REST API base | `https://parabank.parasoft.com/parabank/services/bank` |
| OpenAPI | [api-docs](https://parabank.parasoft.com/parabank/api-docs/index.html) |

ParaBank is a **shared public demo**. Data is reset periodically by the host, credentials such as `john` / `demo` are not private, and there is no exclusive cleanup for your runs.

## Technology stack

- Playwright Test + TypeScript (strict)
- Page Object Model + custom fixtures
- Playwright `APIRequestContext` for REST
- ESLint + Prettier
- Playwright HTML reporter (trace / screenshot / video on failure)
- GitHub Actions

## Architecture

```text
.
├── tests/
│   ├── ui/                 # UI scenarios by domain
│   ├── api/                # Verified REST API tests
│   └── smoke/              # Lean CI smoke suite
├── pages/                  # Page objects
├── fixtures/               # Playwright fixtures
├── api/                    # ParaBankApiClient
├── test-data/              # Test data factory
├── utils/                  # env + logger
├── types/                  # Shared TypeScript types
└── .github/workflows/      # CI pipeline
```

Tests stay focused on scenarios and assertions. Navigation, form interaction, and API calls live in page objects / the API client.

## Prerequisites

- Node.js 18+ (20 LTS recommended)
- npm 9+
- Git

## Installation

```bash
git clone <your-repo-url>
cd end_to_end_test_framework_banking
cp .env.example .env
npm install
npx playwright install
```

On Linux CI agents, use:

```bash
npx playwright install --with-deps
```

## Environment configuration

Copy `.env.example` to `.env` (never commit `.env`):

| Variable | Purpose | Default |
| --- | --- | --- |
| `BASE_URL` | UI base URL | ParaBank public UI |
| `API_BASE_URL` | REST base URL | ParaBank `/services/bank` |
| `TEST_USERNAME` / `TEST_PASSWORD` | Optional dedicated credentials | unset |
| `WORKERS` | Playwright workers | local default / `2` in CI |

UI tests prefer **registering unique users** so they do not depend on a private shared account.

## NPM scripts

| Script | Description |
| --- | --- |
| `npm run test` | Full suite (all configured projects) |
| `npm run test:ui` | UI tests only |
| `npm run test:api` | API tests only |
| `npm run test:smoke` | Smoke project only |
| `npm run test:headed` | Headed browsers |
| `npm run test:debug` | Playwright Inspector |
| `npm run test:chromium` / `firefox` / `webkit` | Single browser |
| `npm run report` | Open last HTML report |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier write |

## Reports and traces

After a run:

```bash
npm run report
```

Artifacts:

- HTML report → `playwright-report/`
- Failure traces / screenshots / videos → `test-results/`
- Traces are collected on the **first retry** (`trace: on-first-retry`)

Open a trace:

```bash
npx playwright show-trace test-results/<path>/trace.zip
```

## Test scenarios covered

### UI

- **Authentication** – valid login, invalid credentials, empty fields, logout
- **Registration** – unique user creation, required fields, duplicate username
- **Accounts** – overview, account details, open new account
- **Transfers** – transfer between accounts, missing/invalid amount handling
- **Bill payment** – happy path, required fields, account verification mismatch
- **Transactions** – find by amount after payment, invalid inputs

### API (verified OpenAPI endpoints)

- `GET /login/{username}/{password}`
- `GET /customers/{customerId}`
- `GET /customers/{customerId}/accounts`
- `GET /accounts/{accountId}`
- `POST /createAccount`
- `POST /transfer`
- `POST /deposit`
- `GET /accounts/{accountId}/transactions`
- `GET /accounts/{accountId}/transactions/amount/{amount}`
- `POST /billpay`

Schemas are validated for critical fields (ids, balances, payee name) rather than brittle full-document snapshots.

## Test data strategy

- `TestDataFactory` generates unique usernames and synthetic personal data.
- Mutating UI flows register their own users to reduce cross-test collisions.
- Parallel workers do not share a single mutable user.
- The public `john` / `demo` account is used mainly for **read-oriented API smoke** and a small number of API mutation checks.
- `cleanDB` / `initializeDB` exist on the API but are **not called** from this suite because they would disrupt other users of the shared demo.

**Cleanup limitation:** ParaBank does not provide a safe per-run cleanup for public use. Tests are designed to be repeatable without resetting the database.

## CI/CD

GitHub Actions workflow: `.github/workflows/playwright.yml`

Pipeline strategy:

1. **Lint + typecheck** on every push/PR
2. **Smoke** on Chromium (fast feedback)
3. **Full suite** on Chromium, Firefox, and WebKit after smoke passes
4. HTML reports and failure artifacts uploaded
5. `WORKERS=2` to limit load on the shared demo
6. Optional `TEST_USERNAME` / `TEST_PASSWORD` via GitHub Secrets

Manual runs are supported via `workflow_dispatch`.

## Known limitations of the public demo

- Shared mutable state; accounts and balances change under you.
- Periodic host-side DB resets can invalidate assumptions mid-run.
- Some pages are AJAX-driven (transfer, open account, bill pay, find transactions); tests wait on network-populated selects / result panels rather than fixed sleeps.
- Form accessibility is limited (few proper labels); locators combine roles with stable `name` / `id` attributes verified against the live DOM.
- Insufficient-funds behavior is not always deterministic on the shared instance; transfer tests skip when fewer than two funded accounts exist.
- Do not treat demo credentials as secrets or exclusive test accounts.

## Troubleshooting

| Symptom | What to try |
| --- | --- |
| Timeouts loading account dropdowns | Demo may be slow/down; retry; check `BASE_URL` |
| Registration “username already exists” | Factory collision is rare; re-run the test |
| Transfer skipped | Newly registered user could not open a second account (balance/demo issue) |
| API 500 / flaky responses | Shared demo instability; CI retries are enabled |
| Browsers missing | `npx playwright install` (add `--with-deps` on Linux) |

## Future improvements

- Optional local ParaBank Docker target for stable, isolated runs
- Auth storage state for faster suites against a private environment
- Contract tests generated from OpenAPI
- Allure or consolidated multi-browser dashboards
- Soft tagging to quarantine demo-flaky mutation tests in CI

## License

MIT
