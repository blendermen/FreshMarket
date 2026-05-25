# FreshMarket

Mapa lokalnych sprzedawców żywności eco/bio. Monorepo: **Next.js** (web) + **NestJS** (API) + **PostgreSQL** + **MinIO**.

## Stack

| Warstwa | Technologia |
|---------|-------------|
| Web | Next.js 15, NextAuth (Google), MapLibre + OpenStreetMap |
| API | NestJS, Prisma, JWT |
| DB | PostgreSQL (PostGIS image w Docker) |
| Pliki | MinIO (S3-compatible) |
| Monorepo | pnpm + Turborepo |

## Wymagania

- Node.js ≥ 22
- pnpm 9+ (patrz sekcja poniżej — **nie używaj** `npx pnpm@...` jeśli masz timeout na npm)
- Docker (opcjonalnie, dla Postgres + MinIO)

## Instalacja pnpm (Arch Linux)

`npx pnpm@9.15.9 install` pobiera najpierw sam pakiet `pnpm` z **registry.npmjs.org** — przy słabym połączeniu kończy się `ETIMEDOUT`, zanim w ogóle dotknie tego repozytorium.

**Zalecane na Arch:**

```bash
sudo pacman -S pnpm
cd ~/Projects/FreshMarket
pnpm install
```

Alternatywa (skrypt z GitHub, bez npm registry):

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.zshrc   # lub przeładuj terminal
pnpm install
```

Sprawdzenie: `pnpm -v` (powinno pokazać wersję, np. 9.x lub 10.x).

> Jeśli folder `node_modules` już istnieje (np. po wcześniejszej instalacji), `pnpm install` tylko dokończy / zweryfikuje lockfile — zwykle trwa kilka sekund.

## Szybki start (dev)

```bash
# 1. Zależności (wymaga pnpm w PATH — patrz wyżej)
pnpm install

# 2. Infrastruktura (Postgres + MinIO)
docker compose -f infra/docker/docker-compose.yml up -d

# 3. Env
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
# Uzupełnij GOOGLE_CLIENT_ID i GOOGLE_CLIENT_SECRET w apps/web/.env.local

# 4. Baza
pnpm db:migrate

# 5. Dev (web :3000, api :4000)
pnpm dev
```

- Strona: http://localhost:3000  
- Mapa: http://localhost:3000/map  
- API: http://localhost:4000/v1  
- MinIO console: http://localhost:9001  

## Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → OAuth 2.0 Client ID (Web).
2. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
3. Wklej Client ID i Secret do `apps/web/.env.local`.

Po logowaniu NextAuth synchronizuje użytkownika z API (`POST /v1/auth/google`) i zapisuje JWT w `localStorage` (pod formularz dodawania pinezek).

## Struktura

```
apps/web      — Next.js, MapLibre, panel listy
apps/api      — NestJS, pins, auth, media presign
packages/shared — Zod schemas, typy PinListItem
infra/docker  — docker-compose (dev)
infra/k8s     — manifesty k3s (base)
```

## API (skrót)

| Metoda | Ścieżka | Auth |
|--------|---------|------|
| GET | `/v1/pins?place=Marki` | public |
| GET | `/v1/pins/:id` | public |
| POST | `/v1/pins` | JWT |
| POST | `/v1/auth/google` | public (sync po OAuth) |
| POST | `/v1/media/presign` | JWT |
| GET | `/v1/geo/suggest?q=Mark` | public (autouzupełnianie, min. 3 znaki) |

## k3s

```bash
# Zbuduj obrazy lokalnie lub w CI, potem:
kubectl apply -k infra/k8s/base
# Sekrety: skopiuj infra/k8s/secrets.example.yaml → secrets.yaml
```

## Rozwiązywanie problemów

| Problem | Co zrobić |
|---------|-----------|
| `npx pnpm` → `ETIMEDOUT` | Zainstaluj pnpm przez `pacman` lub `get.pnpm.io` (powyżej), nie przez `npx` |
| `pnpm: command not found` | `sudo pacman -S pnpm` i otwórz nowy terminal |
| `npm install` wisi długo | To nie zastępuje `pnpm install` w monorepo — użyj pnpm |
| `turbo` → „cannot find binary path” | Turbo szuka `pnpm` z powodu `packageManager` w `package.json` — zainstaluj pnpm globalnie |
| `import.meta` / `PinPanel` / `shared/dist` | Zrestartuj `pnpm dev` po zmianie `exports` w `@freshmarket/shared` (Next bierze `src/`, API bierze `dist/`) |

Dłuższy timeout npm (gdy i tak musisz użyć npm do czegoś innego):

```bash
npm config set fetch-timeout 300000
npm config set fetch-retries 5
```

## Następne kroki

- [ ] Formularz dodawania pinezki (map click + upload zdjęć)
- [ ] Rejestracja email/hasło w UI
- [ ] PostGIS indeks + zapytania ST_Distance (zamiast Haversine w pamięci)
- [ ] `apps/mobile` (React Native)
