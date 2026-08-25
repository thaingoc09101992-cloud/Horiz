export const FREE_SHIPPING_THRESHOLD = 1_500_000
export const STANDARD_SHIPPING_FEE = 30_000

export function calculateShipping(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE
}
