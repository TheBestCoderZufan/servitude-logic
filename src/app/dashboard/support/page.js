// src/app/dashboard/support/page.js
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/dashboard/messages");
}
