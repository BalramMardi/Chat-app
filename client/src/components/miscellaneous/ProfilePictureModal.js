import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Avatar,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useTheme } from "../../Context/ThemeProvider";
import { ChatState } from "../../Context/ChatProvider";
import axios from "axios";
import toast from "react-hot-toast";

const ProfilePictureModal = ({ open, onClose }) => {
  const { theme } = useTheme();
  const { user, setUser } = ChatState();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(user?.pic || "");
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      toast.error("Please select a JPEG or PNG image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "chat-app");
    data.append("cloud_name", "bmardi");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/bmardi/image/upload",
        {
          method: "post",
          body: data,
        }
      );
      const result = await response.json();
      return result.url;
    } catch (error) {
      throw new Error("Failed to upload image");
    }
  };

  const handleSave = async () => {
    if (!selectedFile && preview === user?.pic) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      let picUrl = preview;

      if (selectedFile) {
        picUrl = await uploadToCloudinary(selectedFile);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        `/api/user/${user._id}`,
        { pic: picUrl },
        config
      );

      const updatedUser = { ...user, pic: data.pic };
      setUser(updatedUser);
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));

      toast.success("Profile picture updated successfully");
      setSelectedFile(null);
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update profile picture"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        `/api/user/${user._id}`,
        { pic: "" },
        config
      );

      const updatedUser = { ...user, pic: data.pic };
      setUser(updatedUser);
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));

      toast.success("Profile picture removed");
      setSelectedFile(null);
      setPreview("");
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to remove profile picture"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(user?.pic || "");
    onClose();
  };

  const getInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : "?";
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(10px)",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: "24px",
          fontFamily: "Work Sans",
          color: theme.palette.text.primary,
          textAlign: "center",
        }}
      >
        Update Profile Picture
      </DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          py: 3,
        }}
      >
        {preview && preview !== "" ? (
          <Avatar
            src={preview}
            alt={user?.name}
            sx={{
              width: 150,
              height: 150,
              border: `3px solid rgba(99, 102, 241, 0.5)`,
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)",
            }}
          />
        ) : (
          <Avatar
            sx={{
              width: 150,
              height: 150,
              backgroundColor: "rgba(99, 102, 241, 0.3)",
              fontSize: "4rem",
              color: theme.palette.primary.main,
              border: `3px solid rgba(99, 102, 241, 0.5)`,
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)",
            }}
          >
            {getInitial()}
          </Avatar>
        )}

        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            textAlign: "center",
            maxWidth: "300px",
          }}
        >
          {preview && preview !== ""
            ? "This is your new profile picture"
            : "First letter of your name will be shown"}
        </Typography>

        <Button
          variant="contained"
          component="label"
          disabled={loading}
          sx={{
            background: "linear-gradient(135deg, #60a5fa 0%, #818cf8 100%)",
            color: "white",
            textTransform: "none",
          }}
        >
          {loading ? <CircularProgress size={24} /> : "Select Image"}
          <input
            hidden
            accept="image/jpeg,image/png"
            type="file"
            onChange={handleFileSelect}
            disabled={loading}
          />
        </Button>

        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            textAlign: "center",
          }}
        >
          JPEG or PNG, max 5MB
        </Typography>
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          gap: 1,
          justifyContent: "center",
          pb: 2,
        }}
      >
        <Button
          onClick={handleCancel}
          disabled={loading}
          sx={{
            color: theme.palette.text.primary,
            border: `1px solid rgba(148, 163, 184, 0.3)`,
          }}
        >
          Cancel
        </Button>
        {user?.pic && user?.pic !== "" && (
          <Button
            onClick={handleRemove}
            disabled={loading}
            sx={{
              color: "#ef4444",
              border: "1px solid #ef4444",
            }}
          >
            Remove
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={loading || !selectedFile}
          variant="contained"
          sx={{
            background: "linear-gradient(135deg, #60a5fa 0%, #818cf8 100%)",
            color: "white",
          }}
        >
          {loading ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfilePictureModal;