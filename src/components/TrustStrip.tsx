export default function TrustStrip() {
  const items = [
    { title: "100% original", text: "Genuine branded apparel" },
    { title: "Cash on delivery", text: "Pay when your order arrives" },
    { title: "Easy payment", text: "Easypaisa, JazzCash, bank transfer" },
  ];
  return (
    <ul className="k-trust" aria-label="Why shop with us">
      {items.map((x) => (
        <li key={x.title}>
          <strong>{x.title}</strong>
          <span>{x.text}</span>
        </li>
      ))}
    </ul>
  );
}
