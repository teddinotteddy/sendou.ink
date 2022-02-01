import clsx from "clsx";
import { Form } from "remix";
import { Avatar } from "~/components/Avatar";
import { Button } from "~/components/Button";
import type {
  LookingActionSchema,
  LookingLoaderDataGroup,
} from "~/routes/play/looking";

export function GroupCard({
  group,
  isCaptain = false,
  type,
  ranked,
  lookingForMatch,
}: {
  group: LookingLoaderDataGroup;
  isCaptain?: boolean;
  type?: "LIKES_GIVEN" | "NEUTRAL" | "LIKES_RECEIVED";
  ranked?: boolean;
  lookingForMatch: boolean;
}) {
  const buttonText = () => {
    if (type === "LIKES_GIVEN") return "Undo";
    if (type === "NEUTRAL") return "Let's play?";

    return lookingForMatch ? "Match up" : "Group up";
  };
  const buttonValue = (): LookingActionSchema["_action"] => {
    if (type === "LIKES_GIVEN") return "UNLIKE";
    if (type === "NEUTRAL") return "LIKE";

    return "UNITE_GROUPS";
  };

  return (
    <Form method="post">
      <div className="play-looking__card">
        {typeof ranked === "boolean" && (
          <div className={clsx("play-looking__ranked-text", { ranked })}>
            {ranked ? "Ranked" : "Unranked"}
          </div>
        )}
        <div className="play-looking__card__members">
          {group.members?.map((member) => {
            return (
              <div key={member.id} className="play-looking__member-card">
                <Avatar tiny user={member} />
                <span className="play-looking__member-name">
                  {member.discordName}
                </span>
              </div>
            );
          })}
        </div>
        <input type="hidden" name="targetGroupId" value={group.id} />
        {type === "LIKES_RECEIVED" && (
          <input
            type="hidden"
            name="targetGroupSize"
            value={group.members?.length ?? -1}
          />
        )}
        {isCaptain && (
          <Button
            type="submit"
            name="_action"
            value={buttonValue()}
            tiny
            variant={type === "LIKES_GIVEN" ? "destructive" : undefined}
          >
            {buttonText()}
          </Button>
        )}
      </div>
    </Form>
  );
}