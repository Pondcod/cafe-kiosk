// --- DRINKS & BEVERAGES ---
export const Menu = [
    // Espresso
    { name: "Hot Espresso", mainCategory: "Espresso", subCategory: ["Coffee"], sizes: { Regular: 75, Large: 90 }, image: "/assets/Menu_cafe/Espresso/Hot_Espresso.png" },
    { name: "Iced Espresso", mainCategory: "Espresso", subCategory: ["Coffee"], sizes: { Regular: 85, Large: 100 }, image: "/assets/Menu_cafe/Espresso/IcedEspresso.png" },
    { name: "Espresso Frappe", mainCategory: "Espresso", subCategory: ["Coffee"], sizes: { Regular: 100, Large: 115 }, image: "/assets/Menu_cafe/Espresso/Espresso_Frappe.png" },
  
    // Americano
    { name: "Hot Americano", mainCategory: "Americano", subCategory: ["Coffee"], sizes: { Regular: 85, Large: 95 }, image: "/assets/Menu_cafe/Americano/Hot_Americano.png" },
    { name: "Iced Americano", mainCategory: "Americano", subCategory: ["Coffee"], sizes: { Regular: 90, Large: 105 }, image: "/assets/Menu_cafe/Americano/Iced_Americano.png" },
  
    // Latte
    { name: "Hot Latte", mainCategory: "Latte", subCategory: ["Coffee", "Milk"], sizes: { Regular: 100, Large: 115 }, image: "/assets/Menu_cafe/Latte/Hot_Americano.png" },
    { name: "Iced Latte", mainCategory: "Latte", subCategory: ["Coffee", "Milk"], sizes: { Regular: 110, Large: 125 }, image: "/assets/Menu_cafe/Latte/Iced_Americano.png" },
    { name: "Latte Frappuccino", mainCategory: "Latte", subCategory: ["Coffee", "Milk"], sizes: { Regular: 120, Large: 135 }, image: "/assets/Menu_cafe/Latte/Latte_Frappuccino.png" },
  
    // Mocha
    { name: "Hot Mocha", mainCategory: "Mocha", subCategory: ["Coffee", "Milk"], sizes: { Regular: 110, Large: 125 }, image: "/assets/Menu_cafe/Mocha/Hot_Mocha.png" },
    { name: "Iced Mocha", mainCategory: "Mocha", subCategory: ["Coffee", "Milk"], sizes: { Regular: 120, Large: 135 }, image: "/assets/Menu_cafe/Mocha/Iced_Mocha.png" },
    { name: "Mocha Frappuccino", mainCategory: "Mocha", subCategory: ["Coffee", "Milk"], sizes: { Regular: 130, Large: 145 }, image: "/assets/Menu_cafe/Mocha/Mocha_Frappuccino.png" },
  
    // Chocolate
    { name: "Hot Chocolate", mainCategory: "Chocolate", subCategory: ["Milk"], sizes: { Regular: 100, Large: 115 }, image: "/assets/Menu_cafe/Mocha/Hot_Chocolate.png" },
    { name: "Iced Chocolate", mainCategory: "Chocolate", subCategory: ["Milk"], sizes: { Regular: 110, Large: 125 }, image: "/assets/Menu_cafe/Mocha/Iced_Chocolate.png" },
    { name: "Iced Mint Chocolate", mainCategory: "Chocolate", subCategory: ["Milk"], sizes: { Regular: 120, Large: 135 }, image: "/assets/Menu_cafe/Mocha/Hot_Chocolate.png" },
    { name: "Chocolate Frappuccino", mainCategory: "Chocolate", subCategory: ["Milk"], sizes: { Regular: 130, Large: 145 }, image: "/assets/Menu_cafe/Mocha/Hot_Chocolate.png" },
  
    // Matcha
    { name: "Hot Matcha", mainCategory: "Matcha", subCategory: ["Tea", "Milk"], sizes: { Regular: 110, Large: 125 } },
    { name: "Iced Matcha", mainCategory: "Matcha", subCategory: ["Tea", "Milk"], sizes: { Regular: 120, Large: 135 } },
    { name: "Matcha Frappuccino", mainCategory: "Matcha", subCategory: ["Tea", "Milk"], sizes: { Regular: 130, Large: 145 } },
  
    // Cappuccino
    { name: "Hot Cappuccino", mainCategory: "Cappuccino", subCategory: ["Coffee", "Milk"], sizes: { Regular: 100, Large: 115 } },
    { name: "Iced Cappuccino", mainCategory: "Cappuccino", subCategory: ["Coffee", "Milk"], sizes: { Regular: 110, Large: 125 } },
    { name: "Cappuccino Frappe", mainCategory: "Cappuccino", subCategory: ["Coffee", "Milk"], sizes: { Regular: 120, Large: 135 } },
  
    // Tea
    { name: "Hot Chai Brewed Tea", mainCategory: "Chai", subCategory: ["Tea"], sizes: { Regular: 70, Large: 85 } },
    { name: "Hot Chai Tea Latte", mainCategory: "Chai", subCategory: ["Tea", "Milk"], sizes: { Regular: 100, Large: 115 } },
    { name: "Iced Chai Tea Latte", mainCategory: "Chai", subCategory: ["Tea", "Milk"], sizes: { Regular: 110, Large: 125 } },
    { name: "Iced Black Tea Lemon", mainCategory: "Black Tea", subCategory: ["Tea"], sizes: { Regular: 90, Large: 105 } },
    { name: "Iced Black Tea", mainCategory: "Black Tea", subCategory: ["Tea"], sizes: { Regular: 80, Large: 95 } },
    { name: "Hot Earl Grey Tea", mainCategory: "Earl Grey", subCategory: ["Tea"], sizes: { Regular: 70, Large: 85 } },
    { name: "Thai Tea Frappe", mainCategory: "Thai Tea", subCategory: ["Tea", "Milk"], sizes: { Regular: 120, Large: 135 } },
    { name: "Iced Thai Tea", mainCategory: "Thai Tea", subCategory: ["Tea", "Milk"], sizes: { Regular: 110, Large: 125 } },
  
    // Macchiatos
    { name: "Hot Latte Macchiatos", mainCategory: "Macchiatos", subCategory: ["Coffee", "Milk"], sizes: { Regular: 100, Large: 115 } },
    { name: "Caramel Frappuccino", mainCategory: "Macchiatos", subCategory: ["Coffee", "Milk"], sizes: { Regular: 130, Large: 145 } },
    { name: "Iced Caramel Macchiatos", mainCategory: "Macchiatos", subCategory: ["Coffee", "Milk"], sizes: { Regular: 120, Large: 135 } },
    { name: "Hot Caramel Macchiatos", mainCategory: "Macchiatos", subCategory: ["Coffee", "Milk"], sizes: { Regular: 110, Large: 125 } },
    { name: "Hot Espresso Macchiatos", mainCategory: "Macchiatos", subCategory: ["Coffee", "Milk"], sizes: { Regular: 80, Large: 95 } },
  
    // Juice
    { name: "Iced Honey Lemon", mainCategory: "Juice", subCategory: ["Others"], sizes: { Regular: 90, Large: 105 } },
    { name: "Iced Apple Juice", mainCategory: "Juice", subCategory: ["Others"], sizes: { Regular: 100, Large: 115 } },
    { name: "Lemonade Frappe", mainCategory: "Juice", subCategory: ["Others"], sizes: { Regular: 110, Large: 125 } },
    { name: "Watermelon Frappe", mainCategory: "Juice", subCategory: ["Others"], sizes: { Regular: 120, Large: 135 } },
    { name: "Orange Frappe", mainCategory: "Juice", subCategory: ["Others"], sizes: { Regular: 120, Large: 135 } },
    { name: "Fresh Orange Juice", mainCategory: "Juice", subCategory: ["Others"], sizes: { Regular: 110, Large: 125 } },
    { name: "Iced Lemonade", mainCategory: "Juice", subCategory: ["Others"], sizes: { Regular: 100, Large: 115 } },
  
    // Italian Soda
    { name: "Watermelon Wave", mainCategory: "Italian Soda", subCategory: ["Others"], sizes: { Regular: 90, Large: 105 } },
    { name: "Lemon Zest", mainCategory: "Italian Soda", subCategory: ["Others"], sizes: { Regular: 90, Large: 105 } },
    { name: "Vanilla Cream", mainCategory: "Italian Soda", subCategory: ["Others"], sizes: { Regular: 100, Large: 115 } },
    { name: "Green Apple Pop", mainCategory: "Italian Soda", subCategory: ["Others"], sizes: { Regular: 90, Large: 105 } },
    { name: "Peach Fizz", mainCategory: "Italian Soda", subCategory: ["Others"], sizes: { Regular: 90, Large: 105 } },
    { name: "Strawberry Sparkle", mainCategory: "Italian Soda", subCategory: ["Others"], sizes: { Regular: 90, Large: 105 } },
  
    // Mocktail
    { name: "Watermelon Cooler", mainCategory: "Mocktail", subCategory: ["Others"], sizes: { Regular: 110, Large: 125 } },
    { name: "Lavender Lemonade", mainCategory: "Mocktail", subCategory: ["Others"], sizes: { Regular: 110, Large: 125 } },
    { name: "Cucumber Chill", mainCategory: "Mocktail", subCategory: ["Others"], sizes: { Regular: 110, Large: 125 } },
    { name: "Minty Mojito", mainCategory: "Mocktail", subCategory: ["Others"], sizes: { Regular: 110, Large: 125 } },
    { name: "Peachy Keen", mainCategory: "Mocktail", subCategory: ["Others"], sizes: { Regular: 110, Large: 125 } },
    { name: "Citrus Garden", mainCategory: "Mocktail", subCategory: ["Others"], sizes: { Regular: 110, Large: 125 } },
    { name: "Berry Bliss", mainCategory: "Mocktail", subCategory: ["Others"], sizes: { Regular: 120, Large: 135 } },
    {
      name: "Strawberry Shortcake",
      mainCategory: "Strawberry Shortcake",
      subCategory: ["Cake"],
      sizes: { Regular: 145, Large: 245 }
    },
    {
      name: "Mini Fruit Tart",
      mainCategory: "Mini Fruit Tart",
      subCategory: ["Bakery", "Cake"],
      sizes: { Regular: 105, Large: 175 }
    },
    {
      name: "Raspberry Jam Tart",
      mainCategory: "Raspberry Jam Tart",
      subCategory: ["Bakery"],
      sizes: { Regular: 105, Large: 175 }
    },
    {
      name: "Vanilla Eclair",
      mainCategory: "Vanilla Eclair",
      subCategory: ["Bakery"],
      sizes: { Regular: 115, Large: 185 }
    },
    {
      name: "Italian Tiramisu",
      mainCategory: "Italian Tiramisu",
      subCategory: ["Bakery", "Cake"],
      sizes: { Regular: 145, Large: 245 }
    },
    {
      name: "Chocolate Fudge Brownie",
      mainCategory: "Chocolate Fudge Brownie",
      subCategory: ["Bakery", "Cake"],
      sizes: { Regular: 115, Large: 185 }
    },
    {
      name: "Red Velvet Cupcake",
      mainCategory: "Red Velvet Cupcake",
      subCategory: ["Bakery", "Cake"],
      sizes: { Regular: 105, Large: 175 }
    },
    {
      name: "Cheese Cake",
      mainCategory: "Cheese Cake",
      subCategory: ["Cake"],
      sizes: { Regular: 145, Large: 245 }
    },
    {
      name: "Focaccia Bread",
      mainCategory: "Focaccia Bread",
      subCategory: ["Bakery"],
      sizes: { Regular: 115, Large: 185 }
    },
    {
      name: "Brioche Bread",
      mainCategory: "Brioche Bread",
      subCategory: ["Bakery"],
      sizes: { Regular: 105, Large: 175 }
    },
    {
      name: "French Baguette",
      mainCategory: "French Baguette",
      subCategory: ["Bakery"],
      sizes: { Regular: 115, Large: 185 }
    },
    {
      name: "Sourdough Bread",
      mainCategory: "Sourdough Bread",
      subCategory: ["Bakery"],
      sizes: { Regular: 125, Large: 195 }
    },
    {
      name: "Banana Bread",
      mainCategory: "Banana Bread",
      subCategory: ["Bakery"],
      sizes: { Regular: 105, Large: 175 }
    },
    {
      name: "Danish Almond",
      mainCategory: "Danish Almond",
      subCategory: ["Bakery"],
      sizes: { Regular: 105, Large: 175 }
    },
    {
      name: "Pain Au Chocolat",
      mainCategory: "Pain Au Chocolat",
      subCategory: ["Bakery"],
      sizes: { Regular: 105, Large: 175 }
    },
    {
      name: "Cinnamon Roll",
      mainCategory: "Cinnamon Roll",
      subCategory: ["Bakery"],
      sizes: { Regular: 105, Large: 175 }
    },
    {
      name: "Waffle",
      mainCategory: "Waffle",
      subCategory: ["Bakery"],
      sizes: { Regular: 115, Large: 185 }
    },
    {
      name: "Chocolate Chip Muffin",
      mainCategory: "Chocolate Chip Muffin",
      subCategory: ["Bakery", "Cake"],
      sizes: { Regular: 95, Large: 165 }
    },
    {
      name: "Chocolate Chip Cookie",
      mainCategory: "Chocolate Chip Cookie",
      subCategory: ["Bakery"],
      sizes: { Regular: 85, Large: 115 }
    },
    {
      name: "Croissant",
      mainCategory: "Croissant",
      subCategory: ["Bakery"],
      sizes: { Regular: 95, Large: 165 }
    }
  ];
  
  // --- MILK OPTIONS ---
  export const MilkOptions = [
    { name: "Whole Milk", price: 0 },
    { name: "Oat Milk", price: 15 },
    { name: "Soy Milk", price: 10 },
    { name: "Almond Milk", price: 10 },
  ];
  
// --- ADD-ONS ---
export const AddOns = [
  { name: "Whipped Cream", price: 15 },
  { name: "Chocolate Chips", price: 15 },
  { name: "Chocolate Sauce", price: 10 },
  { name: "Caramel Sauce", price: 10 },
  { name: "Espresso Shot", price: 20 },
];

  // --- SWEETNESS LEVELS ---
  export const SweetnessLevels = ["Less Sweet", "Regular Sweet", "Extra Sweet"];
  
  // --- SIZE LABELS ---
  export const Sizes = ["Regular", "Large"];