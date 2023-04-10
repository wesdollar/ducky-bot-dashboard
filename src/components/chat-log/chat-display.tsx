import { ChatMessagePayload } from "@dollardojo/modules/dist/types/chat/chat-message-payload";
import {
  ChatBubble,
  ChatLog,
  ChatMessage,
  ChatMessageMeta,
  ChatMessageMetaItem,
  Text,
} from "@twilio-paste/core";
import { uniqueId } from "lodash";

interface ChatLogProps {
  chatMessages: ChatMessagePayload[];
  handleToggleModal: (isOpen: boolean, userDisplayName: string) => void;
}

export const ChatDisplay = ({
  chatMessages,
  handleToggleModal,
}: ChatLogProps) => {
  return (
    <ChatLog>
      {chatMessages.length
        ? chatMessages.map(
            ({
              message: { message, displayName, subscriber, emotes },
              timestamp,
            }) => (
              <ChatMessage key={uniqueId()} variant="inbound">
                <ChatBubble>
                  {message} {/* @ts-ignore because I said so */}
                  {emotes.length && emotes[0] !== null
                    ? (emotes as string[]).map((emoteId) => (
                        <img
                          key={uniqueId()}
                          src={`${emoteId}`}
                          alt="twitch emote"
                          style={{ height: "16px", width: "auto" }}
                        />
                      ))
                    : null}
                </ChatBubble>
                <ChatMessageMeta aria-label={`message from ${displayName}`}>
                  <ChatMessageMetaItem>
                    <>
                      <Text
                        as={"span"}
                        color={subscriber ? "colorTextIconNew" : "colorText"}
                      >
                        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                        <span
                          onClick={() => handleToggleModal(true, displayName)}
                          onKeyDown={() => handleToggleModal(true, displayName)}
                        >
                          {displayName}
                        </span>
                      </Text>{" "}
                      - {timestamp}
                    </>
                  </ChatMessageMetaItem>
                </ChatMessageMeta>
              </ChatMessage>
            )
          )
        : null}
    </ChatLog>
  );
};
