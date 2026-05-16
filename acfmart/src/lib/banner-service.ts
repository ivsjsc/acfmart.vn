import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firestore as db } from "../../../src/lib/firebase";

export interface BannerItem {
  id: string;
  image_url: string;
  link_url: string;
  title: string;
  position: number;
  active: boolean;
  source: string;
  created_at?: any;
  updated_at?: any;
}

export const createBanner = async (bannerData: Omit<BannerItem, 'id'>): Promise<string> => {
  try {
    // 确保用户有权限写入banners集合
    const user = await getAuth().currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    // 创建新banner文档
    const docRef = await addDoc(collection(db, 'banners'), {
      ...bannerData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      source: "firestore"
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating banner:", error);
    throw error;
  }
};

export const getAdminBanners = async (): Promise<BannerItem[]> => {
  try {
    const querySnapshot = await getDocs(query(collection(db, 'banners'), orderBy('position')));
    const banners: BannerItem[] = [];
    
    querySnapshot.forEach((doc: any) => {
      banners.push({
        id: doc.id,
        ...doc.data()
      } as BannerItem);
    });
    
    return banners;
  } catch (error) {
    console.error("Error fetching banners:", error);
    throw error;
  }
};

export const updateBanner = async (id: string, updates: Partial<BannerItem>): Promise<void> => {
  try {
    const user = getAuth().currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    await updateDoc(doc(db, 'banners', id), {
      ...updates,
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating banner:", error);
    throw error;
  }
};

export const deleteBanner = async (id: string): Promise<void> => {
  try {
    const user = getAuth().currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    await deleteDoc(doc(db, 'banners', id));
  } catch (error) {
    console.error("Error deleting banner:", error);
    throw error;
  }
};