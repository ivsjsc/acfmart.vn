const { user, loading } = useUser(userId);
// Add fallback for shop_logo/shop_banner from vendors collection if user is admin/moderator
const { currentUser } = useAuth();
useEffect(() => {
  if (
    user &&
    (!user.shop_logo || !user.shop_banner) &&
    currentUser &&
    (currentUser.role === 'admin' || currentUser.role === 'moderator')
  ) {
    const vendorRef = firestore.collection('vendors').where('firebase_uid', '==', userId);
    vendorRef.get().then(snapshot => {
      if (!snapshot.empty) {
        const vendorData = snapshot.docs[0].data();
        setUser(prev => ({
          ...prev,
          shop_logo: vendorData.shop_logo || prev.shop_logo,
          shop_banner: vendorData.shop_banner || prev.shop_banner,
        }));
      }
    }).catch(console.error);
  }
}, [user, currentUser, userId, setUser]);