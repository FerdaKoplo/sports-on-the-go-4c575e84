import { Calendar, Grid3x3, MessageSquare, Trophy } from "lucide-react";

export const USER_NAV_LINK = [
  {
    key: "host-game",
    path: "/host-game",
    title: "Host Game",
    icon: <Calendar className="w-4 h-4" />,
  },

  {
    key: "community",
    path: "/community",
    title: "Community",
    icon: <MessageSquare className="w-4 h-4" />,
  },
  {
    key: "leaderboard",
    path: "/leaderboard",
    title: "Leaderboard",
    icon: <Trophy className="w-4 h-4" />,
  },
  {
    key: "my-games",
    path: "/my-games",
    title: "My Games",
    icon: <Grid3x3 className="w-4 h-4" />,
  },
];
