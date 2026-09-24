# Deploying MyStudyTwin to the VPS (alongside CompCare Hub)

Everything code-side is done: `server.js` replaces the two Vercel functions,
`Dockerfile` builds it into an image, and
`.github/workflows/docker-build.yml` builds/pushes/deploys it on every push
to `main` — same pattern CompCare Hub already uses on this VPS.

The steps below need you, not me — they need your GitHub account, your VPS
login, or a domain you haven't picked yet.

## 1. Create the GitHub repo and push

```
gh repo create mystudytwin-app --private --source=. --push
```
(or create it on github.com and `git remote add origin <url>` yourself)

## 2. Add the VPS SSH secret to that repo

Settings → Secrets and variables → Actions → New repository secret:
- `VPS_SSH_KEY` — the same private key already used for the healthark repo's
  deploy (it's the same server), or a new one with access to the VPS.

## 3. Create the .env file on the VPS

```
ssh root@163.245.223.58
mkdir -p /opt/mystudytwin
nano /opt/mystudytwin/.env
```
Put in whichever of these you want to use (the app checks in this order —
first one present wins):
```
GEMINI_API_KEY=...        # recommended — has a free tier
# or OLLAMA_API_KEY=...
# or ANTHROPIC_API_KEY=...
# or OPENAI_API_KEY=...
REDIS_URL=...             # your existing Redis URL from .env.local, for cross-device sync
```
Leaving `REDIS_URL` out is fine — the app just falls back to per-device
localStorage instead of cross-device sync, no crash.

## 4. Push to main

That triggers the GitHub Action, which builds the image and runs it on the
VPS as `mystudytwin_app`, listening on port 3002 (separate from
CompCare Hub's 3001), capped at 512MB RAM / 1 CPU so it can't affect
CompCare Hub if it ever misbehaves.

## 5. Once you have a domain/subdomain for it

1. Point its DNS A record at `163.245.223.58`.
2. Get a cert: `certbot certonly --webroot -w /var/www/certbot -d your.domain`
3. Add the two server blocks from `nginx/mystudytwin.conf.example` into
   the healthark repo's `nginx/nginx.conf` (swap in your real domain),
   then reload nginx on the VPS.

Until step 5 is done, the app is running on the VPS but not reachable from
the internet yet — you can sanity-check it's up with
`curl http://163.245.223.58:3002` from the VPS itself (or SSH-tunnel to it)
once step 4 has run.
