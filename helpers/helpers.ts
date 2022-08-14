export const getFormatted30MinWindow = (value: string) => {
  const from = new Date(value);
  const to = new Date(from);
  if (to.getMinutes()) {
    to.setHours(from.getHours() + 1, 0)
  } else {
    to.setMinutes(30)
  }
  return `${from.toISOString().slice(11, 16)} - ${to.toISOString().slice(11, 16)}`
}

export const calculatePercentageDifference = (actual: number, forecast: number) => {
  return ((actual - forecast) / actual * 100).toFixed(1)
}
