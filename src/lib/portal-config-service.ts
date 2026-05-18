import { firestore } from "./firebase"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import type { AppDomain } from "./domain"
import type { PortalConfig, PortalImageSlot } from "../types/portal-config"

/**
 * Fetch the portal configuration for a given domain.
 * Returns `null` when the document does not exist yet.
 */
export async function getPortalConfig(
  portal: AppDomain,
): Promise<PortalConfig | null> {
  const snap = await getDoc(doc(firestore, "portalConfig", portal))
  if (!snap.exists()) return null
  return { portal, ...snap.data() } as PortalConfig
}

/**
 * Upsert portal configuration.
 * Merges so that missing fields are not deleted.
 */
export async function savePortalConfig(
  portal: AppDomain,
  images: Record<string, PortalImageSlot>,
): Promise<void> {
  const user = getAuth().currentUser
  if (!user) throw new Error("User not authenticated")

  await setDoc(
    doc(firestore, "portalConfig", portal),
    {
      portal,
      images,
      updated_at: serverTimestamp(),
      updated_by: user.email ?? user.uid,
    },
    { merge: true },
  )
}
