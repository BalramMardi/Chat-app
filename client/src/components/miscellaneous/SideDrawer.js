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
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "../userAvatar/UserListItem";
import ProfileModal from "./ProfileModal";
import ProfilePictureModal from "./ProfilePictureModal";
import { ChatState } from "../../Context/ChatProvider";
import { getSender } from "../../config/ChatLogics";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../Context/ThemeProvider";

function SideDrawer() {
  const { theme } = useTheme();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationMenuAnchorEl, setNotificationMenuAnchorEl] =
    useState(null);
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState(null);
  const [profilePictureModalOpen, setProfilePictureModalOpen] = useState(false);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search) {
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
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
      setLoadingChat(false);
      setDrawerOpen(false);
    } catch (error) {
      setLoadingChat(false);
    }
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationMenuAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationMenuAnchorEl(null);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleProfilePictureModalOpen = (event) => {
    event.stopPropagation();
    setProfilePictureModalOpen(true);
    handleProfileMenuClose();
  };

  const handleProfilePictureModalClose = () => {
    setProfilePictureModalOpen(false);
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        padding="5px 10px"
        borderWidth="5px"
        sx={{
          background: "rgba(15, 23, 42, 0.9)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        }}
        color={theme.palette.text.primary}
      >
        <Tooltip title="Search Users to chat" arrow>
          <Button
            variant="text"
            onClick={() => setDrawerOpen(true)}
            sx={{
              color: theme.palette.text.primary,
              "&:hover": {
                background: "rgba(99, 102, 241, 0.15)",
              },
            }}
          >
            <SearchIcon />
            <Typography display={{ xs: "none", md: "flex" }} paddingX={1}>
              Search User
            </Typography>
          </Button>
        </Tooltip>
        <Typography
          variant="h4"
          fontFamily="Work sans"
          sx={{
            fontSize: { xs: "24px", sm: "28px", md: "32px", lg: "36px" },
            textAlign: "center",
            background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #818cf8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          WhizChat
        </Typography>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <IconButton
            onClick={handleNotificationMenuOpen}
            sx={{
              color: theme.palette.primary.main,
              "&:hover": {
                background: "rgba(99, 102, 241, 0.15)",
              },
            }}
          >
            <Badge
              badgeContent={notification.length}
              color="error"
              overlap="circular"
              aria-label="notifications"
            >
              <NotificationsIcon
                sx={{
                  fontSize: { xs: "24px", sm: "28px", md: "32px", lg: "36px" },
                }}
              />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notificationMenuAnchorEl}
            open={Boolean(notificationMenuAnchorEl)}
            onClose={handleNotificationMenuClose}
          >
            {!notification.length && <MenuItem>No New Messages</MenuItem>}
            {notification.map((notif) => (
              <MenuItem
                key={notif._id}
                onClick={() => {
                  handleNotificationMenuClose();
                  setSelectedChat(notif.chat);
                  setNotification(notification.filter((n) => n !== notif));
                }}
              >
                {notif.chat.isGroupChat
                  ? `New Message in ${notif.chat.chatName}`
                  : `New Message from ${getSender(user, notif.chat.users)}`}
              </MenuItem>
            ))}
          </Menu>

          <IconButton
            onClick={handleProfilePictureModalOpen}
            sx={{
              "&:hover": {
                background: "rgba(99, 102, 241, 0.15)",
              },
            }}
          >
            <Avatar
              sx={{
                // mr: 1,
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
              {!user.pic || user.pic === "" ? user.name.charAt(0).toUpperCase() : ""}
            </Avatar>
          </IconButton>
          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{
              color: "white",
              "&:hover": {
                background: "rgba(99, 102, 241, 0.15)",
              },
            }}
          >
            <ExpandMoreIcon
              sx={{
                fontSize: { xs: "24px", sm: "28px", md: "32px", lg: "36px" },
              }}
            />
          </IconButton>
          <Menu
            anchorEl={profileMenuAnchorEl}
            open={Boolean(profileMenuAnchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={handleProfileMenuClose}>
              <ProfileModal user={user}>
                <span>My Profile</span>
              </ProfileModal>
            </MenuItem>
            <Divider />
            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
          </Menu>
        </div>
      </Box>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box
          padding={2}
          sx={{
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(10px)",
            minWidth: "300px",
            borderRight: "1px solid rgba(148, 163, 184, 0.2)",
            height:"stretch"
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
              sx={{
                marginRight: 1,
                color: theme.palette.text.primary,
                background: "rgba(30, 41, 59, 0.8)",
                padding: "0.5rem",
                borderRadius: "8px",
                border: "1px solid rgba(148, 163, 184, 0.25)",
                "&:hover": {
                  borderColor: "rgba(148, 163, 184, 0.35)",
                },
                "&:focus": {
                  outline: "none",
                  borderColor: "rgba(99, 102, 241, 0.5)",
                },
              }}
            />
            <Button variant="contained" onClick={handleSearch}>
              Go
            </Button>
          </Box>
          {loading ? (
            <ChatLoading />
          ) : (
            searchResult?.map((user) => (
              <UserListItem
                key={user._id}
                user={user}
                handleFunction={() => accessChat(user._id)}
              />
            ))
          )}
          {loadingChat && (
            <CircularProgress style={{ marginLeft: "auto", display: "flex" }} />
          )}
        </Box>
      </Drawer>
      <ProfilePictureModal
        open={profilePictureModalOpen}
        onClose={handleProfilePictureModalClose}
      />
    </>
  );
}

export default SideDrawer;
