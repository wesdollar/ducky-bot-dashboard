import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { reverse, uniqueId } from "lodash";
import axios from "axios";
import {
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
} from "@twilio-paste/core";

const socket = io("ws://localhost:3001");

export const Dashboard = () => {
  const [chatData, setChatData] = useState([]);

  socket.open();

  socket.on("connect", () => {
    console.log(socket.id);
    console.log(socket.connected); // true
  });

  socket.on("disconnect", () => {
    console.log(socket.connected); // false
  });

  socket.on("get-cache", ({ data }) => {
    console.log(data);

    const updatedChatData = [...chatData, ...data];

    reverse(updatedChatData);

    // @ts-ignore i'm right, you're wrong, we can reconcile our differences later
    setChatData(updatedChatData);
  });

  useEffect(() => {
    const callMe = async () => {
      try {
        await axios.get(
          "http://localhost:3001/cron-jobs/persist-to-db/chat-message"
        );
      } catch (error) {
        console.error(error);
      }
    };

    callMe();
  }, [chatData]);

  return (
    <Grid>
      <Column span={4}>
        <Box>
          <Heading as="h1" variant="heading10">
            Hi, Chat!
          </Heading>
        </Box>
      </Column>
      <Column>
        <Card>
          <Box maxHeight={"500px"} overflow={"scroll"}>
            <ChatLog>
              {chatData.length &&
                chatData.map(({ message: { message, user } }) => (
                  <ChatMessage key={uniqueId()} variant="inbound">
                    <ChatBubble>{message}</ChatBubble>
                    <ChatMessageMeta aria-label={`message from ${user}`}>
                      <ChatMessageMetaItem>{user}</ChatMessageMetaItem>
                    </ChatMessageMeta>
                  </ChatMessage>
                ))}
            </ChatLog>
          </Box>
        </Card>
      </Column>
    </Grid>
  );
};
