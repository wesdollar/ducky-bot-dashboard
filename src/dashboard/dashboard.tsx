import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { sortBy } from "lodash";
import {
  Box,
  Card,
  Column,
  Grid,
  UseToasterReturnedProps,
} from "@twilio-paste/core";
import { ChatDisplay } from "../components/chat-log/chat-display";
import { NotesEntry } from "../components/users/notes-entry/notes-entry";
import { ChatMessagePayload } from "@dollardojo/modules/types/chat/chat-message-payload";
import {
  ResponseUserJoinedObject,
  ResponseUserLeftObject,
} from "@dollardojo/modules/types/irc-messages/irc-message-object";
import { ClientStatus } from "../components/client-status";
import { MainHeader } from "../components/headings/main-header/main-header";
import { UsersDisplay } from "../components/users/users-display/users-display";
import { ircResourceKeys } from "@dollardojo/modules/constants/irc-resource-keys";

interface DashboardProps {
  handleToast: (toastObject: UseToasterReturnedProps) => void;
}

export const Dashboard = ({ handleToast }: DashboardProps) => {
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
    const socket = io(`ws://${import.meta.env.VITE_API_URL}`);

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
      `${ircResourceKeys.chatMessages}-cache`,
      ({ data }: { data: ChatMessagePayload[] }) => {
        setChatMessages((prevData) => {
          return [...prevData, ...data];
        });
      }
    );

    socket.on(
      `${ircResourceKeys.userJoinedChat}-cache`,
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
      `${ircResourceKeys.userLeftChat}-cache`,
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
    console.log(
      "Welcome to DuckyBot, I'm Ducky! Let's get this boat in the water!"
    );
  }, [socketConnected]);

  return (
    <>
      <Grid>
        <Column span={4}>
          <Box>
            <ClientStatus socketConnected={socketConnected} />
            <MainHeader>Hi, Chat!</MainHeader>
            <UsersDisplay joinedChatData={joinedChatData} />
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
        // @ts-ignore TODO: come back
        handleToast={handleToast}
      />
    </>
  );
};
