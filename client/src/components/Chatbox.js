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
      bgcolor="white"
      width={{ xs: "100%", md: "68%" }}
      borderRadius={2}
      border={1}
      borderColor="divider"
      sx={{ backgroundColor: theme.palette.background.extra.default }}
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default Chatbox;
