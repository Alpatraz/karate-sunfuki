import { useCart } from "./CartContext";

const CartButton = ({ toggleDrawer }) => {
    const { cart } = useCart();
    const itemCount = cart.length;
  
    return (
      <button className="cart-floating-btn" onClick={toggleDrawer}>
        🛒
        {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
      </button>
    );
  };
  
  export default CartButton;