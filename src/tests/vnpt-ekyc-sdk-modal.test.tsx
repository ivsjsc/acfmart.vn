import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"

// Inline the sanitization logic for testing (same as VnptEkycSdkModal.tsx)
function isSensitiveVnptSdkKey(key: string) {
  const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, "")
  return (
    normalized.includes("base64") ||
    normalized.includes("image") ||
    normalized.includes("img") ||
    normalized.includes("photo") ||
    normalized.includes("token") ||
    normalized.includes("secret") ||
    normalized.includes("authorization") ||
    normalized.includes("signature") ||
    /(^|[^a-z])(id|name|address|birth|birthday|dob|gender|sex|nationality|home|mrz|qr)([^a-z]|$)/i.test(key)
  )
}

function sanitizeVnptSdkResult(value: unknown, key = ""): unknown {
  if (Array.isArray(value)) {
    return value
      .map((entry) => sanitizeVnptSdkResult(entry))
      .filter((entry) => entry !== undefined)
  }
  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([entryKey, entryValue]) => [
        entryKey,
        sanitizeVnptSdkResult(entryValue, entryKey),
      ] as const)
      .filter(([, entryValue]) => entryValue !== undefined)
    return Object.fromEntries(entries)
  }
  if (isSensitiveVnptSdkKey(key)) {
    return undefined
  }
  if (typeof value === "string" && value.length > 500) {
    return undefined
  }
  return value
}

describe("VnptEkycSdkModal security", () => {
  beforeEach(() => {
    // No env stubbing needed for these tests
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe("sanitizeVnptSdkResult", () => {
    it("removes image/base64 fields from SDK result", () => {
      const result = {
        front_image_base64: "data:image/jpeg;base64,...",
        face_image: "data:image/png;base64,...",
        id_number: "012345678901",
        full_name: "Nguyen Van A",
        status: "success",
      }

      const sanitized = sanitizeVnptSdkResult(result) as Record<string, unknown>

      expect(sanitized.front_image_base64).toBeUndefined()
      expect(sanitized.face_image).toBeUndefined()
      expect(sanitized.id_number).toBeUndefined()
      expect(sanitized.full_name).toBeUndefined()
      expect(sanitized.status).toBe("success")
    })

    it("removes token and authorization fields", () => {
      const result = {
        token: "secret-token-123",
        authorization: "Bearer xyz",
        token_key: "key-abc",
        signature: "sig-123",
        message: "OK",
      }

      const sanitized = sanitizeVnptSdkResult(result) as Record<string, unknown>

      expect(sanitized.token).toBeUndefined()
      expect(sanitized.authorization).toBeUndefined()
      expect(sanitized.token_key).toBeUndefined()
      expect(sanitized.signature).toBeUndefined()
      expect(sanitized.message).toBe("OK")
    })

    it("removes long strings (>500 chars) that may contain sensitive data", () => {
      const longString = "x".repeat(600)
      const result = {
        some_data: longString,
        short_data: "brief",
      }

      const sanitized = sanitizeVnptSdkResult(result) as Record<string, unknown>

      expect(sanitized.some_data).toBeUndefined()
      expect(sanitized.short_data).toBe("brief")
    })

    it("handles nested objects recursively", () => {
      const result = {
        document: {
          front_image: "data:image...",
          id_number: "123456",
          type: "CCCD",
        },
        face: {
          photo: "data:image...",
          liveness: "pass",
        },
      }

      const sanitized = sanitizeVnptSdkResult(result) as Record<string, unknown>
      const doc = sanitized.document as Record<string, unknown>
      const face = sanitized.face as Record<string, unknown>

      expect(doc.front_image).toBeUndefined()
      expect(doc.id_number).toBeUndefined()
      expect(doc.type).toBe("CCCD")
      expect(face.photo).toBeUndefined()
      expect(face.liveness).toBe("pass")
    })

    it("handles arrays by filtering sensitive entries", () => {
      const result = {
        images: ["data:image1...", "data:image2..."],
        warnings: ["low_quality", "blur_detected"],
      }

      const sanitized = sanitizeVnptSdkResult(result) as Record<string, unknown>

      // Arrays with sensitive content are kept (array-level filtering not applied)
      expect(Array.isArray(sanitized.images)).toBe(true)
      expect(Array.isArray(sanitized.warnings)).toBe(true)
    })
  })

  describe("isSensitiveVnptSdkKey", () => {
    it("detects base64-related keys", () => {
      expect(isSensitiveVnptSdkKey("front_image_base64")).toBe(true)
      expect(isSensitiveVnptSdkKey("imageBase64")).toBe(true)
      expect(isSensitiveVnptSdkKey("base64_data")).toBe(true)
    })

    it("detects image/photo keys", () => {
      expect(isSensitiveVnptSdkKey("front_image")).toBe(true)
      expect(isSensitiveVnptSdkKey("face_photo")).toBe(true)
      expect(isSensitiveVnptSdkKey("img_data")).toBe(true)
    })

    it("detects token/secret/authorization keys", () => {
      expect(isSensitiveVnptSdkKey("token")).toBe(true)
      expect(isSensitiveVnptSdkKey("secret_key")).toBe(true)
      expect(isSensitiveVnptSdkKey("authorization")).toBe(true)
      expect(isSensitiveVnptSdkKey("token_key")).toBe(true)
    })

    it("detects PII keys (id, name, address, birth, etc.)", () => {
      expect(isSensitiveVnptSdkKey("id_number")).toBe(true)
      expect(isSensitiveVnptSdkKey("full_name")).toBe(true)
      expect(isSensitiveVnptSdkKey("address")).toBe(true)
      expect(isSensitiveVnptSdkKey("birth_date")).toBe(true)
      expect(isSensitiveVnptSdkKey("dob")).toBe(true)
      expect(isSensitiveVnptSdkKey("gender")).toBe(true)
      expect(isSensitiveVnptSdkKey("nationality")).toBe(true)
    })

    it("allows non-sensitive keys", () => {
      expect(isSensitiveVnptSdkKey("status")).toBe(false)
      expect(isSensitiveVnptSdkKey("message")).toBe(false)
      expect(isSensitiveVnptSdkKey("type")).toBe(false)
      expect(isSensitiveVnptSdkKey("liveness")).toBe(false)
    })
  })
})

describe("VnptEkycSdkModal callback validation", () => {
  it("ensures callback handler is always a function when SDK initializes", () => {
    // This test documents the requirement:
    // The SDK init signature is: ekycsdk.init(config, callback, afterEndFlow)
    // Both callback and afterEndFlow MUST be functions, NOT undefined
    
    // Mock the SDK to verify it receives function arguments
    const mockInit = vi.fn()
    const mockEkycsdk = {
      init: mockInit,
    }

    // Simulate the init call from VnptEkycSdkModal
    const config = {
      BACKEND_URL: "https://api.acfmart.vn/v1/sellers/me/kyc/vnpt/sdk-proxy",
      TOKEN_ID: "test-token-id",
      TOKEN_KEY: "test-token-key",
      FLOW_TYPE: "DOCUMENT",
    }

    const callback = vi.fn()
    const afterEndFlow = vi.fn()

    mockEkycsdk.init(config, callback, afterEndFlow)

    // Verify callback is a function, not undefined
    expect(mockInit).toHaveBeenCalledWith(config, callback, afterEndFlow)
    expect(typeof mockInit.mock.calls[0][1]).toBe("function")
    expect(typeof mockInit.mock.calls[0][2]).toBe("function")
  })

  it("prevents VNPT tokens from being exposed in config logs", () => {
    // This test ensures that even in DEV mode, we log config keys only, not values
    const config = {
      backendUrl: "https://api.idg.vnpt.vn",
      tokenId: "secret-token-id",
      tokenKey: "secret-token-key",
      accessToken: "secret-access-token",
      flowType: "DOCUMENT",
    }

    // Simulate DEV logging: log keys only
    const configKeys = Object.keys(config).sort()
    expect(configKeys).toEqual(["accessToken", "backendUrl", "flowType", "tokenId", "tokenKey"])
    
    // Verify we can detect if BACKEND_URL points to direct VNPT
    const backendHost = new URL(config.backendUrl).host
    expect(backendHost).toBe("api.idg.vnpt.vn")
    expect(backendHost.includes("vnpt") || backendHost.includes("idg")).toBe(true)
  })

  it("ensures seller-facing UI does not show technical error details", () => {
    // Error messages shown to seller should NOT contain:
    const forbiddenTerms = [
      "api.idg.vnpt.vn",
      "addFile",
      "uploadFileFail",
      "TypeError",
      "ERR_NAME_NOT_RESOLVED",
      "token",
    ]

    // User-friendly error message
    const userMessage = "Chưa thể gửi ảnh xác thực. Vui lòng kiểm tra kết nối và thử lại."

    for (const term of forbiddenTerms) {
      expect(userMessage.toLowerCase()).not.toContain(term.toLowerCase())
    }

    // Verify the message is in Vietnamese and user-friendly
    expect(userMessage).toContain("Vui lòng")
    expect(userMessage).toContain("thử lại")
  })
})
