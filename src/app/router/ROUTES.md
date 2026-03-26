# Rotas app-frontend vs management

## Management (Next.js)

- **Públicas (middleware não exige token):**  
  `api/auth`, `api/gatekeeper-version`, `api/gatekeeper`, `api/health`, `api/ready`,  
  `login`, `login-token`, `forgot-password`, `change-password`, `images`, `fonts`, `_next/static`, `_next/image`, `favicon.ico`
- **Protegidas:** demais rotas (ex.: `/dashboard/debt-renegotiation`, `/setup/payout`, etc.)

## App-frontend (React Router)

- **Públicas:** `/login`
- **Protegidas (RouteGuard):** todas as rotas de módulos de negócio:
  - `/` → redirect para `/debt-negotiation`
  - `/debt-negotiation`, `/debt-negotiation/debts`
  - `/contacts`, `/contacts/blocklist`, `/contacts/:id`
  - `/collections`, `/collections/contacts`, `/collections/charges`
  - `/sales`, `/sales/contacts`, `/sales/pipeline`
  - `/settings`
- **Outras:** `*` → NotFoundPage

## Diferenças

| Aspecto        | Management              | App-frontend                    |
|----------------|-------------------------|---------------------------------|
| Prefixo dashboard | `/dashboard/debt-renegotiation` | `/debt-negotiation` (sem `/dashboard`) |
| Setup/payout   | `/setup/payout`         | Não implementado                |
| Login token    | `/login-token`          | Não implementado                |
| Forgot/change password | Sim               | Não implementado                |
| API routes     | Next.js API (gatekeeper-version, etc.) | Nenhum (SPA; gatekeeper no client) |

As rotas de negócio do app-frontend seguem a mesma ideia (login público, resto protegido); os path names são diferentes (sem `/dashboard`, módulos em nível raiz).
