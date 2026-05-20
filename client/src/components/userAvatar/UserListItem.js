import { Avatar, Box, Typography } from "@mui/material";

const UserListItem = ({ user, handleFunction }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "white",
        color: "black",
        paddingX: 3,
        paddingY: 2,
        marginBottom: 2,
        borderRadius: "8px",
        cursor: "pointer",
      }}
      onClick={handleFunction}
    >
      <Avatar
        sx={{ marginRight: 2, backgroundColor: "rgba(99, 102, 241, 0.3)" }}
        size="small"
        alt={user.name}
        src={user.pic}
      >
        {!user.pic || user.pic === "" ? user.name.charAt(0).toUpperCase() : ""}
      </Avatar>
      <Box>
        <Typography variant="body1">{user.name}</Typography>
        <Typography variant="caption">
          <strong>Email: </strong>
          {user.email}
        </Typography>
      </Box>
    </Box>
  );
};

export default UserListItem;
