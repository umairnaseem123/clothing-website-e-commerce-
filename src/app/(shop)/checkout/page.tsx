import CheckoutView from "@/components/CheckoutView";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <section className="section">
      <div className="k-results">
        <h1>Checkout</h1>
      </div>
      <CheckoutView />
    </section>
  );
}