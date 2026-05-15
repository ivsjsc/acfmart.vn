import { firestore } from './firebase';
import { addDoc, collection, doc, deleteDoc, updateDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import type { BannerItem } from '../types/banner-item';

export { type BannerItem }; // Thêm dòng này để export kiểu BannerItem

export const getAllBanners = async (): Promise<BannerItem[]> => {
  try {
    const querySnapshot = await getDocs(query(collection(firestore, 'banners'), orderBy('position')));
    const banners: BannerItem[] = [];
    
    querySnapshot.forEach((doc) => {
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

export const createBanner = async (bannerData: Omit<BannerItem, 'id'>): Promise<string> => {
  try {
    const user = getAuth().currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const docRef = await addDoc(collection(firestore, 'banners'), {
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
    const querySnapshot = await getDocs(query(collection(firestore, 'banners'), orderBy('position')));
    const banners: BannerItem[] = [];
    
    querySnapshot.forEach((doc) => {
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

export const updateBanner = async (id: string, data: Partial<BannerItem>): Promise<void> => {
  try {
    const bannerRef = doc(firestore, 'banners', id);
    await updateDoc(bannerRef, {
      ...data,
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating banner:", error);
    throw error;
  }
};

export const deleteBanner = async (id: string): Promise<void> => {
  try {
    const bannerRef = doc(firestore, 'banners', id);
    await deleteDoc(bannerRef);
  } catch (error) {
    console.error("Error deleting banner:", error);
    throw error;
  }
};