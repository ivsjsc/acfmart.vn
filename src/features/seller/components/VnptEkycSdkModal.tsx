import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import type { StartSellerVnptKycSessionResult } from "../../../lib/kyc"
import "../styles/vnpt-ekyc-overrides.css"

const SDK_MOUNT_ID = "ekyc_sdk_intergrated"
const SDK_ASSET_BASE = "/vnpt-ekyc/v3.2.1"

declare global {
  interface Window {
    FaceVNPTBrowserSDK?: {
      init: () => Promise<void> | void
    }
    VNPTQRBrowserApp?: {
      new (): {
        init: (config: Record<string, unknown>) => Promise<void>
        startFlow: () => Promise<void>
      }
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
        // Check camera permission before initializing SDK
        if (navigator.permissions && navigator.permissions.query) {
          try {
            const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName })
            if (cameraPermission.state === 'denied') {
              throw new Error("Trình duyệt chưa được cấp quyền sử dụng camera. Vui lòng cho phép camera để tiếp tục xác thực.")
            }
          } catch (permError) {
            // Permissions API not supported or error - continue anyway, SDK will handle it
            if (permError instanceof Error && permError.message.includes("camera")) {
              throw permError
            }
          }
        }

        const config = session.sdkConfig
        if (!config) {
          throw new Error("VNPT SDK Web chưa sẵn sàng cho phiên này.")
        }

        // Load SDK 3.2.1 scripts in REQUIRED order (per VNPT documentation)
        // 1. Main SDK entry point (MANDATORY)
        await loadScript(`${SDK_ASSET_BASE}/web-sdk-version-3.2.1.0.js`, "vnpt-ekyc-web-sdk")
        
        // 2. QR Browser App
        await loadScript(`${SDK_ASSET_BASE}/lib/VNPTQRBrowserApp.js`, "vnpt-qr-sdk")
        
        // 3. Browser SDK Core
        await loadScript(`${SDK_ASSET_BASE}/lib/VNPTBrowserSDKAppV4.1.0.js`, "vnpt-browser-sdk")

        if (cancelled) return
        await window.FaceVNPTBrowserSDK?.init()

        if (!window.ekycsdk?.init && !window.VNPTQRBrowserApp) {
          throw new Error("Không tải được IVS Trust eKYC SDK.")
        }

        // SECURITY: SDK 3.2.1 uses session-based auth - NO tokens in frontend
        // All credentials are handled by backend proxy
        const proxyBackendUrl = config.backendUrl
        if (!proxyBackendUrl) {
          throw new Error("VNPT SDK backend URL chưa được cấu hình.")
        }

        // DEV-only diagnostics: log config structure, not values
        if (import.meta.env.DEV) {
          const configKeys = Object.keys(config).sort()
          console.info("[eKYC] SDK config keys:", configKeys)
          const backendHost = proxyBackendUrl ? new URL(proxyBackendUrl).host : "(missing)"
          console.info(
            "[eKYC] BACKEND_URL host:",
            backendHost,
            "(using SDK proxy - no tokens in frontend)"
          )
        }

        // SDK 3.2.1 configuration - NO TOKEN_ID, TOKEN_KEY, or ACCESS_TOKEN
        // All authentication handled by backend proxy
        const baseInit = {
          BACKEND_URL: proxyBackendUrl,
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
          FLOW_TYPE: config.flowType,
          // VNPT SDK style/theme config - required to prevent crashes
          LIST_CHOOSE_STYLE: {
            background: "#181d5d",
            background_icon: "#122F41",
            item_active_color: "#00c896",
            start_button_background: "#e85e02",
            start_button_color: "#ffffff",
            id_icon: "/vnpt-ekyc/assets/id.svg",
            passport_icon: "/vnpt-ekyc/assets/passport.svg",
            drivecard_icon: "/vnpt-ekyc/assets/driving_license.svg",
            army_id_icon: "/vnpt-ekyc/assets/military.svg",
            id_chip_icon: "/vnpt-ekyc/assets/id_card_chip.svg",
          },
          CAPTURE_IMAGE_STYLE: {
            popup1_box_shadow: "0px 0px 10px rgba(0,0,0,0.5)",
            popup1_title_color: "#ffffff",
            description1_color: "#fafdff",
            capture_btn_background: "#e85e02",
            capture_btn_color: "#ffffff",
            capture_btn_icon: "/vnpt-ekyc/assets/capture.svg",
            tutorial_btn_icon: "/vnpt-ekyc/assets/tutorial.svg",
            recapture_btn_background: "#ffffff",
            recapture_btn_border: "1px solid #D9D9D9",
            recapture_btn_icon: "/vnpt-ekyc/assets/recapture.svg",
            recapture_btn_color: "#111127",
            nextstep_btn_background: "#e85e02",
            nextstep_btn_color: "#ffffff",
            popup2_box_shadow: "0px 0px 10px rgba(0,0,0,0.5)",
            popup2_title_header_color: "#ffffff",
            popup2_icon_header: "/vnpt-ekyc/assets/info.svg",
          },
          MOBILE_STYLE: {
            mobile_capture_btn: "/vnpt-ekyc/assets/capture.svg",
            mobile_capture_desc_color: "#ffffff",
            mobile_tutorial_color: "#fafdff",
            mobile_recapture_btn_background: "#ffffff",
            mobile_recapture_btn_border: "1px solid #D9D9D9",
            mobile_recapture_btn_icon: "/vnpt-ekyc/assets/recapture.svg",
            mobile_recapture_btn_color: "#111127",
            mobile_nextstep_btn_background: "#e85e02",
            mobile_nextstep_btn_icon: "/vnpt-ekyc/assets/next.svg",
            mobile_nextstep_btn_color: "#ffffff",
          },
        }

        const submitOnce = async (result: unknown) => {
          if (submittedRef.current) return
          submittedRef.current = true
          if (import.meta.env.DEV) {
            console.info("[eKYC] Submitting result (sanitized)")
          }
          await onResultRef.current(sanitizeVnptSdkResult(result))
        }

        // SDK callback handler - MUST be a function, not undefined
        const handleDocumentResult = async (documentResult: unknown) => {
          if (import.meta.env.DEV) {
            console.info("[eKYC] SDK callback event: document result received")
          }
          await startFaceFlow(documentResult)
        }

        const startFaceFlow = (documentResult: unknown) => {
          if (cancelled || !window.ekycsdk?.init) return
          if (import.meta.env.DEV) {
            console.info("[eKYC] Starting FACE flow after document capture")
          }
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

        if (import.meta.env.DEV) {
          console.info("[eKYC] Initializing SDK with flow:", config.flowType)
          console.info("[eKYC] SDK callback: document handler = function, afterEndFlow = function")
        }
        window.ekycsdk.init(
          {
            ...baseInit,
            FLOW_TYPE: config.flowType,
          },
          handleDocumentResult,
          startFaceFlow
        )
      } catch (error) {
        const isSdkNetworkError = error instanceof Error && (
          error.message.includes("addFile") ||
          error.message.includes("uploadFileFail") ||
          error.message.includes("ERR_NAME_NOT_RESOLVED")
        )

        const userMessage = isSdkNetworkError
          ? "Chưa thể gửi ảnh xác thực. Vui lòng kiểm tra kết nối và thử lại."
          : (error instanceof Error ? error.message : "Không mở được IVS Trust eKYC SDK.")

        onErrorRef.current(new Error(userMessage))
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
      {/* SDK Mount - owns the full page */}
      <div id={SDK_MOUNT_ID} className="h-full w-full" />

      {/* Close button - high z-index, only interactive element */}
      <button
        type="button"
        onClick={onClose}
        className="fixed right-4 top-4 z-[120] inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-neutral-700 shadow hover:bg-white"
        aria-label="Đóng eKYC"
      >
        <X size={20} />
      </button>

      {/* Simple loading overlay - ONLY shown before SDK is ready, completely removed when loading=false */}
      {loading && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#0b3141] text-white">
          <div className="text-sm font-semibold">
            Đang mở eKYC...
          </div>
        </div>
      )}

      {/* Scoped CSS for SDK container */}
      <style>{`
        #${SDK_MOUNT_ID},
        #${SDK_MOUNT_ID} #vnpt_ekyc {
          width: 100%;
          min-height: 100vh;
        }
      `}</style>
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

function loadScriptOptional(src: string, id: string) {
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
