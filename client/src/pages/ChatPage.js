import { Box } from "@mui/material";
import { useState } from "react";
import Chatbox from "../components/Chatbox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const ChatPage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      {user && <SideDrawer />}
      <Box
        display="flex"
        justifyContent="space-between"
        width="100%"
        height="91.5vh"
        padding="10px"
        gap="10px"
        sx={{
          "@media (max-width: 768px)": {
            height: "calc(100vh - 70px)",
            padding: "5px",
            gap: "5px",
          },
          "@media (max-width: 480px)": {
            height: "calc(100vh - 60px)",
            padding: "3px",
            gap: "3px",
          },
        }}
      >
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
};

export default ChatPage;
