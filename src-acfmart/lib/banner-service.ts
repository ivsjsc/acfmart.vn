import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { fetchAndActivate, getValue } from "firebase/remote-config"
import { firestore } from "./firebase"

export interface BannerItem {
  id: string
  image_url: string
  link_url: string
  title: string
  position: number
  active: boolean
  source: "firestore" | "remote_config"
  created_at?: Timestamp
}

const bannersCol = collection(firestore, "banners")

/**
 * Fetch banners from Firestore collection
 */
async function fetchFirestoreBanners(): Promise<BannerItem[]> {
  const q = query(
    bannersCol,
    where("active", "==", true),
    orderBy("position", "asc")
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    source: "firestore" as const,
  })) as BannerItem[]
}

/**
 * Fetch banners from Firebase Remote Config
 */
async function fetchRemoteConfigBanners(
  remoteConfig: any
): Promise<BannerItem[]> {
  try {
    await fetchAndActivate(remoteConfig)
    const bannersJson = getValue(remoteConfig, "homepage_banners").asString()
    if (!bannersJson) return []

    const parsed = JSON.parse(bannersJson) as Array<{
      image_url: string
      link_url: string
      title: string
      position?: number
    }>

    return parsed.map((b, i) => ({
      id: `rc_${i}`,
      image_url: b.image_url,
      link_url: b.link_url,
      title: b.title,
      position: b.position ?? 100 + i,
      active: true,
      source: "remote_config" as const,
    }))
  } catch {
    return []
  }
}

/**
 * Get all banners from both sources, merged and sorted by position
 */
export async function getAllBanners(
  remoteConfig?: any
): Promise<BannerItem[]> {
  const [firestoreBanners, rcBanners] = await Promise.all([
    fetchFirestoreBanners().catch(() => []),
    remoteConfig ? fetchRemoteConfigBanners(remoteConfig) : Promise.resolve([]),
  ])

  const all = [...firestoreBanners, ...rcBanners]
  all.sort((a, b) => a.position - b.position)
  return all
}

// ─── Admin CRUD for Firestore banners ───────────────────────────────────────

export async function getAdminBanners(): Promise<BannerItem[]> {
  const q = query(bannersCol, orderBy("position", "asc"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    source: "firestore" as const,
  })) as BannerItem[]
}

export async function createBanner(
  data: Omit<BannerItem, "id" | "source" | "created_at">
): Promise<string> {
  const docRef = await addDoc(bannersCol, {
    ...data,
    source: "firestore",
    created_at: serverTimestamp(),
  })
  return docRef.id
}

export async function updateBanner(
  id: string,
  data: Partial<Omit<BannerItem, "id" | "source">>
): Promise<void> {
  const docRef = doc(bannersCol, id)
  await updateDoc(docRef, data)
}

export async function deleteBanner(id: string): Promise<void> {
  const docRef = doc(bannersCol, id)
  await deleteDoc(docRef)
}
