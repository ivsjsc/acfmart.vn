import crypto from "crypto"

export function hmacHex(
  algorithm: "sha256" | "sha512",
  secret: string,
  value: string
): string {
  return crypto.createHmac(algorithm, secret).update(value, "utf8").digest("hex")
}

export function sortedQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  Object.keys(params)
    .sort()
    .forEach((key) => {
      const value = params[key]
      if (value !== undefined && value !== "") {
        search.set(key, String(value))
      }
    })

  return search.toString()
}

export function vnpayDate(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("")
}
