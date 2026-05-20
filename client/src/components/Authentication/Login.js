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
  Typography,
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
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const { setUser } = ChatState();

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

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
      toast.error(error.response?.data?.message || "Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}
    >
      <Box>
        <FormControl
          variant="outlined"
          fullWidth
          required
          className="input-wrapper"
          error={!!errors.email}
        >
          <TextField
            label="Email Address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) {
                setErrors({ ...errors, email: "" });
              }
            }}
            type="email"
            placeholder="Enter Your Email Address"
            error={!!errors.email}
            helperText={errors.email}
          />
        </FormControl>
      </Box>

      <Box>
        <FormControl
          variant="outlined"
          fullWidth
          required
          className="input-wrapper"
          error={!!errors.password}
        >
          <InputLabel>Password</InputLabel>
          <OutlinedInput
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) {
                setErrors({ ...errors, password: "" });
              }
            }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={handleClickShowPassword} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            placeholder="Enter password"
            error={!!errors.password}
          />
        </FormControl>
        {errors.password && (
          <Typography
            variant="caption"
            sx={{
              color: "#ef4444",
              display: "block",
              mt: 0.5,
              ml: 1,
            }}
          >
            {errors.password}
          </Typography>
        )}
      </Box>

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={submitHandler}
        disabled={loading}
        className="submit-button"
      >
        {loading ? "Loading..." : "Login"}
      </Button>
    </Box>
  );
};

export default Login;
