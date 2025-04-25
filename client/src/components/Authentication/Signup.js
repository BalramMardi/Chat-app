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
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [pic, setPic] = useState();
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const submitHandler = async () => {
    setLoading(true);
    if (!name || !email || !password || !confirmpassword) {
      toast.error("Please fill all the fields");
      setLoading(false);
      return;
    }
    if (password !== confirmpassword) {
      toast.error("Passwords do not match");
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
        "/api/user",
        { name, email, password, pic },
        config
      );

      toast.success("Registration Successful");
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error Occurred");
      setLoading(false);
    }
  };

  const postDetails = (pics) => {
    setLoading(true);
    if (pics === undefined) {
      toast.error("Please select an image");
      setLoading(false);
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "bmardi");
      fetch("https://api.cloudinary.com/v1_1/bmardi/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          setLoading(false);
        })
        .catch((err) => {
          toast.error("Image upload failed");
          setLoading(false);
        });
    } else {
      toast.error("Please select a valid image (JPEG/PNG)");
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}
    >
      <FormControl fullWidth variant="outlined" required>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter Your Name"
        />
      </FormControl>
      <FormControl fullWidth variant="outlined" required>
        <TextField
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Enter Your Email Address"
        />
      </FormControl>
      <FormControl fullWidth variant="outlined" required>
        <InputLabel>Password</InputLabel>
        <OutlinedInput
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
          label="Password"
          placeholder="Enter Password"
        />
      </FormControl>
      <FormControl fullWidth variant="outlined" required>
        <InputLabel>Confirm Password</InputLabel>
        <OutlinedInput
          type={showPassword ? "text" : "password"}
          value={confirmpassword}
          onChange={(e) => setConfirmpassword(e.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={handleClickShowPassword} edge="end">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
          label="Confirm Password"
          placeholder="Confirm Password"
        />
      </FormControl>
      <FormControl fullWidth variant="outlined">
        <Button variant="contained" component="label">
          Upload Image
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => postDetails(e.target.files[0])}
          />
        </Button>
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={submitHandler}
        disabled={loading}
      >
        {loading ? "Loading..." : "Sign Up"}
      </Button>
    </Box>
  );
};

export default Signup;
