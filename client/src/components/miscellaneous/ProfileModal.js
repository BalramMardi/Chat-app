import React from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Avatar,
} from "@mui/material";
import { useTheme } from "../../Context/ThemeProvider";

const ProfileModal = ({ user, children }) => {
  const { theme } = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleOpen = (event) => {
    event.stopPropagation();
    setOpen(true);
  };

  const handleClose = (event) => {
    event.stopPropagation();
    setOpen(false);
  };

  return (
    <>
      {children ? (
        <span onClick={handleOpen}>{children}</span>
      ) : (
        <IconButton onClick={handleOpen}>
          <Avatar
            sx={{ width: 50, height: 50 }}
            src={user.pic}
            alt={user.name}
          />
        </IconButton>
      )}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xl"
        sx={{
          "& .MuiDialog-paper": {
            width: "600px",
            height: "auto",
            maxHeight: "80vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontSize: "40px",
            fontFamily: "Work Sans",
          }}
        >
          {user.name}
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar
            sx={{ width: 150, height: 150, mb: 2 }}
            src={user.pic}
            alt={user.name}
          />
          <Typography variant="h5" sx={{ fontFamily: "Work Sans" }}>
            Email: {user.email}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfileModal;
