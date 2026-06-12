import React, { useState } from "react";
import {
  Button,
  Box,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Drawer,
  Divider,
  Input,
  CircularProgress,
  Badge,
  ListItemText,
  ListItemAvatar,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";

import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "../userAvatar/UserListItem";
import ProfileModal from "./ProfileModal";
import ProfilePictureModal from "./ProfilePictureModal";
import { ChatState } from "../../Context/ChatProvider";
import { getSender } from "../../config/ChatLogics";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../Context/ThemeProvider";

// ── shared menu paper style ──────────────────────────────────────────────────
const darkMenuPaper = {
  background: "rgba(15, 23, 42, 0.97)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(148, 163, 184, 0.2)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  minWidth: 300,
  maxWidth: 360,
};

function SideDrawer() {
  const { theme } = useTheme();

  const [search, setSearch]               = useState("");
  const [searchResult, setSearchResult]   = useState([]);
  const [loading, setLoading]             = useState(false);
  const [loadingChat, setLoadingChat]     = useState(false);
  const [drawerOpen, setDrawerOpen]       = useState(false);

  const [notifAnchorEl, setNotifAnchorEl]       = useState(null);
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState(null);
  const [profilePictureModalOpen, setProfilePictureModalOpen] = useState(false);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
    socket 
  } = ChatState();

  const navigate = useNavigate();

  // ── auth ─────────────────────────────────────────────────────────────────
  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  // ── search ────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!search) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setSearchResult(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post("/api/chat", { userId }, config);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setDrawerOpen(false);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingChat(false);
    }
  };

  // ── notification actions ──────────────────────────────────────────────────

  // Open a specific notification → navigate to that chat + remove it
  const handleOpenNotif = (notif) => {
    setNotifAnchorEl(null);
    setSelectedChat(notif.chat);
    setNotification((prev) => prev.filter((n) => n._id !== notif._id));
  };

  // Dismiss (erase) a single notification without opening the chat
  const handleDismissNotif = async (e, notif) => {  // pass full notif, not just id
    e.stopPropagation();

    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    try {
      await axios.put(`/api/message/read/${notif.chat._id}`, {}, config);
      if (socket) {
        socket.emit("mark read", { chatId: notif.chat._id, userId: user._id });
      }
    } catch (err) {
      console.log(err);
    }

    setNotification((prev) => prev.filter((n) => n._id !== notif._id));
  };

  // Mark all as seen → clear all notifications, don't navigate anywhere
  const handleMarkAllRead = async () => {
  // Get unique chat IDs from notifications
    const chatIds = [...new Set(notification.map((n) => n.chat._id))];

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    // For each chat, mark messages as read on server + emit socket event
    await Promise.all(
      chatIds.map(async (chatId) => {
        try {
          await axios.put(`/api/message/read/${chatId}`, {}, config);
          if (socket) {
            socket.emit("mark read", { chatId, userId: user._id });
          }
        } catch (err) {
          console.log(err);
        }
      })
    );

    // Clear all notifications locally
    setNotification([]);
    setNotifAnchorEl(null);
  };

  // Erase all → same effect, different intent (explicit destructive action)
  const handleEraseAll = () => {
    setNotification([]);
    setNotifAnchorEl(null);
  };

  // ── profile ───────────────────────────────────────────────────────────────
  const handleProfilePictureModalOpen = (e) => {
    e.stopPropagation();
    setProfilePictureModalOpen(true);
    setProfileMenuAnchorEl(null);
  };

  return (
    <>
      {/* ── Top navbar ───────────────────────────────────────────────────── */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        padding="5px 10px"
        sx={{
          background: "rgba(15, 23, 42, 0.9)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        }}
        color={theme.palette.text.primary}
      >
        {/* Search trigger */}
        <Tooltip title="Search Users to chat" arrow>
          <Button
            variant="text"
            onClick={() => setDrawerOpen(true)}
            sx={{
              color: theme.palette.text.primary,
              "&:hover": { background: "rgba(99, 102, 241, 0.15)" },
            }}
          >
            <SearchIcon />
            <Typography display={{ xs: "none", md: "flex" }} paddingX={1}>
              Search User
            </Typography>
          </Button>
        </Tooltip>

        {/* Logo */}
        <Typography
          variant="h4"
          fontFamily="Work sans"
          sx={{
            fontSize: { xs: "24px", sm: "28px", md: "32px", lg: "36px" },
            textAlign: "center",
            background:
              "linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #818cf8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          WhizChat
        </Typography>

        {/* Right controls */}
        <Box display="flex" alignItems="center" gap={0.5}>

          {/* ── Notification bell ────────────────────────────────────────── */}
          <IconButton
            onClick={(e) => setNotifAnchorEl(e.currentTarget)}
            sx={{
              color: theme.palette.primary.main,
              "&:hover": { background: "rgba(99, 102, 241, 0.15)" },
            }}
          >
            <Badge
              badgeContent={notification.length}
              color="error"
              overlap="circular"
            >
              <NotificationsIcon
                sx={{ fontSize: { xs: "24px", sm: "28px", md: "32px", lg: "36px" } }}
              />
            </Badge>
          </IconButton>

          {/* ── Notification panel ───────────────────────────────────────── */}
          <Menu
            anchorEl={notifAnchorEl}
            open={Boolean(notifAnchorEl)}
            onClose={() => setNotifAnchorEl(null)}
            PaperProps={{ sx: darkMenuPaper }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {/* Panel header */}
            <Box
              sx={{
                px: 2,
                py: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(148,163,184,0.15)",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                Notifications
                {notification.length > 0 && (
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      ml: 1,
                      px: 1,
                      py: 0.25,
                      borderRadius: "999px",
                      bgcolor: "rgba(239,68,68,0.2)",
                      color: "#f87171",
                      fontWeight: 700,
                    }}
                  >
                    {notification.length}
                  </Typography>
                )}
              </Typography>

              {/* Bulk actions — only show when there are notifications */}
              {notification.length > 0 && (
                <Box display="flex" gap={0.5}>
                  <Tooltip title="Mark all as seen" arrow>
                    <IconButton size="small" onClick={handleMarkAllRead}
                      sx={{ color: "#60a5fa", "&:hover": { bgcolor: "rgba(96,165,250,0.1)" } }}>
                      <DoneAllIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Erase all" arrow>
                    <IconButton size="small" onClick={handleEraseAll}
                      sx={{ color: "#f87171", "&:hover": { bgcolor: "rgba(248,113,113,0.1)" } }}>
                      <DeleteSweepIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>

            {/* Empty state */}
            {notification.length === 0 && (
              <Box
                sx={{
                  py: 5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  color: "text.secondary",
                }}
              >
                <NotificationsOffIcon sx={{ fontSize: 40, opacity: 0.4 }} />
                <Typography variant="body2">You're all caught up</Typography>
              </Box>
            )}

            {/* Notification items */}
            {notification.map((notif) => {
              const senderName = notif.chat.isGroupChat
                ? notif.chat.chatName
                : getSender(user, notif.chat.users);

              const senderPic = notif.chat.isGroupChat
                ? null
                : notif.chat.users?.find((u) => u._id !== user._id)?.pic;

              const preview =
                notif.content?.length > 40
                  ? `${notif.content.substring(0, 40)}...`
                  : notif.content || "Sent a message";

              return (
                <MenuItem
                  key={notif._id}
                  onClick={() => handleOpenNotif(notif)}
                  sx={{
                    px: 2,
                    py: 1.25,
                    gap: 1.5,
                    alignItems: "flex-start",
                    borderBottom: "1px solid rgba(148,163,184,0.08)",
                    "&:hover": { bgcolor: "rgba(99,102,241,0.12)" },
                    "&:last-of-type": { borderBottom: "none" },
                  }}
                >
                  {/* Avatar */}
                  <ListItemAvatar sx={{ minWidth: 40, mt: 0.5 }}>
                    <Avatar
                      src={senderPic}
                      sx={{
                        width: 36,
                        height: 36,
                        fontSize: "0.85rem",
                        bgcolor: "rgba(99,102,241,0.3)",
                        border: "1px solid rgba(99,102,241,0.4)",
                      }}
                    >
                      {!senderPic ? senderName?.charAt(0).toUpperCase() : ""}
                    </Avatar>
                  </ListItemAvatar>

                  {/* Text */}
                  <ListItemText
                    disableTypography
                    primary={
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "text.primary", lineHeight: 1.3 }}
                      >
                        {notif.chat.isGroupChat
                          ? `${senderName}`
                          : senderName}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", display: "block" }}
                        >
                          {notif.chat.isGroupChat
                            ? `${notif.sender?.name || "Someone"}: ${preview}`
                            : preview}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "rgba(148,163,184,0.6)", fontSize: "0.65rem" }}
                        >
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </>
                    }
                  />

                  {/* Dismiss (×) button */}
                  <Tooltip title="Dismiss" arrow>
                    <IconButton
                      size="small"
                      onClick={(e) => handleDismissNotif(e, notif)}
                      sx={{
                        ml: "auto",
                        mt: 0.25,
                        color: "rgba(148,163,184,0.5)",
                        "&:hover": {
                          color: "#f87171",
                          bgcolor: "rgba(248,113,113,0.1)",
                        },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </MenuItem>
              );
            })}
          </Menu>

          {/* ── Avatar ───────────────────────────────────────────────────── */}
          <IconButton
            onClick={handleProfilePictureModalOpen}
            sx={{ "&:hover": { background: "rgba(99, 102, 241, 0.15)" } }}
          >
            <Avatar
              sx={{
                cursor: "pointer",
                width: { xs: "24px", sm: "28px", md: "32px", lg: "36px" },
                height: { xs: "24px", sm: "28px", md: "32px", lg: "36px" },
                border: "2px solid rgba(99, 102, 241, 0.3)",
                backgroundColor: "rgba(99, 102, 241, 0.3)",
                fontSize: "0.8rem",
              }}
              src={user.pic}
              alt={user.name}
            >
              {!user.pic || user.pic === ""
                ? user.name.charAt(0).toUpperCase()
                : ""}
            </Avatar>
          </IconButton>

          {/* ── Profile dropdown ─────────────────────────────────────────── */}
          <IconButton
            onClick={(e) => setProfileMenuAnchorEl(e.currentTarget)}
            sx={{
              color: "white",
              "&:hover": { background: "rgba(99, 102, 241, 0.15)" },
            }}
          >
            <ExpandMoreIcon
              sx={{ fontSize: { xs: "24px", sm: "28px", md: "32px", lg: "36px" } }}
            />
          </IconButton>

          <Menu
            anchorEl={profileMenuAnchorEl}
            open={Boolean(profileMenuAnchorEl)}
            onClose={() => setProfileMenuAnchorEl(null)}
            PaperProps={{ sx: darkMenuPaper }}
          >
            <MenuItem onClick={() => setProfileMenuAnchorEl(null)}>
              <ProfileModal user={user}>
                <span>My Profile</span>
              </ProfileModal>
            </MenuItem>
            <Divider sx={{ borderColor: "rgba(148,163,184,0.15)" }} />
            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* ── Search drawer ─────────────────────────────────────────────────── */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box
          padding={2}
          sx={{
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(10px)",
            minWidth: "300px",
            borderRight: "1px solid rgba(148, 163, 184, 0.2)",
            height: "stretch",
          }}
        >
          <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
            Search Users
          </Typography>
          <Box display="flex" paddingBottom={2}>
            <Input
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              sx={{
                marginRight: 1,
                color: theme.palette.text.primary,
                background: "rgba(30, 41, 59, 0.8)",
                padding: "0.5rem",
                borderRadius: "8px",
                border: "1px solid rgba(148, 163, 184, 0.25)",
                "&:hover": { borderColor: "rgba(148, 163, 184, 0.35)" },
                "&:focus":  { outline: "none", borderColor: "rgba(99, 102, 241, 0.5)" },
              }}
            />
            <Button variant="contained" onClick={handleSearch}>
              Go
            </Button>
          </Box>
          {loading ? (
            <ChatLoading />
          ) : (
            searchResult?.map((u) => (
              <UserListItem
                key={u._id}
                user={u}
                handleFunction={() => accessChat(u._id)}
              />
            ))
          )}
          {loadingChat && (
            <CircularProgress style={{ marginLeft: "auto", display: "flex" }} />
          )}
        </Box>
      </Drawer>

      {/* ── Profile picture modal ─────────────────────────────────────────── */}
      <ProfilePictureModal
        open={profilePictureModalOpen}
        onClose={() => setProfilePictureModalOpen(false)}
      />
    </>
  );
}

export default SideDrawer;