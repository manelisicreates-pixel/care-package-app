export function formatCurrency(value) {
  return `R${Number(value || 0).toFixed(2)}`
}

export function formatItemCount(count) {
  return `${count} item${count === 1 ? '' : 's'}`
}