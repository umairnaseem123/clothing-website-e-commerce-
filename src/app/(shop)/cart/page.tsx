import CartView from "@/components/CartView";

export const metadata = { title: "Your cart" };

export default function CartPage() {
  return (
    <section className="section">
      <div className="k-results">
        <h1>Your cart</h1>
      </div>
      <CartView />
    </section>
  );
}
