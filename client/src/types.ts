export type { Messages } from "../../shared/types";

export type Page = "home" | "lobby" | "game";
export type RoleInfo =
  | { role: "host"; code: string }
  | { role: "guest"; code: string }
  | { role: "unknown" };

export type PageProps = {
  setPage: (page: Page) => void;
  roleInfo: RoleInfo;
  setRoleInfo: (roleInfo: RoleInfo) => void;
};
