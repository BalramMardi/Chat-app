import React from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

const ChatLoading = () => {
  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
    </Box>
  );
};

export default ChatLoading;
