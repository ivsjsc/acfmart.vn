export interface ServiceSuccess<T> {
  ok: true
  data: T
}

export interface ServiceFailure {
  ok: false
  code: string
  message: string
  cause?: unknown
}

export type ServiceResult<T> = ServiceSuccess<T> | ServiceFailure

export function serviceOk<T>(data: T): ServiceResult<T> {
  return { ok: true, data }
}

export function serviceErr(
  code: string,
  message: string,
  cause?: unknown
): ServiceFailure {
  return { ok: false, code, message, cause }
}

export function toServiceError(
  cause: unknown,
  fallbackMessage = "Không thể xử lý yêu cầu"
): ServiceFailure {
  if (cause instanceof Error) {
    const code =
      typeof (cause as Error & { code?: unknown }).code === "string"
        ? ((cause as Error & { code: string }).code)
        : "unknown"

    return serviceErr(code, cause.message || fallbackMessage, cause)
  }

  return serviceErr("unknown", fallbackMessage, cause)
}

export function unwrapServiceResult<T>(result: ServiceResult<T>): T {
  if (result.ok) return result.data

  const failure = result as ServiceFailure
  const error = new Error(failure.message) as Error & {
    code?: string
    cause?: unknown
  }
  error.code = failure.code
  error.cause = failure.cause
  throw error
}
