import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms and conditions" };

export default function Terms() {
  return (
    <article className="prose">
      <h1>Terms and conditions</h1>
      <h2>Orders</h2>
      <p>An order is confirmed after we contact you on the phone number you provide. Please enter your address and phone number carefully.</p>
      <h2>Payment</h2>
      <p>We accept cash on delivery, Easypaisa, JazzCash, bank transfer and advance payment. For prepaid orders, share the transaction ID so we can confirm your payment.</p>
      <h2>Sizes</h2>
      <p>Sizes are S, M, L and XL. Check the size before ordering, as exchanges depend on stock.</p>
      <h2>Delivery</h2>
      <p>Delivery takes 3 to 7 working days. Charges depend on your city and are shown at checkout.</p>
      <h2>Exchange and returns</h2>
      <p>Unused items with tags can be exchanged within 7 days of delivery. Tell us about any damaged item within 48 hours.</p>
      <p><em>Placeholder text. Replace with the client's final policies before launch.</em></p>
    </article>
  );
}
