// src/app/admin/clients/new/page.js
// Server wrapper that renders the client-only form island
import NewClientPageClient from "./NewClientPageClient";

export const revalidate = 0;

export default async function NewClientPage() {
  return <NewClientPageClient />;
}

