import { useEffect, useRef, useState } from "react"
import { Loader2, X } from "lucide-react"
import type { StartSellerVnptKycSessionResult } from "../../../lib/kyc"

const SDK_MOUNT_ID = "ekyc_sdk_intergrated"
const SDK_ASSET_BASE = "/vnpt-ekyc"

declare global {
  interface Window {
    FaceVNPTBrowserSDK?: {
      init: () => Promise<void> | void
    }
    ekycsdk?: {
      init: (
        config: Record<string, unknown>,
        callback?: (result: unknown) => void,
        afterEndFlow?: (result: unknown) => void
      ) => void
      viewResult?: (typeDocument: unknown, result: unknown) => void
    }
  }
}

type VnptEkycSdkModalProps = {
  session: StartSellerVnptKycSessionResult
  onClose: () => void
  onResult: (result: unknown) => Promise<void> | void
  onError: (error: Error) => void
}

export default function VnptEkycSdkModal({
  session,
  onClose,
  onResult,
  onError,
}: VnptEkycSdkModalProps) {
  const [loading, setLoading] = useState(true)
  const submittedRef = useRef(false)
  const onResultRef = useRef(onResult)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onResultRef.current = onResult
    onErrorRef.current = onError
  }, [onError, onResult])

  useEffect(() => {
    let cancelled = false

    async function boot() {
      try {
        const config = session.sdkConfig
        if (!config) {
          throw new Error("VNPT SDK Web chưa sẵn sàng cho phiên này.")
        }

        await loadStyle(`${SDK_ASSET_BASE}/ekyc-web-sdk-2.1.0.css`, "vnpt-ekyc-sdk-css")
        await loadScript(`${SDK_ASSET_BASE}/lottie.min.js`, "vnpt-lottie")
        await loadScript(`${SDK_ASSET_BASE}/VNPTBrowserSDKAppV2.3.3.js`, "vnpt-browser-sdk")
        await loadScript(`${SDK_ASSET_BASE}/jsQR.js`, "vnpt-jsqr")
        await loadScript(`${SDK_ASSET_BASE}/ekyc-web-sdk-2.1.0.js`, "vnpt-ekyc-sdk")

        if (cancelled) return
        await window.FaceVNPTBrowserSDK?.init()

        if (!window.ekycsdk?.init) {
          throw new Error("Không tải được IVS Trust eKYC SDK.")
        }

        const baseInit = {
          BACKEND_URL: config.backendUrl,
          TOKEN_KEY: config.tokenKey,
          TOKEN_ID: config.tokenId,
          AUTHORIZION: config.accessToken,
          PARRENT_ID: SDK_MOUNT_ID,
          LANGUAGE: config.language,
          SHOW_RESULT: config.showResult,
          SHOW_HELP: config.showHelp,
          SHOW_TRADEMARK: config.showTrademark,
          USE_WEBCAM: config.useWebcam,
          USE_UPLOAD: config.useUpload,
          CHECK_LIVENESS_CARD: config.checkLivenessCard,
          CHECK_LIVENESS_FACE: config.checkLivenessFace,
          CHECK_MASKED_FACE: config.checkMaskedFace,
          COMPARE_FACE: config.compareFace,
          ADVANCE_LIVENESS_FACE: config.advanceLivenessFace,
          ENABLE_GGCAPCHAR: false,
          LIST_ITEM: config.listItem,
          TYPE_DOCUMENT: config.typeDocument,
        }

        const submitOnce = async (result: unknown) => {
          if (submittedRef.current) return
          submittedRef.current = true
          await onResultRef.current(sanitizeVnptSdkResult(result))
        }

        const startFaceFlow = (documentResult: unknown) => {
          if (cancelled || !window.ekycsdk?.init) return
          const typeDocument =
            getRecord(documentResult).type_document ??
            getRecord(documentResult).typeDocument ??
            config.typeDocument
          clearSdkMount()
          window.ekycsdk.init(
            {
              ...baseInit,
              FLOW_TYPE: "FACE",
              TYPE_DOCUMENT: typeDocument,
            },
            async (faceResult) => {
              const finalResult = {
                ...getRecord(documentResult),
                ...getRecord(faceResult),
              }
              await submitOnce(finalResult)
              window.ekycsdk?.viewResult?.(typeDocument, finalResult)
            }
          )
        }

        window.ekycsdk.init(
          {
            ...baseInit,
            FLOW_TYPE: config.flowType,
          },
          undefined,
          startFaceFlow
        )
      } catch (error) {
        onErrorRef.current(error instanceof Error ? error : new Error("Không mở được IVS Trust eKYC SDK."))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    boot()

    return () => {
      cancelled = true
    }
  }, [session])

  return (
    <div className="fixed inset-0 z-[100] bg-[#0b3141]">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-[102] inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-neutral-700 shadow"
        aria-label="Đóng IVS Trust eKYC"
      >
        <X size={20} />
      </button>
      {loading && (
        <div className="absolute inset-0 z-[101] flex items-center justify-center bg-[#0b3141] text-white">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Loader2 size={18} className="animate-spin" />
            Đang mở IVS Trust eKYC...
            <div className="mt-1 text-xs text-white/70">Xác minh được cung cấp bởi VNPT</div>
          </div>
        </div>
      )}
      <div id={SDK_MOUNT_ID} className="h-full w-full" />
    </div>
  )
}

function getRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function clearSdkMount() {
  const mount = document.getElementById(SDK_MOUNT_ID)
  if (mount) {
    mount.innerHTML = ""
  }
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

function loadScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null
    if (existing?.dataset.loaded === "true") {
      resolve()
      return
    }
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true })
      existing.addEventListener("error", () => reject(new Error(`Không tải được ${src}`)), { once: true })
      return
    }

    const script = document.createElement("script")
    script.id = id
    script.src = src
    script.async = false
    script.onload = () => {
      script.dataset.loaded = "true"
      resolve()
    }
    script.onerror = () => reject(new Error(`Không tải được ${src}`))
    document.body.appendChild(script)
  })
}

function loadStyle(href: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLLinkElement | null
    if (existing) {
      resolve()
      return
    }

    const link = document.createElement("link")
    link.id = id
    link.rel = "stylesheet"
    link.href = href
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Không tải được ${href}`))
    document.head.appendChild(link)
  })
}
