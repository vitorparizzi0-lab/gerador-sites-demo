import { redirect } from "next/navigation";
import { Builder } from "@/components/Builder";
import { isAuthenticated } from "@/lib/auth";

// Depende do cookie de sessão: nunca pré-renderizar.
export const dynamic = "force-dynamic";

export default async function Home() {
  if (!(await isAuthenticated())) redirect("/login");
  return <Builder />;
}
