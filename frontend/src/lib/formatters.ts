export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export function toDateInputValue(isoString: string): string {
  return isoString.split('T')[0];
}
