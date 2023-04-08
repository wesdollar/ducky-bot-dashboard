import { Box } from "@twilio-paste/core";
import { Theme } from "@twilio-paste/core/theme";
import { Dashboard } from "./dashboard/dashboard";

export const App = () => {
  return (
    <Theme.Provider theme="dark">
      <Box padding={"space100"}>
        <Dashboard />
      </Box>
    </Theme.Provider>
  );
};

export default App;
