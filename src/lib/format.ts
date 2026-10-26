export const finalPrice = (price: number, discountPct: number) =>
  Math.round((price * (100 - discountPct)) / 100);

export const formatPrice = (n: number) => "Rs " + n.toLocaleString("en-PK");
