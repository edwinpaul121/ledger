export type MediaType = "FILM" | "SHOW" | "GAME" | "BOOK";
export type EntryStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "DROPPED";

export type Entry = {
  id: string;
  movieId: string | null;
  showId: string | null;
  gameId: string | null;
  bookId: string | null;
  moviePosterPath: string | null; // holds the poster/cover for whichever catalog item is set
  mediaType: MediaType;
  title: string;
  status: EntryStatus | null;
  favorite: boolean;
  progressLabel: string | null;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
};

export type ListType = "FILM" | "SHOW" | "GAME" | "BOOK" | "MIX";

export type ListItem = {
  id: string;
  movieId: string | null;
  showId: string | null;
  gameId: string | null;
  bookId: string | null;
  moviePosterPath: string | null; // holds the poster/cover for whichever catalog item is set
  title: string;
  mediaType: MediaType | null;
  note: string | null;
};

export type MediaList = {
  id: string;
  name: string;
  type: ListType;
  items: ListItem[];
};

export type ViewHistoryEntry = {
  id: string;
  path: string;
  title: string;
  movieId: string | null;
  showId: string | null;
  gameId: string | null;
  bookId: string | null;
  moviePosterPath: string | null;
  viewedAt: string;
};

export const MEDIA_LABEL: Record<MediaType, string> = {
  FILM: "Movies",
  SHOW: "Shows",
  GAME: "Games",
  BOOK: "Books",
};

export const PROGRESS_HINT: Record<MediaType, string> = {
  FILM: "e.g. rewatch #2",
  SHOW: "e.g. S2E4",
  GAME: "e.g. Chapter 3 / 68%",
  BOOK: "e.g. Page 210",
};

export const MEDIA_COLOR: Record<MediaType, string> = {
  FILM: "film",
  SHOW: "show",
  GAME: "game",
  BOOK: "book",
};

export const MEDIA_DOT_CLASS: Record<MediaType, string> = {
  FILM: "bg-film",
  SHOW: "bg-show",
  GAME: "bg-game",
  BOOK: "bg-book",
};
