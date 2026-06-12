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
import { useEffect, useState, useRef } from "react";
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
const ENDPOINT = import.meta.env.VITE_API_URL;

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

  const { selectedChat, setSelectedChat, user, notification, setNotification, chats, setChats, socket: ctxSocket, setSocket } =
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


      await axios.put(`/api/message/read/${selectedChat._id}`, {}, config);
      socket.emit("mark read", { chatId: selectedChat._id, userId: user._id });

      setNotification((prev) =>
      prev.filter((n) => n.chat._id !== selectedChat._id)
    );
    } catch (error) {
      console.log(error);
    }
  };

  const handleMessageReceived = async (newMessageReceived) => {
  // Always update latestMessage in chats list — fixes stale caption
    setChats((prev) =>
      prev.map((c) =>
        c._id === newMessageReceived.chat._id
          ? { ...c, latestMessage: newMessageReceived }
          : c
      )
    );

    setFetchAgain((prev) => !prev); // still trigger fetchChats for resurface

    if (
      !selectedChatCompare ||
      selectedChatCompare._id !== newMessageReceived.chat._id
    ) {
      if (!notification.find((n) => n._id === newMessageReceived._id)) {
        setNotification([newMessageReceived, ...notification]);
      }
    } else {
      setMessages((prev) => [...prev, newMessageReceived]);
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        await axios.put(`/api/message/read/${newMessageReceived.chat._id}`, {}, config);
        socket.emit("mark read", { chatId: newMessageReceived.chat._id, userId: user._id });
      } catch (err) {
        console.log(err);
      }
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
    const s = io(ENDPOINT);
    s.emit("setup", user);
    s.on("connected", () => setSocketConnected(true));
    s.on("typing", () => setIsTyping(true));
    s.on("stop typing", () => setIsTyping(false));

    socket = s;
    setSocket(s); 

    return () => s.disconnect();

  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message received", async (newMessageReceived) => {
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

        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.put(`/api/message/read/${newMessageReceived.chat._id}`, {}, config);
        socket.emit("mark read", {
          chatId: newMessageReceived.chat._id,
          userId: user._id,
        });
      }
    });

    socket.on("messages read", ({ chatId, readerId }) => {
      if (selectedChatCompare?._id === chatId) {
        setMessages((prev) =>
          prev.map((msg) => {
            const alreadyRead = msg.readBy.some(
              (id) => (id?._id?.toString() || id?.toString()) === readerId.toString()
            );
            return alreadyRead
              ? msg
              : { ...msg, readBy: [...msg.readBy, readerId] };
          })
        );
      }
    });

    socket.on("chat deleted", ({ chatId }) => {
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      // If currently viewing that chat, close it
      if (selectedChatCompare?._id === chatId) {
        setSelectedChat(null);
      }
    });
  });

const typingTimeoutRef = useRef(null);

const typingHandler = (e) => {
  setNewMessage(e.target.value);

  if (!socketConnected) return;

  if (!typing) {
    setTyping(true);
    socket.emit("typing", selectedChat._id);
  }

  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }

  typingTimeoutRef.current = setTimeout(() => {
    socket.emit("stop typing", selectedChat._id);
    setTyping(false);
  }, 3000);
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
            borderRadius={2}
            width={"100%"}
            height={"100%"}
            overflow="hidden"
            sx={{
              backgroundColor: "rgba(30, 41, 59, 0.5)",
              backgroundImage: "linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(30, 41, 59, 0.5) 100%)",
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
                  backgroundColor: "rgba(30, 41, 59, 0.8)",
                  color: theme.palette.text.primary,
                  paddingLeft: 2,
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  borderRadius: "10px",
                  padding: "0.75rem",
                  "&:hover": {
                    borderColor: "rgba(148, 163, 184, 0.35)",
                  },
                  "&:focus": {
                    outline: "none",
                    borderColor: "rgba(99, 102, 241, 0.5)",
                    boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                  },
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
