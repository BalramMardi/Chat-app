import { Badge, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <Badge
      badgeContent={
        admin === user._id ? (
          <Typography variant="caption" color="textSecondary">
            (Admin)
          </Typography>
        ) : null
      }
      sx={{
        margin: 1,
        marginBottom: 2,
        padding: 1,
        borderRadius: "8px",
        backgroundColor: "purple",
        color: "white",
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
      }}
      onClick={handleFunction}
    >
      <Typography variant="body2">{user.name}</Typography>
      <IconButton size="small" onClick={handleFunction}>
        <CloseIcon fontSize="small" sx={{ paddingLeft: 0.5 }} />
      </IconButton>
    </Badge>
  );
};

export default UserBadgeItem;
