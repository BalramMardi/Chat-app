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
  Switch, // Import Switch here
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "../userAvatar/UserListItem";
import ProfileModal from "./ProfileModal";
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
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState(null); // State for profile menu

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
    // Destructure the toggleTheme function
  } = ChatState(); // Get toggleTheme from context

  const { toggleTheme } = useTheme();

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

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bgcolor="white"
        width="100%"
        padding="5px 10px"
        borderWidth="5px"
        sx={{ backgroundColor: theme.palette.background.extra[400] }}
        color={theme.palette.text.primary}
      >
        <Tooltip title="Search Users to chat" arrow>
          <Button variant="text" onClick={() => setDrawerOpen(true)}>
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
          }}
        >
          WhizChat
        </Typography>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Switch
            onChange={toggleTheme}
            color="primary"
            inputProps={{ "aria-label": "Toggle Theme" }}
          />
          <IconButton onClick={handleNotificationMenuOpen}>
            <Badge
              badgeContent={notification.length}
              color="error"
              overlap="circular"
              aria-label="notifications"
            >
              <NotificationsIcon
                sx={{
                  fontSize: { xs: "24px", sm: "28px", md: "32px", lg: "36px" }, // Responsive font sizes
                }}
                color="primary"
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

          <IconButton onClick={handleProfileMenuOpen}>
            <Avatar
              sx={{
                mr: 1,
                cursor: "pointer",
                width: { xs: "24px", sm: "28px", md: "32px", lg: "36px" }, // Responsive width
                height: { xs: "24px", sm: "28px", md: "32px", lg: "36px" }, // Responsive height
              }}
              src={user.pic}
              alt={user.name}
            />
            <ExpandMoreIcon
              sx={{
                fontSize: { xs: "24px", sm: "28px", md: "32px", lg: "36px" }, // Responsive font sizes
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
        <Box padding={2}>
          <Typography variant="h6">Search Users</Typography>
          <Box display="flex" paddingBottom={2}>
            <Input
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ marginRight: 1 }}
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
    </>
  );
}

export default SideDrawer;
