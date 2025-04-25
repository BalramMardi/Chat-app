import { useState } from "react";
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  IconButton,
  InputAdornment,
  Box,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { ChatState } from "../../Context/ChatProvider";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = ChatState();

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast.error("Please fill all the fields");
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      toast.success("Login Successful");
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      toast.error(error.response.data.message || "Error Occurred");
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}
    >
      <FormControl variant="outlined" fullWidth required>
        <TextField
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Enter Your Email Address"
        />
      </FormControl>
      <FormControl variant="outlined" fullWidth required>
        <InputLabel>Password</InputLabel>
        <OutlinedInput
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={handleClickShowPassword} edge="end">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
          placeholder="Enter password"
        />
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={submitHandler}
        disabled={loading}
      >
        {loading ? "Loading..." : "Login"}
      </Button>
    </Box>
  );
};

export default Login;
