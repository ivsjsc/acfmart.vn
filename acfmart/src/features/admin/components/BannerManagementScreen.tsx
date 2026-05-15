import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { 
  getAdminBanners, 
  createBanner, 
  updateBanner, 
  deleteBanner,
  type BannerItem 
} from "../../../../src/lib/banner-service";

export default function BannerManagementScreen() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newBanner, setNewBanner] = useState({
    image_url: '',
    link_url: '',
    title: '',
    position: 0,
    active: true,
  });

  // Load banners khi component mount
  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const bannerList = await getAdminBanners();
      setBanners(bannerList);
    } catch (error) {
      console.error("Lỗi khi tải danh sách banner:", error);
      alert("Không thể tải danh sách banner. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBanner = async () => {
    if (!newBanner.image_url || !newBanner.link_url) {
      alert('Vui lòng điền đầy đủ URL hình ảnh và liên kết!');
      return;
    }
    
    try {
      const bannerId = await createBanner(newBanner);
      
      // Thêm banner mới vào danh sách
      setBanners([
        {
          id: bannerId,
          ...newBanner,
          source: "firestore"
        },
        ...banners
      ]);
      
      // Reset form
      setNewBanner({ 
        image_url: '', 
        link_url: '', 
        title: '', 
        position: 0, 
        active: true 
      });
    } catch (error) {
      console.error("Lỗi khi thêm banner:", error);
      alert("Không thể thêm banner. Vui lòng thử lại.");
    }
  };

  const handleRemoveBanner = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa banner này?")) {
      return;
    }
    
    try {
      await deleteBanner(id);
      setBanners(banners.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa banner:", error);
      alert("Không thể xóa banner. Vui lòng thử lại.");
    }
  };

  const toggleBannerStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateBanner(id, { active: !currentStatus });
      setBanners(banners.map(banner => 
        banner.id === id ? { ...banner, active: !currentStatus } : banner
      ));
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái banner:", error);
      alert("Không thể cập nhật trạng thái banner. Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div className="container-acf">
        <h1 className="mb-6 text-2xl font-bold">Quản lý Banner</h1>
        <div className="animate-pulse">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="container-acf">
      <h1 className="mb-6 text-2xl font-bold">Quản lý Banner</h1>

      {/* Add New Banner Form */}
      <Card>
        <CardHeader>
          <CardTitle>Thêm Banner mới</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="image_url">URL Hình ảnh *</Label>
              <Input
                id="image_url"
                value={newBanner.image_url}
                onChange={(e) => setNewBanner({ ...newBanner, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="link_url">Liên kết khi click (URL đích)</Label>
              <Input
                id="link_url"
                value={newBanner.link_url}
                onChange={(e) => setNewBanner({ ...newBanner, link_url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="title">Tiêu đề (hiển thị trên ảnh)</Label>
              <Input
                id="title"
                value={newBanner.title}
                onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                placeholder="Khuyến mãi mỗi hè..."
              />
            </div>
            <div>
              <Label htmlFor="position">Vị trí (số nhỏ hiển thị trước)</Label>
              <Input
                id="position"
                type="number"
                value={newBanner.position}
                onChange={(e) => setNewBanner({ ...newBanner, position: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={newBanner.active}
                onChange={(e) => setNewBanner({ ...newBanner, active: e.target.checked })}
              />
              <Label htmlFor="isActive">Hiển thị (active)</Label>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={handleAddBanner}>Thêm</Button>
            <Button 
              variant="outline" 
              onClick={() => setNewBanner({ 
                image_url: '', 
                link_url: '', 
                title: '', 
                position: 0, 
                active: true 
              })}
            >
              Hủy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Banner List */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Danh sách Banner</h2>
        {banners.length === 0 ? (
          <p className="text-center text-gray-500">Chưa có banner nào</p>
        ) : (
          <div className="space-y-4">
            {banners.map((banner) => (
              <div key={banner.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                <div className="flex items-center gap-4">
                  <img 
                    src={banner.image_url} 
                    alt={banner.title} 
                    className="h-20 w-32 object-contain rounded" 
                  />
                  <div>
                    <p className="font-medium">{banner.title}</p>
                    <p className="text-sm text-gray-500">
                      Vị trí: {banner.position}, Trạng thái: {banner.active ? 'Active' : 'Inactive'}
                    </p>
                    <p className="text-xs text-gray-400 truncate max-w-md">{banner.image_url}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={banner.active ? "outline" : "secondary"}
                    onClick={() => toggleBannerStatus(banner.id, banner.active)}
                  >
                    {banner.active ? 'Ẩn' : 'Hiển thị'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleRemoveBanner(banner.id)}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}