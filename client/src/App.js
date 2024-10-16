import "./App.css";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import { Toaster } from "react-hot-toast";
import { Box } from "@mui/material";
import { useTheme } from "./Context/ThemeProvider";

function App() {
  const { theme } = useTheme();
  return (
    <Box
      className="App"
      sx={{ backgroundColor: theme.palette.background.paper }}
    >
      <Toaster />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chats" element={<ChatPage />} />
      </Routes>
    </Box>
  );
}

export default App;
