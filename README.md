# Arteza – Original Artworks by Upasna

[![Live Site](https://img.shields.io/badge/live-arteza.site-8b5cf6?style=flat-square)](https://arteza.site)
[![Stack](https://img.shields.io/badge/react-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/typescript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/supabase-backend-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/tailwind-3-06B6D4?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

A full-stack e‑commerce art gallery for independent artist **Upasna**.  
Browse original paintings, discover collections, take a style quiz, book classes, read the blog, and place orders – all wrapped in a clean, responsive design.

---

## Features

- **Online Shop** – Filterable gallery of original paintings with detailed product pages.
- **Collections** – Curated thematic collections (e.g., *Shades of Blue*, *Minimalist*).
- **Blog** – Articles about art, process, and inspiration.
- **Classes** – Browse and book painting workshops.
- **Art Style Quiz** – Help visitors discover which collection suits their taste.
- **Shopping Cart** – Add, remove, and manage items.
- **Order Management** – Checkout form, order creation via Supabase Edge Functions.
- **WhatsApp Checkout** – After order creation, users are redirected to WhatsApp for payment & coordination (no online payment gateway).
- **Order Tracking** – Look up order status by order ID.
- **Authentication** – Email/password sign‑up/sign‑in with Supabase Auth, plus forgot/reset password flow.
- **Admin Dashboard** – Protected area for managing paintings, blog posts, classes, and viewing orders.
- **Light/Dark Theme** – Toggle between colour themes.
- **Animations** – Scroll‑reveal effects, page transitions, and a typewriter hero.

---

## Tech Stack

| Category        | Technology |
|-----------------|------------|
| **Frontend**    | React 18, TypeScript, Vite, React Router v6, TanStack Query |
| **Styling**     | Tailwind CSS, shadcn/ui components, custom CSS variables |
| **State**       | React Context (Auth, Cart, Theme), Zod + react‑hook‑form for forms |
| **Backend**     | Supabase (PostgreSQL, Auth, Storage) |
| **Serverless**  | Supabase Edge Functions (Deno) |
| **Testing**     | Vitest, React Testing Library |
| **Package Manager** | Bun (lock files present), also compatible with npm/yarn |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 (or **Bun**)
- A **Supabase** account & project
- Supabase CLI (for Edge Functions & migrations)

### 1. Clone the repository

```bash
git clone https://github.com/akshayaa-403/arteza.git
cd arteza
```

---

## Project Structure

```
arteza/
├── public/                  # Static assets
├── supabase/
│   ├── migrations/          # SQL migrations
│   └── functions/           # Edge Functions (admin-mutations, create-order, track-order)
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui primitives
│   │   ├── layout/          # Header, Footer, Layout
│   │   ├── admin/           # Admin-only components
│   │   └── ...              # Feature components
│   ├── contexts/            # Auth, Cart, Theme context providers
│   ├── hooks/               # Custom hooks (usePaintings, useScrollReveal, etc.)
│   ├── integrations/        # Supabase client & type definitions
│   ├── pages/               # Route pages (Home, Shop, Admin, etc.)
│   ├── lib/                 # Utility functions
│   ├── data/                # Static type definitions & constants
│   └── test/                # Test files
├── .env                     # Environment variables (ignored by git)
├── components.json          # shadcn/ui configuration
├── tailwind.config.ts       # Tailwind theme (lavender palette, fonts)
├── vite.config.ts           # Vite config (port 8080, path aliases)
└── package.json
```

---

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.
