import {
  Box,
  Button,
  Card,
  Column,
  Form,
  FormActions,
  FormControl,
  Grid,
  Input,
  Label,
  type UseToasterReturnedProps,
} from "@twilio-paste/core";
import axios from "axios";
import React, { useRef, useState } from "react";
import { httpStatusCodes } from "@dollardojo/modules/constants/http-status-codes";

interface LoginProps {
  handleSetUserIsAuthenticated: (user: boolean) => void;
  handleToast: (toastObject: UseToasterReturnedProps) => void;
}

export const Login = ({
  handleSetUserIsAuthenticated,
  handleToast,
}: LoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleLoginSubmit = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();

    let response;

    usernameRef.current!.value = "";
    passwordRef.current!.value = "";

    try {
      if (!username || !password) {
        // TODO: types
        // @ts-ignore shut up
        handleToast.push({
          message: "Username and password is required!",
          variant: "error",
          dismissAfter: 3000,
        });

        return console.error("authentication failed");
      }

      response = await axios.post(
        `//${import.meta.env.VITE_API_URL}/users/auth/login`,
        {
          data: {
            username,
            password,
          },
        }
      );

      if (response.status === httpStatusCodes.ok) {
        handleSetUserIsAuthenticated(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const usernameFieldId = "username";
  const passwordFieldId = "password";

  return (
    <Grid>
      <Column span={4} offset={4}>
        <Box>
          <Card>
            <Form>
              <FormControl>
                <Label htmlFor={usernameFieldId}>Username</Label>
                <Input
                  type="text"
                  id={usernameFieldId}
                  name={usernameFieldId}
                  required
                  onChange={(event) => setUsername(event.target.value)}
                  ref={usernameRef}
                />
              </FormControl>
              <FormControl>
                <Label htmlFor={passwordFieldId}>Password</Label>
                <Input
                  type="password"
                  id={passwordFieldId}
                  name={passwordFieldId}
                  required
                  onChange={(event) => setPassword(event.target.value)}
                  ref={passwordRef}
                />
              </FormControl>
              <FormActions>
                <Button
                  variant={"primary"}
                  onClick={(event) => handleLoginSubmit(event)}
                >
                  Login
                </Button>
              </FormActions>
            </Form>
          </Card>
        </Box>
      </Column>
    </Grid>
  );
};
