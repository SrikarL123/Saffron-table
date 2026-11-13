/**
 * The Saffron Table - Single Source of Truth for Restaurant Data
 * Shared between Frontend (browser) and Backend (Node.js/Express)
 */
(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else {
    root.RESTAURANT_DATA = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  const CONFIG = {
    name: "The Saffron Table",
    tagline: "Modern Indian kitchen and family dining in Hyderabad",
    phone: "",
    wa: "",
    demoMode: true,
    siteUrl: "",
    outlets: [
      {
        id: "banjara-hills",
        name: "Banjara Hills (demo)",
        neighbourhood: "Banjara Hills",
        city: "Hyderabad",
        addr: "Demo Address 12, Road No. 1, Banjara Hills, Hyderabad",
        map: "Banjara Hills, Hyderabad",
        open: "11:00",
        close: "23:00",
        off: null,
        special: { 5: "24:00", 6: "24:00" },
        note: "Open till midnight on Fri & Sat",
        real: false
      },
      {
        id: "gachibowli",
        name: "Gachibowli (demo)",
        neighbourhood: "Gachibowli",
        city: "Hyderabad",
        addr: "Demo Address 8, Tech Park Road, Gachibowli, Hyderabad",
        map: "Gachibowli, Hyderabad",
        open: "11:00",
        close: "22:30",
        off: 1,
        special: {},
        note: "Closed on Mondays",
        real: false
      }
    ]
  };

  const CATS = {
    Starters: [
      ["Paneer Tikka", 280, 1, "Char-grilled cottage cheese in spiced yoghurt", "Bestseller"],
      ["Chicken 65", 320, 0, "Crisp Hyderabadi-style fried chicken with curry leaf", "Bestseller"],
      ["Crispy Corn", 230, 1, "Golden corn tossed with pepper and spring onion"],
      ["Tandoori Mushroom", 260, 1, "Mushrooms marinated and roasted in the tandoor"],
      ["Chicken Tikka", 340, 0, "Tender chicken, smoky from the tandoor", "Chef's special"]
    ],
    Soups: [
      ["Tomato Soup", 150, 1, "Slow-cooked tomato with herbs"],
      ["Sweet Corn Soup", 160, 1, "Creamy corn with vegetables"],
      ["Hot & Sour Chicken Soup", 190, 0, "Peppery broth with shredded chicken"],
      ["Veg Manchow Soup", 170, 1, "Spiced soup with crispy noodles"]
    ],
    "Main Course": [
      ["Paneer Butter Masala", 300, 1, "Cottage cheese in a rich tomato-butter gravy", "Bestseller"],
      ["Butter Chicken", 360, 0, "Tandoori chicken in creamy tomato gravy", "Bestseller"],
      ["Kadai Paneer", 310, 1, "Paneer with peppers in a bold kadai masala"],
      ["Dal Makhani", 260, 1, "Black lentils simmered overnight with cream"],
      ["Chicken Curry", 330, 0, "Home-style curry with ground spices"]
    ],
    Breads: [
      ["Butter Naan", 60, 1, "Soft tandoor bread brushed with butter"],
      ["Garlic Naan", 75, 1, "Naan with roasted garlic and coriander"],
      ["Tandoori Roti", 40, 1, "Whole wheat bread from the tandoor"],
      ["Laccha Paratha", 70, 1, "Flaky layered whole wheat paratha"]
    ],
    "Rice & Biryani": [
      ["Hyderabadi Chicken Dum Biryani", 350, 0, "Basmati and chicken sealed and slow-cooked", "Bestseller"],
      ["Mutton Dum Biryani", 450, 0, "Tender mutton layered with saffron rice", "Chef's special"],
      ["Veg Dum Biryani", 290, 1, "Seasonal vegetables dum-cooked with basmati"],
      ["Jeera Rice", 150, 1, "Basmati tempered with cumin"],
      ["Steamed Rice", 110, 1, "Plain basmati rice"]
    ],
    Chinese: [
      ["Veg Hakka Noodles", 220, 1, "Wok-tossed noodles with crunchy vegetables"],
      ["Chicken Fried Rice", 260, 0, "Smoky wok fried rice with egg and chicken"],
      ["Chilli Paneer", 290, 1, "Paneer in a spicy soy-chilli glaze"],
      ["Chicken Manchurian", 300, 0, "Chicken in tangy Indo-Chinese sauce"]
    ],
    Continental: [
      ["White Sauce Pasta", 250, 1, "Penne in creamy garlic white sauce"],
      ["Red Sauce Pasta", 240, 1, "Penne in herbed tomato sauce"],
      ["Grilled Sandwich", 180, 1, "Vegetable and cheese sandwich, grilled"],
      ["French Fries", 150, 1, "Crisp salted fries"]
    ],
    Desserts: [
      ["Gulab Jamun", 120, 1, "Milk dumplings in cardamom syrup"],
      ["Brownie with Ice Cream", 220, 1, "Warm brownie with vanilla ice cream", "Bestseller"],
      ["Rasmalai", 150, 1, "Soft paneer discs in saffron milk"],
      ["Chocolate Mousse", 180, 1, "Light, airy dark chocolate mousse"]
    ],
    Beverages: [
      ["Fresh Lime Soda", 90, 1, "Sweet, salted or mixed"],
      ["Mango Lassi", 130, 1, "Thick yoghurt and mango"],
      ["Cold Coffee", 150, 1, "Chilled coffee with ice cream"],
      ["Masala Chai", 60, 1, "Spiced tea with ginger and cardamom"]
    ]
  };

  const ALL = Object.entries(CATS).flatMap(([c, a]) =>
    a.map(([n, p, v, d, t]) => ({ n, p, v, d, t, c }))
  );

  const SIG = [
    "Paneer Butter Masala",
    "Chicken 65",
    "Paneer Tikka",
    "Brownie with Ice Cream",
    "Kadai Paneer"
  ];

  const OFFERS = [
    ["Family Feast", 1299, "Daily, serves 4", "Paneer Butter Masala, Butter Chicken, 4 Butter Naan, Veg Dum Biryani, 4 Gulab Jamun"],
    ["Weekend Special", 999, "Sat–Sun", "Chicken 65, Hyderabadi Chicken Dum Biryani, Rasmalai"],
    ["Lunch Express", 249, "Mon–Fri, 12–3 PM", "Dal Makhani, Jeera Rice, Butter Naan, Masala Chai"],
    ["Couple's Delight", 799, "Daily", "Paneer Tikka, Butter Chicken, 2 Butter Naan, Jeera Rice, 2 Mango Lassi"],
    ["Celebration Package", "On request", "Groups of 15+", "Custom menu and party space, enquire for details"]
  ];

  const REV = [
    ["A.K.", 5, "Best dum biryani we have had in the area. Staff were warm and the family section is comfortable.", "Oct 2026"],
    ["S.R.", 5, "Paneer Butter Masala and garlic naan were perfect. Booked a birthday table easily.", "Sep 2026"],
    ["M.T.", 4, "Great ambience for a group dinner. Starters were the highlight.", "Sep 2026"]
  ];

  const FAQ = [
    ["What are your opening hours?", "Banjara Hills is open daily 11 AM–11 PM (till midnight on Fri & Sat). Gachibowli is open 11 AM–10:30 PM and closed on Mondays."],
    ["Is parking available?", "Both demo outlets have customer parking nearby; availability may vary at peak hours."],
    ["How do I reserve a table?", "Use the reservation form on this website. It prepares your details for WhatsApp, and the restaurant confirms availability."],
    ["Do you take party bookings?", "Yes, send a party enquiry with date and guest count via the Celebrate With Us section and we will reply with options."],
    ["Can I place a bulk order?", "Yes, choose Bulk food order in the party enquiry form."],
    ["Do you have vegetarian options?", "Yes, every category has vegetarian dishes. Use the Veg only filter in the menu."],
    ["Do you offer home delivery?", "Demo info: delivery details are shared on request via WhatsApp."],
    ["Which payments do you accept?", "Demo info: cash, UPI and major cards at the restaurant."]
  ];

  return {
    CONFIG,
    CATS,
    ALL,
    SIG,
    OFFERS,
    REV,
    FAQ
  };
}));
