import { Heading } from "@twilio-paste/core";
import React from "react";

interface MainHeaderProps {
  children: React.ReactNode;
}

export const MainHeader = ({ children }: MainHeaderProps) => {
  return (
    <Heading as="h1" variant="heading10">
      {children}
    </Heading>
  );
};
