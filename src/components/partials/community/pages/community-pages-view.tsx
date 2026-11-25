import { useMemo, useState } from "react";
import { Filter, Plus, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/stores/authStore";
import { useCommunityStore } from "@/stores/communityStore";
import { getAllSportsDbValues, toDisplaySportName } from "@/utils/sportsUtils";
import type { CommunityItem } from "../community-types.props";

const CREATE_SPORT_OPTIONS = [
  ["BASKETBALL", "Basketball"],
  ["SOCCER", "Soccer"],
  ["TENNIS", "Tennis"],
  ["VOLLEYBALL", "Volleyball"],
  ["FOOTBALL", "Football"],
  ["BASEBALL", "Baseball"],
  ["CRICKET", "Cricket"],
  ["RUGBY", "Rugby"],
  ["HOCKEY", "Hockey"],
  ["BADMINTON", "Badminton"],
  ["TABLE_TENNIS", "Table Tennis"],
  ["GOLF", "Golf"],
  ["SWIMMING", "Swimming"],
  ["RUNNING", "Running"],
  ["CYCLING", "Cycling"],
  ["GYM", "Gym"],
  ["YOGA", "Yoga"],
  ["MARTIAL_ARTS", "Martial Arts"],
  ["BOXING", "Boxing"],
  ["CLIMBING", "Climbing"],
  ["SKATING", "Skating"],
  ["SKIING", "Skiing"],
  ["SURFING", "Surfing"],
  ["OTHER", "Other"],
] as const;

interface CommunityListViewProps {
  onSelectCommunity: (community: CommunityItem) => void;
}

export const CommunityListView = ({
  onSelectCommunity,
}: CommunityListViewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { communities, dispatchAction } = useCommunityStore();

  const [sportFilter, setSportFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    sport: "",
  });

  const filteredCommunities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return communities.filter((c) => {
      if (c.archived !== showArchived) return false;
      if (sportFilter !== "ALL" && c.sport !== sportFilter) return false;
      if (
        q &&
        !c.name.toLowerCase().includes(q) &&
        !c.description?.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [communities, showArchived, sportFilter, searchQuery]);

  const handleCreate = async () => {
    if (!user || !newCommunity.name || !newCommunity.sport) {
      toast({
        title: "Missing fields",
        description: "Please fill in the community name and sport.",
        variant: "destructive",
      });
      return;
    }

    const res = await dispatchAction({
      type: "create_community",
      userId: user.id,
      ...newCommunity,
    });

    if (res.toast) toast(res.toast);
    if (res.success) {
      setNewCommunity({ name: "", description: "", sport: "" });
      setShowNewForm(false);
    }
  };

  return (
    <>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
          Communities
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Join communities and connect with players
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-4">
        <div className="flex items-center gap-2 flex-1 w-full sm:max-w-2xl">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Select value={sportFilter} onValueChange={setSportFilter}>
            <SelectTrigger className="w-full sm:w-[180px] text-sm">
              <SelectValue placeholder="Filter by sport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sports</SelectItem>
              {getAllSportsDbValues().map((sport) => (
                <SelectItem key={sport} value={sport}>
                  {toDisplaySportName(sport)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={showArchived ? "default" : "outline"}
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? "Show Active" : "Show Archived"}
          </Button>
          <Button onClick={() => setShowNewForm(!showNewForm)}>
            <Plus className="w-4 h-4 mr-2" />
            {showNewForm ? "Cancel" : "Create Community"}
          </Button>
        </div>
      </div>

      {showNewForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Community</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Community name"
              value={newCommunity.name}
              onChange={(e) =>
                setNewCommunity((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <Textarea
              placeholder="Description"
              value={newCommunity.description}
              onChange={(e) =>
                setNewCommunity((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
            />
            <Select
              value={newCommunity.sport}
              onValueChange={(sport) =>
                setNewCommunity((prev) => ({ ...prev, sport }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sport" />
              </SelectTrigger>
              <SelectContent>
                {CREATE_SPORT_OPTIONS.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleCreate}>Create Community</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCommunities.map((community) => (
          <Card
            key={community.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{community.name}</CardTitle>
                    {community.archived && (
                      <Badge variant="secondary">Archived</Badge>
                    )}
                  </div>
                  <CardDescription className="mt-2 line-clamp-2">
                    {community.description}
                  </CardDescription>
                </div>
                {community.sport && (
                  <Badge variant="default">
                    {community.sport.replace(/_/g, " ")}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-1" />
                  {community.member_count} members
                </div>
                <Button size="sm" onClick={() => onSelectCommunity(community)}>
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};
