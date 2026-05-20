import { Box } from "@mui/material";
import "./styles.css";
import SingleChat from "./SingleChat";
import { ChatState } from "../Context/ChatProvider";
import { useTheme } from "../Context/ThemeProvider";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { theme } = useTheme();
  const { selectedChat } = ChatState();

  return (
    <Box
      display={{ xs: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDirection="column"
      p={3}
      width={{ xs: "100%", md: "68%" }}
      borderRadius={2}
      border={1}
      borderColor="divider"
      sx={{
        backgroundColor: theme.palette.background.paper,
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(148, 163, 184, 0.2)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      }}
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default Chatbox;
