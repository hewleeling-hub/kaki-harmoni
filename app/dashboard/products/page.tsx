import { redirect } from "next/navigation";
import { getProfile, isManager } from "@/lib/auth";
import ProductsClient from "./products-client";

export default async function ProductsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!isManager(profile.role)) redirect("/dashboard");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
          Catalogue
        </h1>
        <p className="text-black/60 mt-1">The services and add-ons customers can order.</p>
      </div>
      <ProductsClient />
    </div>
  );
}
