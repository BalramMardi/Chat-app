import AddIcon from "@mui/icons-material/Add";
import { Box, Stack, Typography, Button } from "@mui/material";
// import { useToast } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import { useTheme } from "../Context/ThemeProvider";

const MyChats = ({ fetchAgain }) => {
  const { theme } = useTheme();
  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  // const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `${process.env.REACT_APP_URL}/api/chat`,
        config
      );
      setChats(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <Box
      // display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      display={{ xs: selectedChat ? "none" : "flex", md: "flex" }}
      flexDirection="column"
      alignItems="center"
      p={3}
      bgcolor="white"
      width={{ xs: "100%", md: "31%" }}
      borderRadius={2}
      border={1}
      borderColor="divider"
      sx={{ backgroundColor: theme.palette.background.extra.default }}
    >
      <Box
        paddingBottom={3}
        paddingX={3}
        fontSize={{ xs: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        width="100%"
        justifyContent="space-between"
        alignItems="center"
        color={theme.palette.text.primary}
      >
        <Typography variant="h5">My Chats</Typography>
        <GroupChatModal>
          <Button
            sx={{
              display: "flex",
              fontSize: { xs: "17px", md: "10px", lg: "17px" },
              backgroundColor: theme.palette.primary.main,
            }}
            startIcon={<AddIcon />}
            variant="contained"
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        p={3}
        bgcolor="#F8F8F8"
        width="100%"
        height="100%"
        borderRadius={1}
        overflowY="hidden"
        sx={{
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.background.default,
        }}
      >
        {chats ? (
          <Stack spacing={1} sx={{ overflowY: "scroll" }}>
            {chats.map((chat) => (
              <Box
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                sx={{
                  cursor: "pointer",
                  bgcolor:
                    selectedChat === chat
                      ? "#38B2AC"
                      : theme.palette.background.extra[200],
                  color:
                    selectedChat === chat
                      ? "white"
                      : theme.palette.text.primary,
                  paddingX: 3,
                  paddingY: 2,
                  borderRadius: 2,
                }}
              >
                <Typography>
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Typography>
                {chat.latestMessage && (
                  <Typography variant="caption">
                    <strong>{chat.latestMessage.sender.name}:</strong>{" "}
                    {chat.latestMessage.content.length > 50
                      ? `${chat.latestMessage.content.substring(0, 51)}...`
                      : chat.latestMessage.content}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
