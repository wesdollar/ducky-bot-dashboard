import { Badge, Box } from "@twilio-paste/core";

interface ClientStatusProps {
  socketConnected: boolean;
}

export const ClientStatus = ({ socketConnected }: ClientStatusProps) => {
  return (
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
  );
};
