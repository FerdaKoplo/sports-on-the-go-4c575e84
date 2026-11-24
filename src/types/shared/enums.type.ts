export type AccountStatus = "ACTIVE" | "SUSPENDED" | "BANNED";
export type AppRole = "admin" | "moderator" | "user";
export type CommunityVisibility = "PUBLIC" | "FRIENDS_ONLY" | "INVITE_ONLY";
export type FriendshipStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "BLOCKED";
export type GameStatus = "UPCOMING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type GameVisibility = "PUBLIC" | "FRIENDS_ONLY" | "INVITE_ONLY";
export type RsvpStatus = "CONFIRMED" | "WAITLISTED" | "CANCELLED";
export type SkillLevel =
  "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" | "ALL_LEVELS";
export type SportType =
  | "BASKETBALL"
  | "SOCCER"
  | "VOLLEYBALL"
  | "TENNIS"
  | "BASEBALL"
  | "FOOTBALL"
  | "ULTIMATE_FRISBEE"
  | "CRICKET"
  | "RUGBY"
  | "HOCKEY"
  | "OTHER"
  | "PICKLEBALL"
  | "RUNNING"
  | "CYCLING"
  | "BADMINTON"
  | "GOLF";
export type UserRole = "USER" | "ADMIN";

export const Constants = {
  public: {
    Enums: {
      account_status: ["ACTIVE", "SUSPENDED", "BANNED"],
      app_role: ["admin", "moderator", "user"],
      community_visibility: ["PUBLIC", "FRIENDS_ONLY", "INVITE_ONLY"],
      friendship_status: ["PENDING", "ACCEPTED", "DECLINED", "BLOCKED"],
      game_status: ["UPCOMING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      game_visibility: ["PUBLIC", "FRIENDS_ONLY", "INVITE_ONLY"],
      rsvp_status: ["CONFIRMED", "WAITLISTED", "CANCELLED"],
      skill_level: [
        "BEGINNER",
        "INTERMEDIATE",
        "ADVANCED",
        "EXPERT",
        "ALL_LEVELS",
      ],
      sport_type: [
        "BASKETBALL",
        "SOCCER",
        "VOLLEYBALL",
        "TENNIS",
        "BASEBALL",
        "FOOTBALL",
        "ULTIMATE_FRISBEE",
        "CRICKET",
        "RUGBY",
        "HOCKEY",
        "OTHER",
        "PICKLEBALL",
        "RUNNING",
        "CYCLING",
        "BADMINTON",
        "GOLF",
      ],
      user_role: ["USER", "ADMIN"],
    },
  },
} as const;
