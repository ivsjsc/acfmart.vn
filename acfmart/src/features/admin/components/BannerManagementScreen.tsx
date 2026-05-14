export default function BannerManagementScreen() {
  const [banners, setBanners] = useState([
    {
      id: 1,
      imageUrl: 'https://placehold.co/600x400/ff6b6b/ffffff?text=ACFMart',
      link: 'https://www.facebook.com/acfmart/',
      title: 'Khuyến mãi hè 2024',
      position: 0,
      isActive: true,
    },
  ]);

  const [newBanner, setNewBanner] = useState({
    imageUrl: '',
    link: '',
    title: '',
    position: 0,
    isActive: true,
  });

  const handleAddBanner = () => {
    if (!newBanner.imageUrl || !newBanner.link) {
      alert('Vui lòng điền đầy đủ URL hình ảnh và liên kết!');
      return;
    }
    const banner = {
      ...newBanner,
      id: Date.now(),
    };
    setBanners([banner, ...banners]);
    setNewBanner({ imageUrl: '', link: '', title: '', position: 0, isActive: true });
  };

  const handleRemoveBanner = (id: number) => {
    setBanners(banners.filter((b) => b.id !== id));
  };

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
              <Label htmlFor="imageUrl">URL Hình ảnh *</Label>
              <Input
                id="imageUrl"
                value={newBanner.imageUrl}
                onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="link">Link khi click (URL đích)</Label>
              <Input
                id="link"
                value={newBanner.link}
                onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="title">Tiêu đề (hiện thị trên ảnh)</Label>
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
                checked={newBanner.isActive}
                onChange={(e) => setNewBanner({ ...newBanner, isActive: e.target.checked })}
              />
              <Label htmlFor="isActive">Hiển thị (active)</Label>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={handleAddBanner}>Thêm</Button>
            <Button variant="outline" onClick={() => setNewBanner({ imageUrl: '', link: '', title: '', position: 0, isActive: true })}>
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
                  <img src={banner.imageUrl} alt={banner.title} className="h-20 w-32 object-cover rounded" />
                  <div>
                    <p className="font-medium">{banner.title}</p>
                    <p className="text-sm text-gray-500">Vị trí: {banner.position}, Trạng thái: {banner.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleRemoveBanner(banner.id)}>
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