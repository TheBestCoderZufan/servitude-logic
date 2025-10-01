// src/app/dashboard/domains/page.js
import { auth } from "@clerk/nextjs/server";
import ClientDashboardLayout from "@/components/layout/ClientDashboardLayout";
import DomainsPageClient from "./DomainsPageClient";

export const revalidate = 0;

export default async function ClientDomainsPage() {
  const { userId } = await auth();
  if (!userId) return null;
  return (
    <ClientDashboardLayout>
      <DomainsPageClient />
    </ClientDashboardLayout>
  );
}
