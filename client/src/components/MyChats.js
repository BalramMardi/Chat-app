import AddIcon from "@mui/icons-material/Add";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { getSender } from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import { useTheme } from "../Context/ThemeProvider";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";

const MyChats = ({ fetchAgain, socket }) => {
  const { theme } = useTheme();
  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  // ── context menu state ──
  const [contextMenu, setContextMenu] = useState(null); // { mouseX, mouseY, chat }
  const [confirmDialog, setConfirmDialog] = useState(null); // { type, chat }
  const [actionLoading, setActionLoading] = useState(false);

  // keep a ref to messages setter — passed down from parent if needed
  // (we expose a setMessages prop optionally for clearing the chat view)
  const setMessagesRef = useRef(null);

  const config = {
    headers: { Authorization: `Bearer ${user.token}` },
  };

  // ── fetch chats ──
  const fetchChats = async () => {
    try {
      const { data } = await axios.get("/api/chat", config);
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

  // ── listen for "chat deleted for everyone" from other participants ──
  useEffect(() => {
    if (!socket) return;

    socket.on("chat deleted", ({ chatId }) => {
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (selectedChat?._id === chatId) setSelectedChat(null);
    });

    return () => socket.off("chat deleted");
    // eslint-disable-next-line
  }, [socket, selectedChat]);

  // ── context menu handlers ──
  const handleContextMenu = (e, chat) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, chat });
  };

  const closeContextMenu = () => setContextMenu(null);

  const openConfirm = (type) => {
    setConfirmDialog({ type, chat: contextMenu.chat });
    closeContextMenu();
  };

  // ── confirm action ──
  const confirmAction = async () => {
  if (!confirmDialog) return;
  const { type, chat } = confirmDialog;
  setActionLoading(true);

  try {
    if (type === "clear") {
      await axios.put(`/api/chat/clear/${chat._id}`, {}, config);

      // Patch clearedBy locally so caption hides without waiting for refetch
      const clearedAt = new Date().toISOString();
      setChats((prev) =>
        prev.map((c) =>
          c._id === chat._id
            ? {
                ...c,
                clearedBy: [
                  ...(c.clearedBy || []).filter(
                    (cb) => (cb.user?._id || cb.user) !== user._id
                  ),
                  { user: { _id: user._id }, clearedAt },
                ],
              }
            : c
        )
      );

      if (selectedChat?._id === chat._id) {
        if (typeof setMessagesRef.current === "function") {
          setMessagesRef.current([]);
        }
      }

    } else if (type === "delete") {
      await axios.put(`/api/chat/delete/${chat._id}`, {}, config);
      setChats((prev) => prev.filter((c) => c._id !== chat._id));
      if (selectedChat?._id === chat._id) setSelectedChat(null);

    } else if (type === "deleteAll") {
      await axios.delete(`/api/chat/${chat._id}`, config);
      setChats((prev) => prev.filter((c) => c._id !== chat._id));
      if (selectedChat?._id === chat._id) setSelectedChat(null);
      if (socket) {
        socket.emit("chat deleted", { chatId: chat._id, deletedBy: user._id });
      }
    }
  } catch (err) {
    console.log(err);
  } finally {
    setActionLoading(false);
    setConfirmDialog(null);
  }
};

  // ── helper: dialog copy ──
  const dialogCopy = {
    clear: {
      title: "Clear chat?",
      body: "All messages will be hidden for you. The other person can still see them.",
      confirmLabel: "Clear",
      confirmColor: "primary",
    },
    delete: {
      title: "Delete chat?",
      body: "This chat will be removed from your list. The other person is unaffected.",
      confirmLabel: "Delete",
      confirmColor: "error",
    },
    deleteAll: {
      title: "Delete for everyone?",
      body: "All messages will be permanently deleted for everyone. This cannot be undone.",
      confirmLabel: "Delete for everyone",
      confirmColor: "error",
    },
  };

  const copy = confirmDialog ? dialogCopy[confirmDialog.type] : null;

  // ── is current user the group admin of the context-menu chat? ──
  const isAdmin =
    contextMenu?.chat?.isGroupChat &&
    contextMenu?.chat?.groupAdmin?._id === user._id;

  return (
    <Box
      display={{ xs: selectedChat ? "none" : "flex", md: "flex" }}
      flexDirection="column"
      alignItems="center"
      p={3}
      width={{ xs: "100%", md: "31%" }}
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
      {/* ── header ── */}
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
            sx={{ display: "flex", fontSize: { xs: "17px", md: "10px", lg: "17px" } }}
            startIcon={<AddIcon />}
            variant="contained"
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>

      {/* ── chat list ── */}
      <Box
        display="flex"
        flexDirection="column"
        p={3}
        width="100%"
        height="100%"
        borderRadius={1}
        overflowY="hidden"
        sx={{
          color: theme.palette.text.primary,
          backgroundColor: "rgba(30, 41, 59, 0.5)",
        }}
      >
        {chats ? (
          <Stack spacing={1} sx={{ overflowY: "scroll" }}>
            {chats.map((chat) => (
              <Box
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                onContextMenu={(e) => handleContextMenu(e, chat)}
                sx={{
                  cursor: "pointer",
                  position: "relative",
                  bgcolor:
                    selectedChat === chat
                      ? "rgba(99, 102, 241, 0.3)"
                      : "rgba(99, 102, 241, 0.1)",
                  color:
                    selectedChat === chat
                      ? theme.palette.text.primary
                      : theme.palette.text.secondary,
                  paddingX: 3,
                  paddingY: 2,
                  borderRadius: 2,
                  border:
                    selectedChat === chat
                      ? "1px solid rgba(99, 102, 241, 0.5)"
                      : "1px solid rgba(148, 163, 184, 0.2)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "rgba(99, 102, 241, 0.2)",
                    borderColor: "rgba(99, 102, 241, 0.4)",
                    boxShadow: "0 0 20px rgba(99, 102, 241, 0.1)",
                  },
                  // Subtle hint that right-click is available
                  userSelect: "none",
                }}
              >
                {(() => {
                  const clearEntry = chat.clearedBy?.find(
                    (c) => c.user === user._id || c.user?._id === user._id
                  );
                  const isHidden =
                    clearEntry &&
                    chat.latestMessage &&
                    new Date(chat.latestMessage.createdAt) <= new Date(clearEntry.clearedAt);

                  return (
                    <>
                      <Typography>
                        {!chat.isGroupChat
                          ? getSender(loggedUser, chat.users)
                          : chat.chatName}
                      </Typography>
                      {chat.latestMessage && !isHidden && (
                        <Typography variant="caption">
                          <strong>{chat.latestMessage.sender.name}:</strong>{" "}
                          {chat.latestMessage.content.length > 50
                            ? `${chat.latestMessage.content.substring(0, 51)}...`
                            : chat.latestMessage.content}
                        </Typography>
                      )}
                    </>
                  );
                })()}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>

      {/* ── right-click context menu ── */}
      <Menu
        open={Boolean(contextMenu)}
        onClose={closeContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        PaperProps={{
          sx: {
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            minWidth: 220,
          },
        }}
      >
        {/* Clear chat */}
        <MenuItem
          onClick={() => openConfirm("clear")}
          sx={{ gap: 1, "&:hover": {bgcolor: "rgba(99,102,241,0.15)" } }}
        >
          <ListItemIcon>
            <DeleteSweepIcon fontSize="small" sx={{ color: "#94a3b8" }} />
          </ListItemIcon>
          <Box>
            <Typography variant="body2" color="text.primary">
              Clear chat
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Hide messages for you only
            </Typography>
          </Box>
        </MenuItem>

        {/* Delete for me */}
        <MenuItem
          onClick={() => openConfirm("delete")}
          sx={{ gap: 1, "&:hover": { bgcolor: "rgba(248,113,113,0.1)" } }}
        >
          <ListItemIcon>
            <DeleteOutlineIcon fontSize="small" sx={{ color: "#f87171" }} />
          </ListItemIcon>
          <Box>
            <Typography variant="body2" color="text.primary">
              Delete for me
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Remove from your list only
            </Typography>
          </Box>
        </MenuItem>

        <Divider sx={{ borderColor: "rgba(148,163,184,0.15)", my: 0.5 }} />

        {/* Delete for everyone — disabled for non-admins in group chats */}
        <MenuItem
          onClick={() => openConfirm("deleteAll")}
          disabled={
            contextMenu?.chat?.isGroupChat && !isAdmin
          }
          sx={{
            gap: 1,
            "&:hover": { bgcolor: "rgba(239,68,68,0.1)" },
            "&.Mui-disabled": { opacity: 0.4 },
          }}
        >
          <ListItemIcon>
            <DeleteForeverIcon fontSize="small" sx={{ color: "#ef4444" }} />
          </ListItemIcon>
          <Box>
            <Typography variant="body2" sx={{ color: "#ef4444" }}>
              Delete for everyone
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {contextMenu?.chat?.isGroupChat && !isAdmin
                ? "Only group admin can do this"
                : "Permanently delete for all"}
            </Typography>
          </Box>
        </MenuItem>
      </Menu>

      {/* ── confirmation dialog ── */}
      <Dialog
        open={Boolean(confirmDialog)}
        onClose={() => !actionLoading && setConfirmDialog(null)}
        PaperProps={{
          sx: {
            background: "rgba(15, 23, 42, 0.97)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: 2,
            minWidth: 320,
          },
        }}
      >
        <DialogTitle sx={{ color: "text.primary", pb: 1 }}>
          {copy?.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {copy?.body}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setConfirmDialog(null)}
            disabled={actionLoading}
            variant="outlined"
            sx={{ borderColor: "rgba(148,163,184,0.3)", color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmAction}
            disabled={actionLoading}
            color={copy?.confirmColor}
            variant="contained"
          >
            {actionLoading ? "Please wait..." : copy?.confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyChats;