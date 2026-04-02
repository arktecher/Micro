# Micro Gallery Japan

A modern web application for connecting artists and businesses to display and sell artwork.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

`vite build` loads `.env.production` (API URL for the hosted backend). On [Vercel](https://vercel.com), set the same variables under **Project → Settings → Environment Variables**: `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (production URL: `https://micro-salz.vercel.app`).

## Project Structure

- `src/components/` - React components
- `src/components/ui/` - Reusable UI components
- `src/styles/` - Global styles and theme variables
- `src/App.tsx` - Main app component with routing
- `src/main.tsx` - Application entry point

## Technologies

- React 18
- TypeScript
- Vite
- Tailwind CSS v4
- Motion (Framer Motion)
- React Router
- Radix UI
- Lucide React
