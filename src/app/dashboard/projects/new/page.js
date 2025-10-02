// src/app/dashboard/projects/new/page.js
import ClientDashboardLayout from "@/components/layout/ClientDashboardLayout";
import NewProjectPageClient from "./NewProjectPageClient";

export default async function NewProjectPage() {
  return (
    <ClientDashboardLayout>
      <NewProjectPageClient />
    </ClientDashboardLayout>
  );
}
