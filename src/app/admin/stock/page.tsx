import { prisma } from "@/lib/prisma";
import { adminConfigured, isAdmin } from "@/lib/adminAuth";
import { adminLogin, adminLogout, saveStock } from "../actions";

export const metadata = { title: "Stock", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const ORDER = ["S", "M", "L", "XL"];
const wrap = { maxWidth: 900, margin: "0 auto", padding: "24px 16px", fontFamily: "inherit" } as const;
const cell = { padding: "8px 10px", borderBottom: "1px solid #ddd", textAlign: "left" } as const;

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const sp = await searchParams;

  if (!(await isAdmin())) {
    return (
      <div style={wrap}>
        <h1>Stock login</h1>
        {!adminConfigured() ? (
          <p>ADMIN_PASSWORD is not set on the server.</p>
        ) : (
          <form action={adminLogin} style={{ display: "grid", gap: 12, maxWidth: 320 }}>
            <input name="password" type="password" placeholder="Password" required style={{ padding: 10, fontSize: 16, border: "1px solid #111" }} />
            {sp.error && <p style={{ color: "#b00020" }}>Wrong password.</p>}
            <button type="submit" style={{ padding: 12, background: "#111", color: "#fff", border: 0, cursor: "pointer" }}>Log in</button>
          </form>
        )}
      </div>
    );
  }

  const products = await prisma.product.findMany({
    orderBy: { id: "asc" },
    include: { variants: true },
  });

  return (
    <div style={wrap}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1>Stock</h1>
        <form action={adminLogout}>
          <button type="submit" style={{ padding: "8px 14px", cursor: "pointer" }}>Log out</button>
        </form>
      </div>
      {sp.saved && <p style={{ color: "#146c2e" }}>Saved.</p>}
      <p>0 means sold out. Red means 3 or fewer left.</p>

      <form action={saveStock}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={cell}>Product</th>
                {ORDER.map((s) => <th key={s} style={cell}>{s}</th>)}
                <th style={cell}>Total</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const bySize = (s: string) => p.variants.find((v) => v.size === s);
                const total = p.variants.reduce((n, v) => n + v.stock, 0);
                return (
                  <tr key={p.id}>
                    <td style={cell}>{p.name}{!p.isActive && " (hidden)"}</td>
                    {ORDER.map((s) => {
                      const v = bySize(s);
                      return (
                        <td key={s} style={cell}>
                          {v ? (
                            <input
                              name={`stock_${v.id}`}
                              type="number"
                              min={0}
                              max={9999}
                              defaultValue={v.stock}
                              style={{ width: 70, padding: 6, fontSize: 16, border: "1px solid #111", color: v.stock <= 3 ? "#b00020" : "inherit" }}
                            />
                          ) : "-"}
                        </td>
                      );
                    })}
                    <td style={cell}>{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button type="submit" style={{ marginTop: 16, padding: "12px 20px", background: "#111", color: "#fff", border: 0, cursor: "pointer" }}>
          Save stock
        </button>
      </form>
    </div>
  );
}