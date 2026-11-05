# BookNook

BookNook uses Better Auth in the Next.js app for email/password and Google sign-in, stores users and sessions in MongoDB, and issues JWTs for the Express API. Express validates those JWTs against Better Auth's JWKS endpoint; it does not implement a separate login system.

## Local setup

1. Install the frontend and API dependencies in their respective folders with `npm install`.
2. Copy `booknook-client/.env.example` to `booknook-client/.env.local` and set the values below.
3. Copy `book_nook_server/.env.example` to `book_nook_server/.env` and set its values. Both apps must connect to the same MongoDB database.
4. Start MongoDB, then run `npm run dev` in `book_nook_server` and `npm run dev` in `booknook-client`.

### Frontend environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Express API origin, normally `http://localhost:8000`. |
| `MONGODB_URI` | Yes | MongoDB connection string used by Better Auth. |
| `DB_NAME` | Yes | Database name used by Better Auth (and preferably Express). |
| `BETTER_AUTH_SECRET` | Yes | Random, private secret used by Better Auth to secure sessions. Use a unique value with at least 32 characters. |
| `BETTER_AUTH_URL` | Yes | Public origin of the Next.js app, e.g. `http://localhost:3000`. |
| `GOOGLE_CLIENT_ID` | For Google sign-in | Google OAuth 2.0 web client ID. |
| `GOOGLE_CLIENT_SECRET` | For Google sign-in | Secret paired with the Google OAuth client ID. Keep it server-only. |
| `NEXT_PUBLIC_IMGBB_API_KEY` | For book cover uploads | ImgBB API key used by the browser to upload cover images. |

Set both Google variables to enable Google sign-in; leave both unset to use email/password only. Never prefix the Google client secret or Better Auth secret with `NEXT_PUBLIC_`.

To enable cover uploads, create an API key in the [ImgBB API settings](https://api.imgbb.com/) and set `NEXT_PUBLIC_IMGBB_API_KEY` in `.env.local`. This key is necessarily available in the browser because uploads go directly from the form to ImgBB; restrict/monitor it through your ImgBB account and do not use it as an authentication secret. Restart Next.js after changing environment variables.

### Google OAuth configuration

In the Google Cloud Console, configure the OAuth consent screen and create an OAuth 2.0 Client ID of type **Web application**. Add the frontend origin (`http://localhost:3000`) under **Authorized JavaScript origins** and this callback under **Authorized redirect URIs**:

```text
http://localhost:3000/api/auth/callback/google
```

Put the resulting client ID and client secret in the frontend `.env.local` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, then restart Next.js. For deployment, use the deployed HTTPS origin and its matching `/api/auth/callback/google` URI, and configure the same `BETTER_AUTH_URL`. Add production and preview origins only when needed. While the OAuth consent screen is in testing mode, add the Google accounts that should be allowed to sign in as test users.

## Express JWT verification

Set the following in `book_nook_server/.env`; values must correspond to the frontend Better Auth configuration:

| Variable | Local value | Purpose |
| --- | --- | --- |
| `BETTER_AUTH_ISSUER` | `http://localhost:3000` | JWT issuer; must match `BETTER_AUTH_URL`. |
| `BETTER_AUTH_AUDIENCE` | `http://localhost:3000` | JWT audience; Better Auth's JWT plugin defaults it to the auth app URL. |
| `BETTER_AUTH_JWKS_URL` | `http://localhost:3000/api/auth/jwks` | Public signing keys used by Express to verify JWT signatures. |
| `ALLOWED_ORIGIN` | `http://localhost:3000` | Browser origin allowed by Express CORS. |
| `MONGODB_URI`, `DB_NAME` | Same as frontend | MongoDB connection for BookNook's API data. |

Authenticated frontend API calls obtain a JWT from the current Better Auth session and send it as a bearer token. Express validates the signature, expiry, issuer, and audience using the JWKS endpoint and reads the signed user identity claims. Do not copy the Better Auth session cookie or its secret into Express.

For official configuration details, see Better Auth's [database concepts](https://www.better-auth.com/docs/concepts/database), [email/password](https://www.better-auth.com/docs/authentication/email-password), [hooks](https://www.better-auth.com/docs/concepts/hooks), [Google OAuth](https://www.better-auth.com/docs/concepts/oauth), and [JWT plugin](https://www.better-auth.com/docs/plugins/jwt).

## Vercel deployment

Deploy the frontend and Express API as separate Vercel projects:

1. Set the frontend project's **Root Directory** to `booknook-client`. Add its production environment variables from the frontend table above. Set `BETTER_AUTH_URL` to `https://booknookclientsite.vercel.app` and set `NEXT_PUBLIC_API_URL` to the deployed API's HTTPS origin (without a trailing slash).
2. Set the API project's **Root Directory** to `book_nook_server`. Its `vercel.json` exposes the Express API as a Vercel function. Add `MONGODB_URI` for the shared MongoDB database, and set `CLIENT_URL` to `https://booknookclientsite.vercel.app`. `DB_NAME` defaults to `booknook`; `BETTER_AUTH_ISSUER`, `BETTER_AUTH_AUDIENCE`, and `BETTER_AUTH_JWKS_URL` default to the frontend's auth origin and JWKS endpoint. Set them explicitly only if the Better Auth configuration uses different values.
3. After setting environment variables, redeploy both projects. A frontend environment change takes effect only in a new build.

Use the API project's assigned Vercel domain for `NEXT_PUBLIC_API_URL`; the frontend domain is not the API URL. Keep MongoDB and Better Auth secrets in Vercel's server-side environment variables, never in `NEXT_PUBLIC_` variables.
