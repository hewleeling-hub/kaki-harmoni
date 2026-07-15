"use client";

import { useEffect, useState } from "react";

type Category = "service" | "addon" | "package";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price_myr: number;
  category: Category;
  active: boolean;
  sort_order: number;
};

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "service", label: "Service" },
  { value: "addon", label: "Add-on" },
  { value: "package", label: "Package" },
];

const money = (n: number) => `RM${Number(n).toFixed(2)}`;

export default function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<Category>("service");
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load the catalogue.");
      setProducts(data.products);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the catalogue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price_myr: Number(price),
          category,
          sort_order: products.length + 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not add the product.");
      setName("");
      setDescription("");
      setPrice("");
      setCategory("service");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add the product.");
    } finally {
      setAdding(false);
    }
  }

  async function patch(id: string, updates: Partial<Product>) {
    setError(null);
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not update the product.");
      return;
    }
    await load();
  }

  async function remove(p: Product) {
    if (!confirm(`Remove "${p.name}" from the catalogue?`)) return;
    setError(null);
    const res = await fetch(`/api/products/${p.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not remove the product.");
      return;
    }
    await load();
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(201,124,93,0.12)", color: "#8a4a30" }}>
          {error}
        </div>
      )}

      {/* Add product */}
      <form onSubmit={addProduct} className="rounded-2xl border border-black/5 bg-white/70 p-6 space-y-4">
        <h2 className="font-display text-xl font-semibold" style={{ color: "var(--lagoon)" }}>
          Add a product
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            required
            placeholder="Name (e.g. Foot Hydrotherapy Soak)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <input
            type="number"
            required
            min="0"
            step="0.01"
            placeholder="Price (RM)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Short description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm sm:col-span-1"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={adding}
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "var(--lagoon)" }}
        >
          {adding ? "Adding…" : "Add product"}
        </button>
      </form>

      {/* Catalogue list */}
      <div className="rounded-2xl border border-black/5 bg-white/70 overflow-hidden">
        {loading ? (
          <p className="px-6 py-8 text-black/50 text-sm">Loading catalogue…</p>
        ) : products.length === 0 ? (
          <p className="px-6 py-8 text-black/50 text-sm">No products yet.</p>
        ) : (
          <ul className="divide-y divide-black/5">
            {products.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 px-6 py-4">
                <div className="flex-1 min-w-[200px]">
                  <p className="font-medium" style={{ color: "var(--ink)", opacity: p.active ? 1 : 0.5 }}>
                    {p.name}
                    {!p.active && <span className="text-black/40 font-normal"> (archived)</span>}
                  </p>
                  {p.description && <p className="text-sm text-black/50">{p.description}</p>}
                </div>

                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                  style={{ background: "rgba(46,125,123,0.1)", color: "var(--lagoon-dark)" }}
                >
                  {p.category}
                </span>

                <span className="text-sm font-semibold w-20 text-right" style={{ color: "var(--clay)" }}>
                  {money(p.price_myr)}
                </span>

                <button
                  onClick={() => patch(p.id, { active: !p.active })}
                  className="text-sm font-medium px-3 py-1.5 rounded-lg border border-black/10 hover:bg-black/5"
                >
                  {p.active ? "Archive" : "Activate"}
                </button>
                <button
                  onClick={() => remove(p)}
                  className="text-sm font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
