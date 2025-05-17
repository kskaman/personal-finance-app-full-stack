import { Box, Stack, keyframes } from "@mui/material";
import { grey900 } from "../theme/colors";

const pulse = keyframes`
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
  }
`;

const DotLoader = () => (
  <Stack
    direction="row"
    justifyContent="center"
    alignItems="center"
    height="100vh"
    gap={1}
  >
    {[0, 150, 300].map((delay, index) => (
      <Box
        key={index}
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: grey900,
          animation: `${pulse} 1.2s infinite`,
          animationDelay: `${delay}ms`,
        }}
      />
    ))}
  </Stack>
);

export default DotLoader;
