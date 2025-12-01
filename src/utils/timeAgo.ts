export function timeAgo(dateInput?: string | number | Date | null) {
  if (!dateInput) return '';
  const now = Date.now();
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : (dateInput as Date);
  const diffSeconds = Math.floor((now - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

  const divisions: { amount: number; name: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, name: 'second' },
    { amount: 60, name: 'minute' },
    { amount: 24, name: 'hour' },
    { amount: 7, name: 'day' },
    { amount: 4.34524, name: 'week' },
    { amount: 12, name: 'month' },
    { amount: Infinity, name: 'year' }
  ];

  let duration = diffSeconds;
  for (let i = 0; i < divisions.length; i++) {
    const division = divisions[i];
    if (Math.abs(duration) < division.amount) {
      const value = Math.round(duration);
      return rtf.format(-value, division.name as Intl.RelativeTimeFormatUnit);
    }
    duration = Math.round(duration / division.amount);
  }
  return '';
}
