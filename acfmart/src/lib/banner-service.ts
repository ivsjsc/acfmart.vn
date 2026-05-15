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