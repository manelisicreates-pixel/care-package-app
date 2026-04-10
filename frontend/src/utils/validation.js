export function validateOrder({
  cart,
  customerName,
  customerEmail,
  deliveryOption,
  deliveryAddress,
}) {
  if (!cart || cart.length === 0) {
    return 'Please add at least one item to your box.'
  }

  if (!customerName.trim() || !customerEmail.trim()) {
    return 'Please enter your name and email address.'
  }

  if (deliveryOption !== 'Store Pickup' && !deliveryAddress.trim()) {
    return 'Please enter a delivery address.'
  }

  return ''
}

export function validateProduct({ name, category, price }) {
  if (!name.trim()) return 'Product name is required.'
  if (!category.trim()) return 'Category is required.'
  if (price === '' || Number(price) < 0) return 'A valid price is required.'
  return ''
}