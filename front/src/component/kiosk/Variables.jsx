// Cart state
export const CartState = {
  totalItems: 0,
  totalPrice: 0.0,
  items: [],
};

// Functions to update cart state (now expects full price from MenuData.js)
export const addItemToCart = (item, price, size) => {
  CartState.items.push({ ...item, size, price });
  CartState.totalItems += 1;
  CartState.totalPrice += price;
};

export const removeItemFromCart = (item, price, size) => {
  const index = CartState.items.findIndex(
    (cartItem) => cartItem.name === item.name && cartItem.size === size
  );
  if (index > -1) {
    CartState.items.splice(index, 1);
    CartState.totalItems -= 1;
    CartState.totalPrice -= price;
  }
};

export const clearCart = () => {
  CartState.items = [];
  CartState.totalItems = 0;
  CartState.totalPrice = 0.0;
};

// Available cup sizes
export const Sizes = ['Regular', 'Large'];

// Default item details (for fallback or testing)
export const DefaultItem = {
  name: 'Default Item',
  image: '/path/to/default-image.png',
  basePrice: 0.0,
};

// Calculate final item price including add-ons and milk
export const calculateTotalPrice = (
  basePrice,
  addOns = [],
  selectedMilk = null
) => {
  const addOnsPrice = addOns.reduce((sum, a) => sum + a.price, 0);
  const milkPrice   = selectedMilk ? selectedMilk.price : 0;
  return basePrice + addOnsPrice + milkPrice;
};