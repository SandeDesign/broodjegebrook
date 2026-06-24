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

export const categoryExtras: Record<string, ExtraOption[]> = {
  broodjes:     [{ name: "Extra kaas", price: 1.00 }, { name: "Extra vlees", price: 2.00 }],
  burgers:      [{ name: "Extra kaas", price: 1.00 }, { name: "Extra bacon", price: 1.50 }, { name: "Extra patty", price: 3.00 }],
  uitsmijters:  [{ name: "Extra ei", price: 1.00 }, { name: "Extra kaas", price: 1.00 }],
  stokbroodjes: [{ name: "Extra kaas", price: 1.00 }, { name: "Extra vlees", price: 2.00 }],
  salades:      [{ name: "Extra kip", price: 2.00 }],
  bagels:       [{ name: "Extra kaas", price: 1.00 }, { name: "Extra beleg", price: 2.00 }],
  tostis:       [{ name: "Extra kaas", price: 1.00 }, { name: "Extra beleg", price: 1.50 }],
  wraps:        [{ name: "Extra vlees", price: 2.00 }],
  sauzen:       [],
  frisdranken:  [],
  snoep:        [],
};

// Alle sauzen beschikbaar als optionele toevoeging (€0,50 per saus)
const ALL_SAUCES = [
  "Knoflook", "Andalouse", "Cocktailsaus", "Samuraisaus",
  "Mosterd", "Honing-mosterd", "Mayo", "Ketchup", "Bicky", "Curry",
];

export const categorySauces: Record<string, string[]> = {
  broodjes:     ALL_SAUCES,
  burgers:      ALL_SAUCES,
  uitsmijters:  ALL_SAUCES,
  stokbroodjes: ALL_SAUCES,
  salades:      ALL_SAUCES,
  bagels:       ALL_SAUCES,
  tostis:       ALL_SAUCES,
  wraps:        ALL_SAUCES,
};

export const categorySizes: Record<string, string[]> = {};

export const categories: MenuCategory[] = [
  { id: "broodjes",     name: "Broodjes",            description: "Vers belegd met de lekkerste ingrediënten" },
  { id: "burgers",      name: "Burgers",              description: "Vers rundvlees, kaas en knapperig brood" },
  { id: "uitsmijters",  name: "Uitsmijters",          description: "3 gebakken eieren, ham en kaas op stevig brood" },
  { id: "stokbroodjes", name: "Stokbroodjes",         description: "Krokant stokbrood met jouw favoriete vulling" },
  { id: "salades",      name: "Salades",              description: "Fris, knapperig en voedzaam" },
  { id: "bagels",       name: "Bagels",               description: "Zacht en vers belegd" },
  { id: "tostis",       name: "Tosti's",              description: "Goudbruin geroosterd met kaas en beleg" },
  { id: "wraps",        name: "Wraps",                description: "Gevuld en strak gerold" },
  { id: "sauzen",       name: "Sauzen",               description: "Portiesaus naar keuze" },
  { id: "frisdranken",  name: "Frisdranken",          description: "Fris en koel" },
  { id: "snoep",        name: "Diverse snoepzakjes",  description: "Leuk snoepzakje als afsluiter" },
];

export const menuItems: MenuItem[] = [
  // Broodjes
  { id: "br-teriyaki",   categoryId: "broodjes", name: "Broodje teriyaki kip",  description: "Lente ui, atjar tjampoer, knoflook, kipfilet en teriyaki saus", price: 8.95, tags: ["populair"] },
  { id: "br-krokant",    categoryId: "broodjes", name: "Broodje kip krokant",   description: "Kip krokant, sla en cocktailsaus",                               price: 8.95, tags: ["populair"] },
  { id: "br-brie",       categoryId: "broodjes", name: "Broodje brie",          description: "Brie, walnoot, honing en rucola",                                price: 8.95, tags: [] },

  // Burgers
  { id: "bu-hamburger",  categoryId: "burgers", name: "Broodje hamburger",     description: "Vers rundvlees, sla, tomaat, komkommer, augurk en saus",                        price: 9.95,  tags: ["populair"] },
  { id: "bu-bacon",      categoryId: "burgers", name: "Bacon burger",          description: "Vers rundvlees, sla, tomaat, komkommer, augurk, saus, kaas en bacon",           price: 11.25, tags: ["populair"] },
  { id: "bu-cheese",     categoryId: "burgers", name: "Cheese burger",         description: "Vers rundvlees, sla, tomaat, komkommer, augurk, saus en kaas",                  price: 10.25, tags: [] },
  { id: "bu-vegan",      categoryId: "burgers", name: "Vegan burger",          description: "Vegetarische burger, sla, komkommer, augurk en saus",                           price: 9.95,  tags: ["vegan"] },
  { id: "bu-texmex",     categoryId: "burgers", name: "Tex mex burger",        description: "Vers rundvlees, sla, kaas, jalapeño's en saus",                                 price: 11.50, tags: ["pittig"] },
  { id: "bu-speciaal",   categoryId: "burgers", name: "Hamburger speciaal",    description: "Vers rundvlees, sla, kaas, augurk, gebakken ei, gebakken ui en saus",           price: 11.95, tags: [] },

  // Uitsmijters
  { id: "ui-spek",       categoryId: "uitsmijters", name: "Uitsmijter spek",   description: "3 sneetjes brood, 3 gebakken eieren, groenten, ham, kaas en spek", price: 8.95, tags: [] },
  { id: "ui-standaard",  categoryId: "uitsmijters", name: "Uitsmijter",        description: "3 sneetjes brood, 3 gebakken eieren, groenten, ham en kaas",       price: 7.95, tags: [] },

  // Stokbroodjes
  { id: "st-salami",     categoryId: "stokbroodjes", name: "Stokbroodje salami",        description: "Salami, sla en boter",                                                        price: 6.95, tags: [] },
  { id: "st-beenham",    categoryId: "stokbroodjes", name: "Stokbroodje beenham",       description: "Beenham, sla en saus",                                                        price: 6.95, tags: [] },
  { id: "st-spek",       categoryId: "stokbroodjes", name: "Stokbroodje spek",          description: "Spek, sla en saus",                                                           price: 6.95, tags: [] },
  { id: "st-pesto",      categoryId: "stokbroodjes", name: "Stokbroodje pesto",         description: "Rucola, mozzarella, balsamico en pesto",                                      price: 6.95, tags: ["vegan"] },
  { id: "st-taco",       categoryId: "stokbroodjes", name: "Stokbroodje taco",          description: "Gekruid gehakt, sla, komkommer, knoflooksaus en chilisaus",                   price: 6.95, tags: ["pittig"] },
  { id: "st-tonijn",     categoryId: "stokbroodjes", name: "Stokbroodje tonijn",        description: "Tonijn, sla, ei en augurk",                                                   price: 8.95, tags: [] },
  { id: "st-carpaccio",  categoryId: "stokbroodjes", name: "Stokbroodje carpaccio",     description: "Carpaccio, rucola, pijnboompitten, truffelmayonaise en zongedroogde tomaat", price: 8.95, tags: ["populair"] },
  { id: "st-filet",      categoryId: "stokbroodjes", name: "Stokbroodje filet american",description: "Filet american, zout, peper, ui, ei, augurk en sla",                          price: 8.95, tags: [] },
  { id: "st-kebab",      categoryId: "stokbroodjes", name: "Stokbroodje kebab",         description: "Kip kebab, sla en knoflooksaus",                                              price: 6.95, tags: [] },
  { id: "st-zalm",       categoryId: "stokbroodjes", name: "Stokbroodje zalm",          description: "Zalm, roomkaas, kappertjes, rucola en pijnboompitten",                        price: 8.95, tags: [] },
  { id: "st-gezond",     categoryId: "stokbroodjes", name: "Stokbroodje gezond",        description: "Ham, kaas, sla, saus, augurk, tomaat, ei, komkommer en wortel",              price: 6.95, tags: [] },
  { id: "st-eiersalade", categoryId: "stokbroodjes", name: "Stokbroodje eiersalade",    description: "Sla en eiersalade",                                                           price: 6.95, tags: [] },
  { id: "st-spekei",     categoryId: "stokbroodjes", name: "Stokbroodje spek ei",       description: "Spek, ei en saus",                                                            price: 6.95, tags: [] },
  { id: "st-bal",        categoryId: "stokbroodjes", name: "Stokbroodje bal",           description: "Gehaktbal, sla en saus",                                                      price: 6.95, tags: [] },
  { id: "st-kaas",       categoryId: "stokbroodjes", name: "Stokbroodje kaas",          description: "Kaas, sla en boter",                                                          price: 6.95, tags: ["vegan"] },
  { id: "st-ham",        categoryId: "stokbroodjes", name: "Stokbroodje ham",           description: "Ham, sla en boter",                                                           price: 6.95, tags: [] },
  { id: "st-kip",        categoryId: "stokbroodjes", name: "Stokbroodje kipfilet",      description: "Kipfilet, sla en boter",                                                      price: 6.95, tags: [] },

  // Salades
  { id: "sa-gemengd",    categoryId: "salades", name: "Gemengde salade",   description: "Rucola, sla, cherrytomaat, komkommer, augurk, ei en wortel",                           price: 8.95, tags: ["vegan"] },
  { id: "sa-caesar",     categoryId: "salades", name: "Caesarsalade",      description: "Pijnboompitten, rucola, sla, croutons, cherrytomaat, honing-mosterd saus en gegrilde kip", price: 8.95, tags: ["populair"] },

  // Bagels
  { id: "ba-gezond",     categoryId: "bagels", name: "Bagel gezond",        description: "Ham, kaas, sla, saus, augurk, tomaat, ei, komkommer en wortel", price: 8.95, tags: [] },
  { id: "ba-carpaccio",  categoryId: "bagels", name: "Bagel carpaccio",     description: "Carpaccio, rucola, pijnboompitten, balsamico en zongedroogde tomaat", price: 8.95, tags: [] },
  { id: "ba-tonijn",     categoryId: "bagels", name: "Bagel tonijn",        description: "Tonijn, sla, ei en augurk",                                    price: 8.95, tags: [] },
  { id: "ba-zalm",       categoryId: "bagels", name: "Bagel gerookte zalm", description: "Zalm, roomkaas, kappertjes, rucola en pijnboompitten",          price: 8.95, tags: ["populair"] },

  // Tosti's
  { id: "to-teriyaki",   categoryId: "tostis", name: "Tosti teriyaki",  description: "Kip teriyaki, atjar tampur, lente-ui en knoflook",              price: 6.95, tags: ["populair"] },
  { id: "to-kebab",      categoryId: "tostis", name: "Tosti kebab",     description: "Kip kebab, sla en knoflooksaus",                                price: 6.95, tags: [] },
  { id: "to-madame",     categoryId: "tostis", name: "Tosti madame",    description: "Ham, kaas, gebakken ei en sla",                                 price: 6.95, tags: [] },
  { id: "to-taco",       categoryId: "tostis", name: "Tosti taco",      description: "Gekruid gehakt, kaas, sla, knoflooksaus en chilisaus",           price: 6.95, tags: ["pittig"] },
  { id: "to-standaard",  categoryId: "tostis", name: "Tosti",           description: "Ham, kaas en groente",                                          price: 6.95, tags: [] },

  // Wraps
  { id: "wr-kebab",      categoryId: "wraps", name: "Wrap kebab",    description: "Kip kebab, sla en knoflooksaus",            price: 7.95, tags: [] },
  { id: "wr-teriyaki",   categoryId: "wraps", name: "Wrap teriyaki", description: "Kip teriyaki, sla en gebakken uitjes",       price: 7.95, tags: ["populair"] },
  { id: "wr-taco",       categoryId: "wraps", name: "Wrap taco",     description: "Gekruid gehakt, kaas, sla, knoflooksaus en chilisaus", price: 7.95, tags: ["pittig"] },

  // Sauzen
  { id: "sz-andalouse",  categoryId: "sauzen", name: "Andalouse saus",     description: "Portie andalouse saus",       price: 0.50, tags: [] },
  { id: "sz-samurai",    categoryId: "sauzen", name: "Samuraisaus",        description: "Portie samuraisaus",          price: 0.50, tags: ["pittig"] },
  { id: "sz-cocktail",   categoryId: "sauzen", name: "Cocktailsaus",       description: "Portie cocktailsaus",         price: 0.50, tags: [] },
  { id: "sz-mosterd",    categoryId: "sauzen", name: "Mosterd",            description: "Portie mosterd",              price: 0.50, tags: [] },
  { id: "sz-honing",     categoryId: "sauzen", name: "Honing-mosterd saus",description: "Portie honing-mosterd saus",  price: 0.50, tags: [] },
  { id: "sz-ketchup",    categoryId: "sauzen", name: "Ketchup",            description: "Portie ketchup",              price: 0.50, tags: [] },
  { id: "sz-bicky",      categoryId: "sauzen", name: "Bicky saus",         description: "Portie bicky saus",           price: 0.50, tags: [] },
  { id: "sz-mayo",       categoryId: "sauzen", name: "Mayo",               description: "Portie mayonaise",            price: 0.50, tags: [] },
  { id: "sz-curry",      categoryId: "sauzen", name: "Curry",              description: "Portie currysaus",            price: 0.50, tags: [] },

  // Frisdranken
  { id: "dr-chocomel",   categoryId: "frisdranken", name: "Chocomel 250ml",             description: "Chocolademelk",                                    price: 2.00, tags: [] },
  { id: "dr-water",      categoryId: "frisdranken", name: "Primavera water 500ml",      description: "Bronwater",                                        price: 2.00, tags: [] },
  { id: "dr-energy",     categoryId: "frisdranken", name: "Slammers Energy 250ml",      description: "Energydrank",                                      price: 3.00, tags: [] },
  { id: "dr-fristi",     categoryId: "frisdranken", name: "Fristi 250ml",               description: "Drinkyoghurt",                                     price: 2.00, tags: [] },
  { id: "dr-pepsizero",  categoryId: "frisdranken", name: "Pepsi Zero Sugar Cherry 330ml", description: "Suikervrije Pepsi met kersensmaak",             price: 2.50, tags: [] },
  { id: "dr-fuzztea",    categoryId: "frisdranken", name: "Fuze Tea Perzik Hibiscus 330ml", description: "Getrokken zwarte thee met perziksap en hibiscus", price: 2.50, tags: [] },
  { id: "dr-appelsap",   categoryId: "frisdranken", name: "Juice Tree appelsap 330ml",  description: "Vers appelsap",                                    price: 2.50, tags: [] },
  { id: "dr-pepsi",      categoryId: "frisdranken", name: "Pepsi regular 330ml",        description: "Frisse cola",                                      price: 2.50, tags: [] },
  { id: "dr-pepsizero2", categoryId: "frisdranken", name: "Pepsi Zero Sugar 330ml",     description: "Suikervrije Pepsi",                                price: 2.50, tags: [] },

  // Snoep
  { id: "sn-gewoon",     categoryId: "snoep", name: "Snoepzakje met gewoon snoep",    description: "Keuze uit gesuikerd snoep en gewoon snoep", price: 2.50, tags: [] },
  { id: "sn-gesuikerd",  categoryId: "snoep", name: "Snoepzakje met gesuikerd snoep", description: "Heerlijk gesuikerd snoep",                   price: 2.50, tags: [] },
  { id: "sn-drop",       categoryId: "snoep", name: "Snoepzakje met gemengde drop",   description: "Gemengde drop",                              price: 2.50, tags: [] },
];
