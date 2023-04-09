import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { uniqueId } from "lodash";
import axios from "axios";
import {
  Badge,
  BadgeVariants,
  Box,
  Card,
  ChatBubble,
  ChatLog,
  ChatMessage,
  ChatMessageMeta,
  ChatMessageMetaItem,
  Column,
  Grid,
  Heading,
  Text,
} from "@twilio-paste/core";

interface JoinedChatData {
  username: string;
  lastSeen: Date;
  mod: boolean;
  subscriber: boolean;
  timestamp: string;
}

export const Dashboard = () => {
  const [chatMessages, setChatMessages] = useState([]);
  const [joinedChatData, setJoinedChatData] = useState([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [socketId, setSocketId] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const [currentSoundClip, setCurrentSoundClip] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    console.log(currentSoundClip);
  }, [currentSoundClip]);

  const handleAudioEnd = () => {
    setCurrentSoundClip("");
  };

  useEffect(() => {
    if (chatMessages.length) {
      const lastChatMessage = chatMessages[chatMessages.length - 1];

      console.log("last chat message", lastChatMessage);

      // @ts-ignore TODO: fix
      if (lastChatMessage.message.chatCommands) {
        // @ts-ignore TODO: fix
        const [chatCommand] = lastChatMessage.message.chatCommands;

        if (chatCommand) {
          // eslint-disable-next-line max-depth
          switch (chatCommand) {
            case "applause":
              setCurrentSoundClip("applause");
              break;
            case "funny-drummy":
              setCurrentSoundClip("funny-drummy");
              break;
            default:
              setCurrentSoundClip("");
          }
        }
      }
    }
  }, [chatMessages]);

  useEffect(() => {
    const el = chatWindowRef?.current;

    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    const socket = io("ws://localhost:3001");

    socket.open();
    socket.emit("hello");

    socket.on("helloAck", (message) => {
      console.log(message);
    });

    socket.on("connect", () => {
      setSocketId(socket.id);
      setSocketConnected(socket.connected);
    });

    socket.on("disconnect", () => {
      setSocketConnected(socket.connected);
    });

    socket.on("chat-message-cache", ({ data }) => {
      // @ts-ignore i'm right, you're wrong, we can reconcile our differences later
      setChatMessages((prevData) => {
        // @ts-ignore TODO: fix once we have the modules in
        if (!chatMessages.includes(data.displayName)) {
          return [...prevData, ...data];
        }
      });
    });

    socket.on("user-joined-chat-cache", ({ data }) => {
      const userExistsInList = data.some((item: any) =>
        item.username.includes(data.username)
      );

      if (!userExistsInList) {
        const joinedData = [...joinedChatData, ...data];

        joinedData.sort((a, b) => {
          if (a.username < b.username) {
            return -1;
          }

          if (a.username > b.username) {
            return 1;
          }

          return 0;
        });

        // @ts-ignore i'm right, you're wrong, we can reconcile our differences later
        setJoinedChatData((prevData) => [...prevData, ...data]);
      }
    });

    socket.on("user-left-chat-cache", ({ data }) => {
      const updatedChatUserList = joinedChatData.filter(
        // @ts-ignore TODO: fix typing
        (obj) => obj.user !== data.user
      );

      setChatMessages(updatedChatUserList);
    });

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    console.log("socket connected ", socketConnected);
  }, [socketConnected]);

  useEffect(() => {
    const callMe = async () => {
      try {
        await axios.get(
          "http://localhost:3001/cron-jobs/persist-to-db/user-joined-chat"
        );
      } catch (error) {
        console.error(error);
      }
    };

    callMe();
  }, [joinedChatData]);

  return (
    <Grid>
      <Column span={4}>
        <Box>
          <Box marginBottom={"space60"}>
            {socketConnected ? (
              <Badge as="span" variant="success">
                client connected
              </Badge>
            ) : (
              <Badge as="span" variant={"error"}>
                client disconnected
              </Badge>
            )}
          </Box>
          <Heading as="h1" variant="heading10">
            Hi, Chat!
          </Heading>
          {joinedChatData.map((data: JoinedChatData) => {
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
        </Box>
      </Column>
      <Column span={4}>
        {/* <audio controls src="/sounds/applause.wav" /> */}
        {currentSoundClip ? (
          <>
            {/* eslint-disable-next-line */}
            <audio
              controls
              src={`/sounds/${currentSoundClip}.wav`}
              autoPlay
              onEnded={handleAudioEnd}
              ref={audioRef}
            />
          </>
        ) : null}
      </Column>
      <Column span={4}>
        <Card>
          <Box
            height={"500px"}
            overflow={"scroll"}
            overflowX={"hidden"}
            ref={chatWindowRef}
          >
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
                        <ChatMessageMeta
                          aria-label={`message from ${displayName}`}
                        >
                          <ChatMessageMetaItem>
                            <Text
                              as={"span"}
                              color={
                                subscriber ? "colorTextIconNew" : "colorText"
                              }
                            >
                              {displayName}
                            </Text>{" "}
                            - {timestamp}
                          </ChatMessageMetaItem>
                        </ChatMessageMeta>
                      </ChatMessage>
                    )
                  )
                : null}
            </ChatLog>
          </Box>
        </Card>
      </Column>
    </Grid>
  );
};
