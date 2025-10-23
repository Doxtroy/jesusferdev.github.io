# 🧩 Customization Guide

This project is made to be personalized. The main place to edit your info is:

- Central config: `src/config/personalize.ts` (BRAND, PROJECTS, SOCIAL_LINKS, CONTACT)

Below are details on each section and where it flows into the UI.

## 1) Brand / Name
- File:
  - `src/config/personalize.ts` — constant `BRAND`
- Effect: shown in the menu bar, About window, and Terminal title.

## 2) Projects window
- File:
  - `src/config/personalize.ts` — constant `PROJECTS: Project[]`
- Fields:
  - `id`: unique string key
  - `title`: project title
  - `short`: 1–2 line description
  - `image`: small icon/preview (e.g., `icons/projects.png` or a URL)
  - `tech`: array of tags
  - `url` (optional): external link opened via double click or the “Abrir” button

## 3) Social links (Socials window)
- Files:
  - `src/components/SocialBody.tsx` documents supported keys.
  - `src/config/personalize.ts` — constant `SOCIAL_LINKS`
- Supported keys: `github`, `linkedin`, `instagram`, `whatsapp`, `spotify`, `email`.
  - Tip: use `mailto:you@example.com` for email or `https://wa.me/NUMBER?text=...` for WhatsApp.

## 4) About window
- File: `src/components/AboutBody.tsx`
  - Pass `brand` from parents.
  - Optionally override props like `version`, `processor`, `abilities`, `experience`, `creativity`, `memoryLabelLeft`, `memoryLabelRight`, `cvUrl`, `skills`, `pcImage`.
  - Or edit default values inside `AboutBody.tsx` (look for the defaults and add/remove `defaultSkills`).

## 5) Contact buttons (mobile dock)
- File: `src/config/personalize.ts`
  - `CONTACT.email`
  - `CONTACT.whatsappNumber` and `CONTACT.whatsappText`
  - `CONTACT.externalLink` (e.g., LinkedIn or your website)

## 6) Terminal
- Files:
  - `src/MobileHome.tsx` and `src/RetroMac128KPortfolio.tsx`
- Terminal receives `brand`, `projects`, and `social` from the central config.

## 7) Themes
- Switch between `classic`, `phosphor`, and `amber` using the Settings window.
- Theme preference is saved in `localStorage` under the key `retro-theme`.

## 8) Screensaver
- Desktop route (`src/RetroMac128KPortfolio.tsx`) persists the timeout under `screensaver-ms`.

## Where things render
- Desktop: `src/RetroMac128KPortfolio.tsx` (auto-selected for desktop)
- Mobile: `src/MobileHome.tsx` (auto-selected for small/touch devices)
- Windows/components:
  - About: `src/components/AboutBody.tsx`
  - Socials: `src/components/SocialBody.tsx`
  - Projects: `src/components/ProjectsBody.tsx`
  - Terminal: `src/components/RetroTerminal.tsx`
  - Menu/Chrome: `src/components/MenuBar.tsx`, `src/components/Window.tsx`, `src/components/WindowChrome.tsx`

## Quick steps
1) Change `BRAND` in both routes.
2) Update the `projects` arrays.
3) Add your social links where `SocialBody` is used (and optionally pass them to the Terminal props).
4) Tweak the email/phone/links in the mobile dock buttons (if using mobile).
5) Adjust About props or defaults as desired.
