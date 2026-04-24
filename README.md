# ShoreAgents Assets Management

A robust asset management system built with Next.js, Supabase, and Tailwind CSS. The platform enables efficient tracking, management, and organization of company assets.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React 19)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with Radix UI components
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest)
- **Icons**: [Lucide React](https://lucide.dev/)

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A Supabase project with database and necessary tables configured.

## Installation setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ShoreAgents-Assets-Management
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your Supabase credentials. You can also refer to the `.env` file in the codebase.
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   This will start the development server. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Building for Production

To create an optimized production build:
```bash
npm run build
```

To start the production server:
```bash
npm run start
```
