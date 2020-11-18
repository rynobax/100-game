export type { Messages } from "../../shared/types";

export type Page = "home" | "host" | "join";
export type PageProps = {
  setPage: (page: Page) => void;
};
