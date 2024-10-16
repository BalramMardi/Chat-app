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
        sx={{ marginRight: 2 }}
        size="small"
        alt={user.name}
        src={user.pic}
      />
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
