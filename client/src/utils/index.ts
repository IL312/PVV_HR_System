function declOfYears(count: number, textForms: string[] = ['год', 'года', 'лет']): string {
  count = Math.abs(count) % 100;
  const num = count % 10;
  
  if (count > 10 && count < 20) {
    return `${count} ${textForms[2]}`; // 11-14 лет
  }
  if (num > 1 && num < 5) {
    return `${count} ${textForms[1]}`; // 2-4 года
  }
  if (num === 1) {
    return `${count} ${textForms[0]}`; // 1 год
  }
  
  return `${count} ${textForms[2]}`; // Остальные: 5-0 лет
}

export default declOfYears;