export function env(name: string, legacyName?: string): string {
  return process.env[name] || (legacyName ? process.env[legacyName] || "" : "")
}

export function hasEnv(name: string, legacyName?: string): boolean {
  return Boolean(env(name, legacyName))
}

export function requireEnv(name: string, legacyName?: string): string {
  const value = env(name, legacyName)
  if (!value) {
    const suffix = legacyName ? ` or ${legacyName}` : ""
    throw new Error(`Missing required environment variable ${name}${suffix}`)
  }
  return value
}

export function backendUrl(): string {
  return env("MEDUSA_BACKEND_URL") || `http://localhost:${process.env.PORT || 9000}`
}
