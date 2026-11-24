import type { AppRole } from "../shared/enums.type";

export interface UserRolesTable {
  Row: {
    created_at: string;
    id: string;
    role: AppRole;
    user_id: string;
  };
  Insert: {
    created_at?: string;
    id?: string;
    role: AppRole;
    user_id: string;
  };
  Update: {
    created_at?: string;
    id?: string;
    role?: AppRole;
    user_id?: string;
  };
  Relationships: [];
}

export type UserRoleRecord = UserRolesTable["Row"];
export type UserRoleInsert = UserRolesTable["Insert"];
export type UserRoleUpdate = UserRolesTable["Update"];
