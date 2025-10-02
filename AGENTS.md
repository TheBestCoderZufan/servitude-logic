## Project Structure

- **When possible, use server components instead of client components.**  
  This is a core rule — always prefer server components unless a client component is absolutely required.
- Read the documentation in docs/API.md.
- Place all styled components in a dedicated separate file.
- Avoid hardcoding values in styled component properties; always reference `theme.js`.
  <!-- - In the `src/styles/theme.js` file, there are two theme objects: -->
  - `theme` → Light theme (default)
  - `darkTheme` → Dark theme (restricted to `/admin/*` and `/dashboard/*` pages only).
  - **Do not apply the dark theme to any other pages.**
- The `/admin/*` pages are referred to as **admin pages**.
- The `/dashboard/*` pages are referred to as **client pages**.
- All `/dashboard/*` pages must be **client-oriented** in functionality and design.
- The navigation in src/components/layout/AdminDashboardLayout.js is refered to as the **admin navigation**.
- The navigation in src/components/layout/ClientDashboardLayout.js is refered to as the **client navigation**.
- The navigation in src/components/Navigation/Navigation.jsx is refered to as the **public navigation**.
- Store arrays and objects in the `src/data` folder.
- After modifying `prisma/schema.prisma`, run database migrations.
- Avoid `switch` statements for lookups; use object maps instead.
- Use HTML entities (`&quot;`, `&apos;`, `&amp;`, etc.).

---

## Documentation

- Read the documentation in the `/docs/API.md` file before coding.
- Read the **README.md** file before starting development tasks.
- Review the **`AI-Doc/Configuration/Clerk.md`** file for details on the Clerk configuration implemented in the UI.
- Write clear and concise JSDoc comments for **every React component, function, object, and array**, describing its purpose, parameters, and return value.
- After completing a coding task, run `npm run doc` to regenerate the API documentation.

---

## Git Workflow

- Ensure there are no build errors before committing.
- After each task, make sure to validate the build.
- Create a new branch for every feature, fix, or task.
  - Branch naming: `feature/<name>`, `fix/<name>`, `chore/<name>`.
  - **Never make direct changes to the `main` branch.**
- Commit changes to the branch with clear, descriptive commit messages.
- You must get **approval** before merging the new branch into the `main` branch.
- If the merge is approved, merge the branch into `main` and push the changes to the remote repository.

---

## Accessibility

- Use semantic HTML for all elements.
- Provide alt text for images.
- Ensure color contrast meets accessibility standards.
- Components must be navigable via keyboard.
- Use ARIA attributes only when necessary.
- Align with **WCAG 2.2 AAA** accessibility guidelines.
- Maintain **basic Section 508 compliance**.

---

## API Routes, Server Components & Server Pages

The following rules apply consistently to **API routes, server components, and server pages**:

- Always `await` parameters.  
  Example:

```javascript
const { id } = await params;
```

- Validate and sanitize all incoming request data.
- Always handle errors gracefully; return appropriate HTTP status codes and JSON responses.
- Use server components whenever possible to reduce bundle size and improve performance.
- Avoid exposing sensitive logic or secrets in client components.
- When using **Clerk**, always instantiate the client before accessing its methods.
  Do **not** write:

```javascript
const clerkUser = await clerkClient.users.getUser(id);
```

Instead, write:

```javascript
const clerkC = await clerkClient();
const clerkUser = await clerkC.users.getUser(id);
```

---

## Functions & Components

- Use **function declarations** instead of arrow functions.
- Write React components as function declarations (not arrow functions).
- Components must remain small and focused; split logic into helper functions when needed.
- Prefer composition over inheritance.
- Ensure all components are accessible (semantic HTML, ARIA attributes, keyboard navigation).
- **Default to server components**; only use client components when interaction, state, or effects are strictly necessary.
- All parts of the application must be **mobile-friendly**.

---

## Security

- Never commit `.env` files or secrets.
- Sanitize all user input before processing or persisting.
- Use HTTPS-only cookies for authentication.
- Follow the principle of least privilege when accessing APIs and databases.
- Implement cookie/consent and privacy basics with **CCPA/GDPR awareness**.

---

## Performance

- Optimize database queries (avoid N+1 queries).
- Use `React.memo` and `useMemo` for expensive renders where appropriate.
- Use caching for repeated API calls when possible.
- Load images and assets efficiently (e.g., Next.js `<Image>`).
- Meet **Core Web Vitals** performance targets.

---

## Deployment

- Hosting: Vercel (Hobby Plan).
- Ensure all environment variables are correctly set before deployment.
- Only deploy from the `main` branch after approval.

---

## API Services

This is a list of API service used in this project.

- Authentication: Clerk
- Database: Supabase
- Payments: Stripe
- Calendar: Cal (self-hosted) → Unimplemented
- Document Signature: Docuseal (self-hosted) → Unimplemented
- Document Storage: Cloudflare R2 → Unimplemented
- Domain Search: Dynamic DNS
- Zoho Invoice → Unimplemented

# Environment Variables

The following environment variables are set in the project's `.env` files and are available in the runtime environment. When generating code, reference these variables as needed.

- CLERK_SECRET_KEY
- CLERK_WEBHOOK_SECRET
- CLOUDFLARE_R2_PROD_ACCESS_KEY_ID
- CLOUDFLARE_R2_PROD_BUCKET_NAME
- CLOUDFLARE_R2_PROD_ENDPOINTS
- CLOUDFLARE_R2_PROD_SECRET_ACCESS_KEY
- CLOUDFLARE_R2_PROD_TOKEN_VALUE
- CLOUDFLARE_R2_STAGING_ACCESS_KEY_ID
- CLOUDFLARE_R2_STAGING_BUCKET_NAME
- CLOUDFLARE_R2_STAGING_ENDPOINTS
- CLOUDFLARE_R2_STAGING_SECRET_ACCESS_KEY
- CLOUDFLARE_R2_STAGING_TOKEN_VALUE
- DATABASE_URL
- DIRECT_URL
- DYNADOT_PRODUCTION_BASE_URL
- DYNADOT_PRODUCTION_KEY
- DYNADOT_PRODUCTION_SECRET_KEY
- DYNADOT_SANDBOX_BASE_URL
- DYNADOT_SANDBOX_KEY
- DYNADOT_SANDBOX_SECRET_KEY
- GEMINI_API_KEY
- GOOGLE_GENERATIVE_AI_API_KEY
- NAMECHEAP_API_KEY
- NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
- NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- NEXT_PUBLIC_CLERK_SIGN_IN_URL
- NEXT_PUBLIC_CLERK_SIGN_UP_URL
- NODE_ENV
- OPENPROVIDER_EMAIL
- OPENPROVIDER_PASSWORD
- OPENPROVIDER_USERNAME
- WHOISXML_API_KEY
- ZOHO_ORGANIZATION_ID

### Third-Party API & Env-Var Rules

- Announce new services in your PR and append to `.env.example`.
- Document how to obtain credentials in `AI-Doc/Communication.md`.
- Create credentials as `SCREAMING_SNAKE_CASE` variables.
- Never alter or remove existing environment variables.

## The Most Important Rule

- All UI components must be **visually beautiful, amazing, consistent, accessible, and polished**.
  - Follow design guidelines.
  - Ensure responsiveness across devices.
  - Favor simplicity and clarity in layouts.
  - Always prefer **server components** for rendering whenever possible.

---

## Notes

- Authentication is handled by **Clerk**, but clients must never know that Clerk is used.
- Do **not** use Clerk components directly.
- Implement authentication through a **custom abstraction layer**.
- All implementation must follow **industry best practices**.
