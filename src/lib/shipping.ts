// Edit these two numbers to change delivery charges
export const DELIVERY_CHARGE = 250;
export const FREE_DELIVERY_OVER = 5000;

export const shippingFor = (subtotal: number) =>
  subtotal === 0 || subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_CHARGE;