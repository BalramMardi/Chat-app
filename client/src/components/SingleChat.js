import {
  Box,
  Typography,
  IconButton,
  Input,
  CircularProgress,
  FormControl,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useEffect, useState } from "react";
import axios from "axios";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import ProfileModal from "./miscellaneous/ProfileModal";
import { ChatState } from "../Context/ChatProvider";
import "./styles.css";
import { useTheme } from "../Context/ThemeProvider";

// const ENDPOINT = "http://localhost:5000";
const ENDPOINT = "https://chat-app-b88m.onrender.com/";

var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.log(error);
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Typography
            sx={{
              fontSize: { xs: "28px", md: "30px" },
              display: "flex",
              justifyContent: { xs: "space-between" },
              alignItems: "center",
              color: theme.palette.text.primary,
            }}
            pb={1}
            px={2}
            width="100%"
            fontFamily="Work sans"
          >
            <IconButton
              // display={{ sx: "flex", md: "none" }}
              sx={{
                display: { xs: "flex", md: "none" },
                color: theme.palette.text.primary,
              }}
              onClick={() => setSelectedChat("")}
            >
              <ArrowBackIcon />
            </IconButton>

            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}

                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            p={3}
            bgcolor="#E8E8E8"
            borderRadius={2}
            width={"100%"}
            height={"100%"}
            overflow="hidden"
            sx={{
              backgroundColor: theme.palette.background.default,
            }}
          >
            {loading ? (
              <CircularProgress
                size={60}
                thickness={5}
                style={{ alignSelf: "center", margin: "auto" }}
              />
            ) : (
              <div className="messages" style={{ marginBottom: 24 }}>
                <ScrollableChat messages={messages} />
              </div>
            )}
            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              required
              mt={3}
              width="100%"
            >
              {istyping && (
                <Lottie
                  options={defaultOptions}
                  width={70}
                  style={{ marginBottom: 15, marginLeft: 0 }}
                />
              )}
              <Input
                variant="filled"
                sx={{
                  backgroundColor: theme.palette.background.extra.default,
                  color: theme.palette.text.primary,
                  paddingLeft: 2,
                }}
                placeholder="Enter a message.."
                value={newMessage}
                onChange={typingHandler}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Typography
            fontSize="3xl"
            pb={3}
            fontFamily="Work sans"
            color={theme.palette.text.primary}
          >
            Click on a user to start chatting
          </Typography>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
