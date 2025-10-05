# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/8c51cfc0-3390-423d-bfbb-3c440e7b1520

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8c51cfc0-3390-423d-bfbb-3c440e7b1520) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Tech Stack

Core:
- Vite + React + TypeScript
- Tailwind CSS + shadcn-ui
- Supabase (Auth, PostgREST, RLS)
- React Query (data fetching layer en evolución, algunos hooks manuales también)

Utilities / Otros:
- Lucide Icons, Zod, react-hook-form

Desactivado temporalmente:
- Servicio de emails (Resend) → removida la dependencia; `emailService` es un no-op seguro.

## Supabase & Tipos

Generar tipos actualizados (requiere instalar CLI de supabase y exportar SUPABASE_PROJECT_ID):

```sh
export SUPABASE_PROJECT_ID=<id-proyecto>
npm run gen:types
```

Esto sobreescribe `src/integrations/supabase/types.ts`. Después de regenerar:
- Revisar discrepancias con tipos manuales (ej. budgets) y eliminar comentarios de deuda si ya coinciden.
- Commit controlado para facilitar diff.

## Email Service (Feedback)

El archivo `src/lib/emailService.ts` es actualmente un no-op (retorna true sin enviar). Para reactivarlo:
1. `npm install resend`
2. Añadir `VITE_RESEND_API_KEY` en entorno build.
3. Reimplementar la función `sendFeedbackNotification` con la lógica removida (ver historial git).
4. Evitar exponer claves sensibles (usar solo las públicas si aplica o un edge function en Supabase).

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8c51cfc0-3390-423d-bfbb-3c440e7b1520) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
