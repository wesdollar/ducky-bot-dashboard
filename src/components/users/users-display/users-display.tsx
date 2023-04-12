import { ResponseUserJoinedObject } from "@dollardojo/modules/dist/types/irc-messages/irc-message-object";
import { Badge, BadgeVariants, Box } from "@twilio-paste/core";
import { uniqueId } from "lodash";

interface UserDisplayProps {
  joinedChatData: ResponseUserJoinedObject[];
}

export const UsersDisplay = ({ joinedChatData }: UserDisplayProps) => (
  <>
    {joinedChatData.map((data: ResponseUserJoinedObject) => {
      let badgeColor: BadgeVariants = "decorative10";

      if (data.mod) {
        badgeColor = "decorative20";
      }

      if (data.subscriber) {
        badgeColor = "decorative40";
      }

      return (
        <Box key={uniqueId()} marginBottom={"space30"}>
          <Badge as="span" variant={badgeColor}>
            {data.username}
          </Badge>
        </Box>
      );
    })}
  </>
);
