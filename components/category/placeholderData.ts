export type CatalogItem = {
  title: string;
  year: string;
  cover: string;
  rating: number;
};

const movieTitles = [
  "Dune: Part Two",
  "Oppenheimer",
  "Poor Things",
  "Challengers",
  "The Zone of Interest",
  "Past Lives",
  "Anatomy of a Fall",
  "Killers of the Flower Moon",
  "Barbie",
  "The Holdovers",
];

const showTitles = [
  "Severance",
  "The Bear",
  "Succession",
  "Shōgun",
  "Fargo",
  "The Last of Us",
  "Slow Horses",
  "Baby Reindeer",
  "True Detective",
  "Beef",
];

const gameTitles = [
  "Elden Ring",
  "Baldur's Gate 3",
  "Hades II",
  "Cyberpunk 2077",
  "Disco Elysium",
  "Outer Wilds",
  "Hollow Knight",
  "Helldivers 2",
  "Alan Wake 2",
  "Death Stranding",
];

const bookTitles = [
  "Piranesi",
  "The Employees",
  "Tomorrow, and Tomorrow, and Tomorrow",
  "Babel",
  "The Fifth Season",
  "Klara and the Sun",
  "A Little Life",
  "The Vegetarian",
  "Project Hail Mary",
  "Circe",
];

function buildItems(seedPrefix: string, titles: string[], startYear: number, yearSpan: number): CatalogItem[] {
  return titles.map((title, i) => ({
    title,
    year: String(startYear + (i % yearSpan)),
    cover: `https://picsum.photos/seed/${seedPrefix}-${i}/400/580`,
    rating: 3 + (i % 3),
  }));
}

export const movieItems = buildItems("movie", movieTitles, 2022, 3);
export const showItems = buildItems("show", showTitles, 2022, 3);
export const gameItems = buildItems("game", gameTitles, 2020, 5);
export const bookItems = buildItems("book", bookTitles, 2018, 6);
