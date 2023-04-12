import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { sortBy, uniqueId } from "lodash";
import axios from "axios";
import {
  Badge,
  BadgeVariants,
  Box,
  Card,
  Column,
  Grid,
  Heading,
  ToastContainer,
  Toaster,
  useToaster,
} from "@twilio-paste/core";
import { ChatDisplay } from "../components/chat-log/chat-display";
import { NotesEntry } from "../components/users/notes-entry/notes-entry";
import { ChatMessagePayload } from "@dollardojo/modules/dist/types/chat/chat-message-payload";
import {
  ResponseUserJoinedObject,
  ResponseUserLeftObject,
} from "@dollardojo/modules/dist/types/irc-messages/irc-message-object";

interface JoinedChatData {
  username: string;
  lastSeen: Date;
  mod: boolean;
  subscriber: boolean;
  timestamp: string;
}

export const Dashboard = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessagePayload[]>([]);
  const [joinedChatData, setJoinedChatData] = useState<
    ResponseUserJoinedObject[]
  >([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [socketId, setSocketId] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const [currentSoundClip, setCurrentSoundClip] = useState("");
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState("");
  const toaster = useToaster();

  const handleModalToggle = (
    isOpen: boolean,
    userDisplayName?: string | undefined
  ) => {
    setModalIsOpen(isOpen);

    if (userDisplayName) {
      setUserDisplayName(userDisplayName);
    }
  };

  const handleAudioEnd = () => {
    setCurrentSoundClip("");
    setAudioIsPlaying(false);
  };

  const handleAudioPlay = () => {
    setAudioIsPlaying(true);
  };

  useEffect(() => {
    if (chatMessages.length) {
      const lastChatMessage = chatMessages[chatMessages.length - 1];

      if (lastChatMessage.message.chatCommand) {
        const { chatCommand } = lastChatMessage.message;

        if (chatCommand && !audioIsPlaying) {
          setCurrentSoundClip(chatCommand);
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

    socket.on(
      "chat-message-cache",
      ({ data }: { data: ChatMessagePayload[] }) => {
        setChatMessages((prevData) => {
          return [...prevData, ...data];
        });
      }
    );

    socket.on(
      "user-joined-chat-cache",
      ({ data }: { data: ResponseUserJoinedObject[] }) => {
        let userExistsInList = false;

        for (const user of joinedChatData) {
          if (user.username === data[0].username) {
            userExistsInList = true;

            break;
          }
        }

        if (!userExistsInList) {
          return setJoinedChatData((prevData) =>
            sortBy([...prevData, ...data], ({ username }) => username)
          );
        }

        setJoinedChatData((prevData) => prevData);
      }
    );

    socket.on(
      "user-left-chat-cache",
      ({ data }: { data: ResponseUserLeftObject[] }) => {
        const updatedChatUserList = joinedChatData.filter(
          (obj) => obj.username !== data[0].user
        );

        setJoinedChatData(updatedChatUserList);
      }
    );

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
    <>
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
          {currentSoundClip && (
            <>
              {/* eslint-disable-next-line */}
              <audio
                controls
                src={`/sounds/${currentSoundClip}.wav`}
                autoPlay
                onEnded={handleAudioEnd}
                onPlay={handleAudioPlay}
                ref={audioRef}
              />
            </>
          )}
        </Column>
        <Column span={4}>
          <Card>
            <Box
              height={"500px"}
              overflow={"scroll"}
              overflowX={"hidden"}
              ref={chatWindowRef}
            >
              <ChatDisplay
                chatMessages={chatMessages}
                handleToggleModal={handleModalToggle}
              />
            </Box>
          </Card>
        </Column>
      </Grid>
      <NotesEntry
        modalIsOpen={modalIsOpen}
        handleModalToggle={handleModalToggle}
        userDisplayName={userDisplayName}
        // @ts-ignore come back
        handleToast={toaster}
      />
      <ToastContainer>
        <Toaster {...toaster} />
      </ToastContainer>
    </>
  );
};
