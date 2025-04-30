import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Stack } from "@mui/material";

export interface LoaderProps {
  size?: number;
  style?: React.CSSProperties;
}

const Loader = ({ size = 40, style = {} }: LoaderProps) => {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      width="100vw"
      height="100vh"
      style={{ ...style }}
    >
      <CircularProgress size={size} />
    </Stack>
  );
};

export default Loader;
