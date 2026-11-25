import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCommunityStore } from "@/stores/communityStore";

export const ReviveCommunityDialog = () => {
  const navigate = useNavigate();
  const {
    selectedCommunity,
    reviveGameData,
    showReviveDialog,
    setShowReviveDialog,
  } = useCommunityStore();

  const handleRevive = () => {
    if (!selectedCommunity || !reviveGameData) return;

    const params = new URLSearchParams({
      sport: reviveGameData.sport,
      location: reviveGameData.location_name,
      address: reviveGameData.address,
      city: reviveGameData.city,
      description: reviveGameData.description || "",
      communityId: selectedCommunity.id,
    });

    navigate(`/host-game?${params.toString()}`);
    setShowReviveDialog(false);
  };

  return (
    <AlertDialog open={showReviveDialog} onOpenChange={setShowReviveDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archived Community</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              This community is archived because the associated game has ended.
            </p>
            {reviveGameData && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Original Game Date:</span>
                  <span>
                    {format(new Date(reviveGameData.game_date), "MMMM d, yyyy")}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Time:</span>{" "}
                  {reviveGameData.start_time}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Location:</span>{" "}
                  {reviveGameData.location_name}
                </div>
              </div>
            )}
            <p className="text-foreground">
              Would you like to create a new game to revive this community? This
              will help bring the community back to life with a fresh game
              session.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continue Viewing</AlertDialogCancel>
          <AlertDialogAction onClick={handleRevive}>
            Create New Game
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
