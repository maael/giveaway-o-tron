export function removeIdx<T>(ar: T[], idx: number): T[] {
  return ar.slice(0, idx).concat(ar.slice(idx + 1))
}

export const wait = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function getRandomArrayItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

export function chunkArray<T>(arr: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize)
    chunks.push(chunk)
  }
  return chunks
}
