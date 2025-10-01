// src/app/dashboard/tasks/[id]/page.js
import { redirect } from "next/navigation";

export default function Page({ params }) {
  const id = params?.id;
  redirect(`/dashboard/approvals/${id}`);
}
