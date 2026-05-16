import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export default function UserProfileScreen() {
  const { user } = useAuth();
  const [affiliateCode, setAffiliateCode] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchAffiliateCode = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'userProfiles', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setAffiliateCode(data.affiliateCode || '');
        }
      } catch (error) {
        console.error('Error fetching affiliate code:', error);
      }
    };

    fetchAffiliateCode();
  }, [user]);

  const handleCopyCode = () => {
    if (affiliateCode) {
      navigator.clipboard.writeText(affiliateCode);
      setIsCopied(true);
      toast.success('Mã quảng cáo đã được sao chép!');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... existing user profile content ... */}

      {user?.email && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Mã Quảng Cáo Hợp Tác</h2>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center">
              <span className="font-mono text-lg flex-1">{affiliateCode || 'Đang tải...'}</span>
              <button
                onClick={handleCopyCode}
                disabled={!affiliateCode}
                className={`ml-4 px-4 py-2 rounded ${
                  isCopied
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                } transition-colors`}
                data-testid="copy-affiliate-code"
              >
                {isCopied ? 'Đã sao chép!' : 'Sao chép mã'}
              </button>
            </div>
            <p className="mt-2 text-gray-600">
              Chia sẻ mã này với đối tác quảng cáo để họ có thể quảng cáo bài viết dưới dạng quảng cáo hợp tác.
            </p>
          </div>
        </div>
      )}

      {/* ... existing code ... */}
    </div>
  );
}