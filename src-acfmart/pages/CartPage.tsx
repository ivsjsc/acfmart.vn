import { Button, Checkbox, Input, Radio, Space, Typography } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart();

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
  };

  const handleQuantityChange = (id: string, delta: number) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      updateQuantity(id, item.quantity + delta);
    }
  };

  const totalPrice = getTotalPrice();
  const selectedCount = cartItems.length;

  return (
    <div style={{ padding: '20px' }}>
      <Typography.Title level={3}>Giỏ hàng của bạn</Typography.Title>
      <Typography.Text type="secondary">{selectedCount}/{cartItems.length} sản phẩm được chọn</Typography.Text>

      {/* 购物车列表 */}
      {cartItems.length === 0 ? (
        <Typography.Paragraph>Không có sản phẩm nào trong giỏ hàng.</Typography.Paragraph>
      ) : (
        cartItems.map((item) => (
          <div key={item.id} style={{ border: '1px solid #d9d9d9', margin: '10px 0', padding: '10px' }}>
            <Checkbox checked={true} />
            <img src={item.image || `https://placehold.co/80x80?text=${item.name}`} alt={item.name} style={{ width: 80, height: 80, marginRight: 10 }} />
            <div>
              <Typography.Text strong>{item.name}</Typography.Text>
              <Typography.Text type="secondary" style={{ display: 'block' }}>
                Thương hiệu: {item.brand}
              </Typography.Text>
              <Space size="middle">
                <Button onClick={() => handleQuantityChange(item.id, -1)}>-</Button>
                <Typography.Text>{item.quantity}</Typography.Text>
                <Button onClick={() => handleQuantityChange(item.id, 1)}>+</Button>
              </Space>
              <Button danger onClick={() => handleRemoveItem(item.id)} icon={<ShoppingCartOutlined />} />
              <Typography.Text type="danger" strong style={{ marginTop: 8 }}>
                {item.price.toLocaleString()} ₫
              </Typography.Text>
            </div>
          </div>
        ))
      )}
      
      {cartItems.length > 0 && (
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <Typography.Title level={4}>
            Tổng cộng: {totalPrice.toLocaleString()} ₫
          </Typography.Title>
          <Button type="primary" size="large" style={{ marginTop: '10px' }}>
            Thanh toán
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartPage;