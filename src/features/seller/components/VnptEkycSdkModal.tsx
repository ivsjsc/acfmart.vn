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
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-[#0b3141] via-[#122F41] to-[#181d5d]">
      {/* Branded Header */}
      <div className="absolute left-0 right-0 top-0 z-[103] flex flex-col items-center bg-gradient-to-b from-black/30 to-transparent px-4 py-4">
        <img
          src="/brand/ivs-trust-ekyc-logo.png"
          alt="IVS TRUST eKYC"
          className="h-auto w-[180px] object-contain sm:w-[220px] md:w-[260px]"
        />
        <div className="mt-2 text-center">
          <h2 className="text-lg font-bold text-white sm:text-xl">IVS Trust eKYC</h2>
          <p className="mt-0.5 text-xs text-cyan-200/80 sm:text-sm">Xác minh giấy tờ và khuôn mặt an toàn</p>
          <p className="mt-1 text-[10px] text-white/50 sm:text-xs">Công nghệ xác minh được cung cấp bởi VNPT</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-20 z-[104] inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-neutral-700 shadow hover:bg-white"
        aria-label="Đóng IVS Trust eKYC"
      >
        <X size={20} />
      </button>

      {/* Loading Screen */}
      {loading && (
        <div className="absolute inset-0 z-[101] flex flex-col items-center justify-center bg-gradient-to-br from-[#0b3141] via-[#122F41] to-[#181d5d] text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Loader2 size={18} className="animate-spin text-cyan-400" />
              Đang mở IVS Trust eKYC...
            </div>
            <div className="space-y-1.5 text-center text-xs text-white/70">
              <p>Đang khởi tạo phiên xác minh bảo mật</p>
              <p>Vui lòng chuẩn bị CCCD/CMND và khuôn mặt rõ nét</p>
              <p className="text-orange-300/80">Không đóng trình duyệt trong quá trình xác minh</p>
              <p>Kết quả sẽ được gửi về IVS để kiểm duyệt hồ sơ</p>
            </div>
          </div>
        </div>
      )}

      {/* SDK Mount */}
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
