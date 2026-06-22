# Wedding Invite Site

This folder contains a Netlify-ready Vite + React version of your wedding invite.

## What's already done

- Extracted the embedded images into real `.jpg` files in `src/assets/`
- Converted the giant single-file JSX into `src/App.jsx`
- Replaced the old `window.storage` RSVP flow with Netlify Forms submission
- Added the hidden static form Netlify needs to detect JavaScript-rendered forms
- Added Open Graph and Twitter meta tags for WhatsApp and social previews
- Added a simple favicon and Netlify build config

## Before you publish

1. Replace `https://invite.your-domain.com/` in `index.html` with your real custom domain.
2. Push this folder to GitHub, GitLab, or Bitbucket.
3. In Netlify, create a new site from that repo.
4. Keep the default build settings from `netlify.toml`.
5. In Netlify, enable Forms detection if it is not already enabled.
6. After deploy, add your custom domain in Netlify and point DNS to Netlify.

## Local commands

If you install Node.js later, you can run:

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
```

## Notes

- The RSVP form name is `wedding-rsvp`.
- The WhatsApp preview image is `public/og-image.jpg`.
- I could not run the Vite build here because this machine currently does not have `node` or `npm` installed.
