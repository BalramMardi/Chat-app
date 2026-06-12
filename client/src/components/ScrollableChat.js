import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

import DoneIcon from "@mui/icons-material/Done";        
import DoneAllIcon from "@mui/icons-material/DoneAll";  

const MessageStatus = ({ message, currentUserId, chatUsers }) => {
  if (!message.sender || message.sender._id !== currentUserId) return null;

  const totalRecipients = chatUsers.filter(
    (u) => (u._id?.toString() || u.toString()) !== currentUserId  
  ).length;

  const readCount = (message.readBy || []).filter(
    (id) => (id?._id?.toString() || id?.toString()) !== currentUserId 
  ).length;

  if (readCount >= totalRecipients && totalRecipients > 0) {
    return <DoneAllIcon sx={{ fontSize: 14, color: "#60a5fa", ml: 0.5 }} />;
  }

  if (message._id) {
    return <DoneAllIcon sx={{ fontSize: 14, color: "#94a3b8", ml: 0.5 }} />;
  }

  return <DoneIcon sx={{ fontSize: 14, color: "#94a3b8", ml: 0.5 }} />;
};


const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <Tooltip title={m.sender.name} placement="bottom-start" arrow>
                <Avatar
                  sx={{
                    mt: "7px",
                    mr: 1,
                    cursor: "pointer",
                    backgroundColor: "rgba(99, 102, 241, 0.3)",
                  }}
                  alt={m.sender.name}
                  src={m.sender.pic}
                >
                  {!m.sender.pic || m.sender.pic === ""
                    ? m.sender.name.charAt(0).toUpperCase()
                    : ""}
                </Avatar>
              </Tooltip>
            )}
            <span
              style={{
                background: m.sender._id === user._id
                  ? "linear-gradient(135deg, rgba(99, 102, 241, 0.4) 0%, rgba(99, 102, 241, 0.2) 100%)"
                  : "linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0.2) 100%)",
                border: m.sender._id === user._id
                  ? "1px solid rgba(99, 102, 241, 0.5)"
                  : "1px solid rgba(139, 92, 246, 0.5)",
                color: "#e2e8f0",
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                borderRadius: "18px",
                padding: "8px 12px",
                maxWidth: "75%",
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {m.content}
               <MessageStatus
                  message={m}
                  currentUserId={user._id}
                  chatUsers={m.chat.users}
                />
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
