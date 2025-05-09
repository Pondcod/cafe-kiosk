// Prices for items
export const Prices = {
  coffee: 2.5,
  tea: 2.0,
  milk: 1.5,
  bakery: 3.0,
  others: 2.0,
};

// Cart state
export const CartState = {
  totalItems: 0,
  totalPrice: 0.0,
  items: [],
};

// Functions to update cart state
export const addItemToCart = (item, price) => {
  CartState.items.push(item);
  CartState.totalItems += 1;
  CartState.totalPrice += price;
};

export const removeItemFromCart = (item, price) => {
  const index = CartState.items.indexOf(item);
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

// Sizes for customization
export const Sizes = ['Small', 'Regular', 'Large'];

// Available add-ons for customization
export const AddOns = [
  { name: 'Extra Shot', price: 0.5 },
  { name: 'Whipped Cream', price: 0.3 },
  { name: 'Caramel Drizzle', price: 0.4 },
];

// Color palette for consistent styling
export const ColorPalette = {
  beige_cus_1: '#F5F5DC',
  beige_cus_2: '#FAF3E0',
  yellow_cus: '#FFD700',
  gray_cus: '#D3D3D3',
  blue_cus: '#87CEEB',
  green_cus: '#32CD32',
};

// Default item details (for fallback or testing)
export const DefaultItem = {
  name: 'Default Item',
  image: '/path/to/default-image.png',
  basePrice: 0.0,
};

// Utility function to calculate total price with add-ons
export const calculateTotalPrice = (basePrice, addOns) => {
  const addOnsPrice = addOns.reduce((total, addOn) => total + addOn.price, 0);
  return basePrice + addOnsPrice;
};