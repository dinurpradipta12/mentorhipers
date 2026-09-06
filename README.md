This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploy to the existing Cloudflare Pages project

This repository is configured for the existing Cloudflare Pages project using the Pages adapter. It does not create or deploy a separate Worker. The Pages adapter is deprecated by Cloudflare, but is kept here specifically to preserve this existing Pages project.

```bash
# Cloudflare Pages build command
npm run cloudflare:build
```

Set the Cloudflare Pages build output directory to:

```text
.vercel/output/static
```

The repository pins Next.js to the latest patched 15.5 release that still builds with this adapter. `.npmrc` enables the legacy peer resolver because the adapter's published peer range has not been updated for that patch release.

The existing `npm run deploy` script is kept as a build-only compatibility alias for an older Pages setting; Pages performs the deployment after the build finishes. For local Pages-runtime verification, use:

```bash
npm run preview
```

Configure these variables in the existing Cloudflare Pages project under Settings > Environment variables (for both Production and Preview):

- `NEXT_PUBLIC_SUPABASE_V2_URL`
- `NEXT_PUBLIC_SUPABASE_V2_ANON_KEY`
- `SUPABASE_V2_SERVICE_ROLE_KEY` for the protected V2 API routes
