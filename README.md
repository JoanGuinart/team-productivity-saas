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

## Environment (Vercel)

Set these variables in Vercel (Settings > Environment Variables). Add them to **PRODUCTION** and **PREVIEW** scopes:

```
DATABASE_URL=postgresql://postgres:PASSWORD@db.nqgdzacfobaboiayugmv.supabase.co:6543/postgres?sslmode=require
DIRECT_URL=postgresql://postgres:PASSWORD@db.nqgdzacfobaboiayugmv.supabase.co:5432/postgres?sslmode=require
NEXTAUTH_URL=https://team-productivity-saas.vercel.app
NEXTAUTH_SECRET=your-secret-here
DEMO_READONLY=true
NEXT_PUBLIC_DEMO_READONLY=true
NEXT_PUBLIC_DEMO_LOGIN_EMAIL=demo.admin@taskflow.local
NEXT_PUBLIC_DEMO_LOGIN_PASSWORD=demo1234
```

**Important notes:**
- Use `DATABASE_URL` with port **6543** (Supabase Transaction Pooler mode - supports IPv4, needed for Vercel)
- Use `DIRECT_URL` with port **5432** (Direct connection, only for migrations/local)
- Do NOT include `?pgbouncer=true` - use `?sslmode=require` instead
- Supabase Transaction Pooler automatically handles connection pooling for serverless
- Set `DEMO_READONLY=true` for public portfolio deployments to block write endpoints (POST/PATCH/DELETE)

## Portfolio Demo (Safe Mode)

Objetivo: publicar una demo fullstack sin permitir que visitantes ensucien la base de datos.

### 1) Base de datos demo separada

- Crea un proyecto nuevo en Supabase solo para demo.
- No uses nunca tu base de datos personal/real.

### 2) Variables de entorno en Vercel

Configura estas variables en Production:

```
DATABASE_URL=postgresql://...:6543/postgres?sslmode=require
DIRECT_URL=postgresql://...:5432/postgres?sslmode=require
NEXTAUTH_URL=https://tu-dominio-demo.vercel.app
NEXTAUTH_SECRET=tu-secreto-seguro
ADMIN_PASSWORD=deshabilitado-en-demo
DEMO_READONLY=true
DEMO_USER_PASSWORD=demo1234
NEXT_PUBLIC_DEMO_READONLY=true
NEXT_PUBLIC_DEMO_LOGIN_EMAIL=demo.admin@taskflow.local
NEXT_PUBLIC_DEMO_LOGIN_PASSWORD=demo1234
```

### 3) Seed de datos de demostracion

El script crea/actualiza usuarios demo, equipo, proyectos y tareas sin borrar datos existentes.

Comando local:

```bash
npm run seed:demo -- --confirm=yes
```

Usuarios demo creados:

- demo.admin@taskflow.local
- demo.member@taskflow.local

Password por defecto:

- demo1234 (o el valor de `DEMO_USER_PASSWORD`)

### 4) Resultado esperado

- La app funciona y muestra datos reales de ejemplo.
- Las operaciones de escritura (POST/PATCH/DELETE) responden 403 en demo publica.
- El banner superior indica que la demo es de solo lectura.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
