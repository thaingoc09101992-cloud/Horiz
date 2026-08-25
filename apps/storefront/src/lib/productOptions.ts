export function getProductSizes(category: string, audience: string) {
  if (category === 'Shoes') {
    return audience === 'Toddler'
      ? ['22', '23', '24', '25', '26', '27', '28']
      : ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
  }
  if (category === 'Socks') return ['S', 'M', 'L']
  return ['XS', 'S', 'M', 'L', 'XL']
}
