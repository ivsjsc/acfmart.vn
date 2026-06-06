import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
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
          FLOW_TYPE: config.flowType,
          // VNPT SDK style/theme config - required to prevent crashes
          LIST_CHOOSE_STYLE: {
            background: "#181d5d",
            background_icon: "#122F41",
            item_active_color: "#00c896",
            start_button_background: "#e85e02",
            start_button_color: "#ffffff",
            id_icon: "https://ekyc-web.icenter.ai/img/id.svg",
            passport_icon: "https://ekyc-web.icenter.ai/img/passport.svg",
            drivecard_icon: "https://ekyc-web.icenter.ai/img/driving_license.svg",
            army_id_icon: "https://ekyc-web.icenter.ai/img/military.svg",
            id_chip_icon: "https://ekyc-web.icenter.ai/img/id_card_chip.svg",
          },
          CAPTURE_IMAGE_STYLE: {
            popup1_box_shadow: "0px 0px 10px rgba(0,0,0,0.5)",
            popup1_title_color: "#ffffff",
            description1_color: "#fafdff",
            capture_btn_background: "#e85e02",
            capture_btn_color: "#ffffff",
            capture_btn_icon: "https://ekyc-web.icenter.ai/img/capture.svg",
            tutorial_btn_icon: "https://ekyc-web.icenter.ai/img/tutorial.svg",
            recapture_btn_background: "#ffffff",
            recapture_btn_border: "1px solid #D9D9D9",
            recapture_btn_icon: "https://ekyc-web.icenter.ai/img/recapture.svg",
            recapture_btn_color: "#111127",
            nextstep_btn_background: "#e85e02",
            nextstep_btn_color: "#ffffff",
            popup2_box_shadow: "0px 0px 10px rgba(0,0,0,0.5)",
            popup2_title_header_color: "#ffffff",
            popup2_icon_header: "https://ekyc-web.icenter.ai/img/info.svg",
          },
          MOBILE_STYLE: {
            mobile_capture_btn: "https://ekyc-web.icenter.ai/img/capture.svg",
            mobile_capture_desc_color: "#ffffff",
            mobile_tutorial_color: "#fafdff",
            mobile_recapture_btn_background: "#ffffff",
            mobile_recapture_btn_border: "1px solid #D9D9D9",
            mobile_recapture_btn_icon: "https://ekyc-web.icenter.ai/img/recapture.svg",
            mobile_recapture_btn_color: "#111127",
            mobile_nextstep_btn_background: "#e85e02",
            mobile_nextstep_btn_icon: "https://ekyc-web.icenter.ai/img/next.svg",
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
