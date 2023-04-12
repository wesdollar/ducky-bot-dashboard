import { Box, ToastContainer, Toaster, useToaster } from "@twilio-paste/core";
import { Theme } from "@twilio-paste/core/theme";
import { useState } from "react";
import { Login } from "./auth/login/login";
import { Dashboard } from "./dashboard/dashboard";

export const App = () => {
  const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);
  const toaster = useToaster();

  return (
    <Theme.Provider theme="dark">
      <Box padding={"space100"}>
        {/* @ts-ignore TODO: figure out*/}
        {userIsAuthenticated && <Dashboard handleToast={toaster} />}
        {!userIsAuthenticated && (
          <Login
            handleSetUserIsAuthenticated={setUserIsAuthenticated}
            // @ts-ignore TODO: come back
            handleToast={toaster}
          />
        )}
      </Box>
      <ToastContainer>
        <Toaster {...toaster} />
      </ToastContainer>
    </Theme.Provider>
  );
};

export default App;
