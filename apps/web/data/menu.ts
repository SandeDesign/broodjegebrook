export type MenuTag = "populair" | "nieuw" | "vegan" | "pittig";

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  tags: MenuTag[];
}

export interface ExtraOption { name: string; price: number; }

/** Standaard extras per categorie (kies meerdere) */
export const categoryExtras: Record<string, ExtraOption[]> = {
  pizza:        [{ name: "Extra kaas", price: 1.50 }, { name: "Extra salami", price: 2.00 }, { name: "Extra ham", price: 2.00 }, { name: "Extra ui", price: 0.75 }, { name: "Extra champignons", price: 1.00 }, { name: "Extra ananas", price: 1.50 }],
  gevuld:       [{ name: "Extra kaas", price: 1.50 }, { name: "Extra vlees", price: 2.00 }],
  pasta:        [{ name: "Extra kaas", price: 1.50 }, { name: "Extra vlees", price: 2.00 }],
  kapsalon:     [{ name: "Extra kaas", price: 1.50 }, { name: "Extra vlees", price: 2.50 }, { name: "Extra friet", price: 2.00 }],
  schotels:     [{ name: "Extra vlees", price: 2.50 }, { name: "Extra friet", price: 2.00 }, { name: "Extra brood", price: 1.50 }, { name: "Extra saus", price: 0.75 }],
  durum:        [{ name: "Extra vlees", price: 2.00 }, { name: "Extra kaas", price: 1.50 }, { name: "Extra saus", price: 0.75 }],
  hamburgers:   [{ name: "Extra kaas", price: 1.00 }, { name: "Extra bacon", price: 1.50 }, { name: "Extra patty", price: 3.00 }],
  broodjes:     [{ name: "Extra kaas", price: 1.00 }, { name: "Extra vlees", price: 2.00 }, { name: "Extra saus", price: 0.75 }],
  menus:        [{ name: "Extra saus", price: 0.75 }],
  friet:        [{ name: "Extra saus", price: 0.75 }, { name: "Kaas erover", price: 1.50 }, { name: "Uitjes", price: 0.50 }],
  snacks:       [{ name: "Extra saus", price: 0.75 }],
  bijgerechten: [],
  extras:       [],
  dranken:      [],
};

/** Beschikbare sauzen per categorie (kies 1 verplicht) */
export const categorySauces: Record<string, string[]> = {
  schotels: ["Knoflook", "Andalouse", "Cocktail", "Sambal", "Chili", "Mayo", "Curry", "Samurai"],
  durum:    ["Knoflook", "Andalouse", "Cocktail", "Sambal", "Chili"],
  kapsalon: ["Knoflook", "Andalouse", "Cocktail", "Sambal", "Chili"],
  friet:    ["Mayo", "Ketchup", "Andalouse", "Cocktail", "Knoflook", "Curry"],
  broodjes: ["Knoflook", "Andalouse", "Sambal", "Geen saus"],
  snacks:   ["Mayo", "Ketchup", "Curry", "Geen saus"],
};

/** Optionele maat-keuze per categorie */
export const categorySizes: Record<string, string[]> = {
  pasta: ["Spaghetti", "Macaroni"],
};

export const categories: MenuCategory[] = [
  { id: "pizza", name: "Pizza", description: "Versgebakken in onze steenoven op 380°C" },
  { id: "gevuld", name: "Gevulde Pizza's", description: "Calzone's. Dichtgevouwen en overgegoten met saus" },
  { id: "pasta", name: "Pasta's", description: "Overbakken met kaas, keuze uit spaghetti of macaroni" },
  { id: "kapsalon", name: "Kapsalon", description: "De klassieker. Friet, vlees, kaas en salade" },
  { id: "schotels", name: "Schotel Specialiteiten", description: "Dagvers gemarineerd vlees, saus naar keuze" },
  { id: "durum", name: "Dürüm", description: "Zacht flatbread gevuld met vlees en verse groenten" },
  { id: "hamburgers", name: "Hamburgers", description: "Handgevormde burgers op de grill" },
  { id: "broodjes", name: "Broodjes", description: "Turks brood, baguette of pita. Vers belegd" },
  { id: "menus", name: "Menu's", description: "Combinaties met friet en drank" },
  { id: "friet", name: "Friet", description: "Krokant gebakken, klein of groot" },
  { id: "snacks", name: "Snacks", description: "Klassiekers met een twist" },
  { id: "bijgerechten", name: "Bijgerechten", description: "Salades, sauzen en kleine extra's" },
  { id: "extras", name: "Extra's", description: "Sauzen en porties naar keuze" },
  { id: "dranken", name: "Dranken", description: "Fris, traditioneel of warm" },
];

export const menuItems: MenuItem[] = [
  // Pizza
  { id: "p-margherita", categoryId: "pizza", name: "Margherita", description: "Tomatensaus, mozzarella, oregano", price: 10.00, tags: ["populair"] },
  { id: "p-shoarma", categoryId: "pizza", name: "Pizza Shoarma", description: "Mozzarella, shoarmavlees, uien, paprika", price: 13.50, tags: ["populair"] },
  { id: "p-kebab", categoryId: "pizza", name: "Pizza Kebab", description: "Mozzarella, gehakt, paprika, chilisaus", price: 13.50, tags: [] },
  { id: "p-diavola", categoryId: "pizza", name: "Diavola", description: "Pikante salami, jalapeño, mozzarella", price: 11.50, tags: ["pittig"] },
  { id: "p-quattro", categoryId: "pizza", name: "Quattro Stagioni", description: "Ham, champignons, artisjok, olijven", price: 12.50, tags: [] },
  { id: "p-tonno", categoryId: "pizza", name: "Tonno", description: "Tonijn, ui, mozzarella, kappertjes", price: 12.00, tags: [] },
  { id: "p-prosciutto", categoryId: "pizza", name: "Prosciutto", description: "Parmaham, rucola, parmezaan", price: 13.00, tags: [] },
  { id: "p-vegetariana", categoryId: "pizza", name: "Vegetariana", description: "Gegrilde groenten, mozzarella, pesto", price: 11.00, tags: ["vegan"] },
  { id: "p-bbq", categoryId: "pizza", name: "BBQ Chicken", description: "BBQ-saus, kip, rode ui, cheddar", price: 13.00, tags: ["nieuw"] },
  { id: "p-kinder", categoryId: "pizza", name: "Kinder Pizza", description: "Tomatensaus, mozzarella, kleine maat", price: 7.50, tags: [] },
  { id: "p-half", categoryId: "pizza", name: "Pizza Half/Half", description: "Kies twee smaken op één pizza", price: 14.50, tags: [] },
  { id: "p-lahmacun", categoryId: "pizza", name: "Lahmacun", description: "Turks platbrood met gekruid lamsgehakt", price: 9.00, tags: ["populair"] },

  // Gevuld
  { id: "g-classico", categoryId: "gevuld", name: "Calzone Classico", description: "Ham, mozzarella, tomatensaus", price: 12.00, tags: [] },
  { id: "g-shoarma", categoryId: "gevuld", name: "Calzone Shoarma", description: "Shoarmavlees, mozzarella, chilisaus", price: 13.50, tags: ["populair"] },
  { id: "g-veg", categoryId: "gevuld", name: "Calzone Vegetarisch", description: "Gegrilde groenten, pesto, mozzarella", price: 12.00, tags: ["vegan"] },

  // Pasta
  { id: "pa-bolognese", categoryId: "pasta", name: "Pasta Bolognese", description: "Rundvleessaus, tomatensaus, mozzarella", price: 10.00, tags: ["populair"] },
  { id: "pa-shoarma", categoryId: "pasta", name: "Pasta Shoarma", description: "Shoarmavlees, romige saus, mozzarella", price: 11.50, tags: [] },
  { id: "pa-lasagne", categoryId: "pasta", name: "Lasagne Chef", description: "Klassieke lasagne overbakken met kaas", price: 11.00, tags: [] },

  // Kapsalon
  { id: "k-shoarma-k", categoryId: "kapsalon", name: "Kapsalon Shoarma Klein", description: "Friet, shoarma, gesmolten kaas, salade, saus", price: 9.50, tags: [] },
  { id: "k-shoarma-g", categoryId: "kapsalon", name: "Kapsalon Shoarma Groot", description: "Friet, shoarma, gesmolten kaas, salade, saus", price: 12.00, tags: ["populair"] },
  { id: "k-kip-k", categoryId: "kapsalon", name: "Kapsalon Kip Klein", description: "Friet, kip, gesmolten kaas, salade, saus", price: 9.50, tags: [] },
  { id: "k-kip-g", categoryId: "kapsalon", name: "Kapsalon Kip Groot", description: "Friet, kip, gesmolten kaas, salade, saus", price: 12.00, tags: [] },

  // Schotels
  { id: "s-shoarma-k", categoryId: "schotels", name: "Shoarma Schotel Klein", description: "Shoarmavlees, friet, salade, brood, saus naar keuze", price: 10.00, tags: [] },
  { id: "s-shoarma-g", categoryId: "schotels", name: "Shoarma Schotel Groot", description: "Shoarmavlees, friet, salade, brood, saus naar keuze", price: 14.00, tags: ["populair"] },
  { id: "s-kip-k", categoryId: "schotels", name: "Kip Schotel Klein", description: "Gegrilde kip, friet, salade, brood, saus", price: 10.00, tags: [] },
  { id: "s-kip-g", categoryId: "schotels", name: "Kip Schotel Groot", description: "Gegrilde kip, friet, salade, brood, saus", price: 14.00, tags: [] },
  { id: "s-gyros-g", categoryId: "schotels", name: "Gyros Schotel", description: "Gekruid vlees, tzatziki, friet, pita", price: 14.50, tags: ["populair"] },
  { id: "s-mixed", categoryId: "schotels", name: "Mixed Grill Schotel", description: "Shoarma, kip en lamsgehakt met friet en salade", price: 16.00, tags: ["populair"] },
  { id: "s-falafel", categoryId: "schotels", name: "Falafel Schotel", description: "Krokante falafel, hummus, tabouleh, pita", price: 10.00, tags: ["vegan"] },

  // Dürüm
  { id: "d-shoarma", categoryId: "durum", name: "Dürüm Shoarma", description: "Flatbread, shoarma, verse groenten, saus", price: 9.00, tags: ["populair"] },
  { id: "d-kip", categoryId: "durum", name: "Dürüm Kip", description: "Flatbread, kip, paprika, knoflooksaus", price: 9.00, tags: [] },
  { id: "d-kebab", categoryId: "durum", name: "Dürüm Kebab", description: "Flatbread, gehakt, chilisaus, tomaat", price: 9.00, tags: [] },
  { id: "d-falafel", categoryId: "durum", name: "Dürüm Falafel", description: "Flatbread, falafel, hummus, salade", price: 8.50, tags: ["vegan"] },

  // Hamburgers
  { id: "h-classic", categoryId: "hamburgers", name: "Classic Burger", description: "Rundvlees, cheddar, ijsbergsla, tomaat, pickles", price: 9.50, tags: [] },
  { id: "h-bbq", categoryId: "hamburgers", name: "BBQ Burger", description: "Rundvlees, cheddar, bacon, BBQ-saus, rode ui", price: 11.00, tags: ["populair"] },
  { id: "h-kip", categoryId: "hamburgers", name: "Kip Burger", description: "Krokante kip, honing-mosterd, sla, tomaat", price: 10.00, tags: [] },
  { id: "h-american", categoryId: "hamburgers", name: "American Burger", description: "Dubbel rundvlees, dubbel kaas, jalapeño", price: 13.00, tags: ["pittig"] },

  // Broodjes
  { id: "b-shoarma", categoryId: "broodjes", name: "Broodje Shoarma", description: "Turks brood, shoarma, knoflooksaus, salade", price: 7.50, tags: ["populair"] },
  { id: "b-kip", categoryId: "broodjes", name: "Broodje Kip", description: "Turks brood, kip, paprika, saus", price: 7.50, tags: [] },
  { id: "b-falafel", categoryId: "broodjes", name: "Broodje Falafel", description: "Pita, falafel, hummus, tomaat", price: 7.00, tags: ["vegan"] },
  { id: "b-kebab", categoryId: "broodjes", name: "Broodje Kebab", description: "Turks brood, lamsgehakt, ui, peterselie", price: 7.50, tags: [] },
  { id: "b-gyros", categoryId: "broodjes", name: "Broodje Gyros", description: "Pita, gyrosvlees, tzatziki, tomaat", price: 8.00, tags: [] },

  // Menu's
  { id: "m-shoarma", categoryId: "menus", name: "Shoarma Menu", description: "Broodje shoarma + friet + drank", price: 12.50, tags: [] },
  { id: "m-pizza", categoryId: "menus", name: "Pizza Menu", description: "Pizza naar keuze + drank", price: 14.00, tags: [] },
  { id: "m-kip", categoryId: "menus", name: "Kip Menu", description: "Broodje kip + friet + drank", price: 12.50, tags: [] },

  // Friet
  { id: "f-klein", categoryId: "friet", name: "Friet Klein", description: "Krokante huisfriet", price: 3.00, tags: [] },
  { id: "f-groot", categoryId: "friet", name: "Friet Groot", description: "Krokante huisfriet", price: 4.50, tags: [] },
  { id: "f-speciaal", categoryId: "friet", name: "Friet Speciaal", description: "Met mayo, ketchup en uitjes", price: 5.00, tags: ["populair"] },
  { id: "f-saus", categoryId: "friet", name: "Friet met Saus", description: "Friet met saus naar keuze", price: 4.00, tags: [] },

  // Snacks
  { id: "sn-kipnuggets", categoryId: "snacks", name: "Kipnuggets (6 st.)", description: "Krokante kipnuggets met diopsaus", price: 5.50, tags: [] },
  { id: "sn-kipsate", categoryId: "snacks", name: "Kipsaté (4 st.)", description: "Met huisgemaakte satésaus", price: 6.00, tags: [] },
  { id: "sn-loempia", categoryId: "snacks", name: "Loempia (2 st.)", description: "Knapperige loempia's met zoetzure saus", price: 4.50, tags: [] },
  { id: "sn-frikandel", categoryId: "snacks", name: "Frikandel Speciaal", description: "Frikandel, mayo, ketchup, uitjes", price: 4.00, tags: [] },
  { id: "sn-kaassouf", categoryId: "snacks", name: "Kaassoufflé", description: "Krokante kaassoufflé met zoetzure saus", price: 3.50, tags: [] },

  // Bijgerechten
  { id: "bj-salade", categoryId: "bijgerechten", name: "Gemengde Salade", description: "IJsbergsla, tomaat, komkommer, paprika", price: 3.50, tags: ["vegan"] },
  { id: "bj-tzatziki", categoryId: "bijgerechten", name: "Tzatziki", description: "Griekse yoghurt met komkommer en knoflook", price: 2.50, tags: ["vegan"] },
  { id: "bj-hummus", categoryId: "bijgerechten", name: "Hummus", description: "Kikkererwtenpuree met olijfolie en paprikapoeder", price: 3.00, tags: ["vegan"] },
  { id: "bj-pitabrood", categoryId: "bijgerechten", name: "Pita / Turks Brood", description: "Vers gebakken Turks brood of pita", price: 1.50, tags: [] },

  // Extra's
  { id: "ex-knoflooksaus", categoryId: "extras", name: "Knoflooksaus", description: "Portie knoflooksaus", price: 0.75, tags: [] },
  { id: "ex-sambal", categoryId: "extras", name: "Sambal", description: "Portie sambal", price: 0.75, tags: ["pittig"] },
  { id: "ex-chili", categoryId: "extras", name: "Chilisaus", description: "Portie chilisaus", price: 0.75, tags: ["pittig"] },
  { id: "ex-mayo", categoryId: "extras", name: "Mayonaise", description: "Portie mayonaise", price: 0.75, tags: [] },
  { id: "ex-ketchup", categoryId: "extras", name: "Ketchup", description: "Portie ketchup", price: 0.75, tags: [] },
  { id: "ex-cocktail", categoryId: "extras", name: "Cocktailsaus", description: "Portie cocktailsaus", price: 0.75, tags: [] },

  // Dranken
  { id: "dr-cola", categoryId: "dranken", name: "Cola 0,33L", description: "Frisse Coca-Cola", price: 2.50, tags: [] },
  { id: "dr-cola-zero", categoryId: "dranken", name: "Cola Zero 0,33L", description: "Suikervrije Coca-Cola", price: 2.50, tags: [] },
  { id: "dr-fanta", categoryId: "dranken", name: "Fanta 0,33L", description: "Sinaasappel-frisdrank", price: 2.50, tags: [] },
  { id: "dr-sprite", categoryId: "dranken", name: "Sprite 0,33L", description: "Citroen-limoen frisdrank", price: 2.50, tags: [] },
  { id: "dr-ayran", categoryId: "dranken", name: "Ayran", description: "Traditioneel Turks yoghurtdrankje", price: 2.00, tags: [] },
  { id: "dr-water", categoryId: "dranken", name: "Water 0,5L", description: "Bron- of bruisend water", price: 1.50, tags: [] },
  { id: "dr-ijsthee", categoryId: "dranken", name: "Ice Tea 0,33L", description: "Ijskoude thee. Perzik of citroen", price: 2.50, tags: [] },
];
