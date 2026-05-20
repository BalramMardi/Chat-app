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
  Avatar,
  Typography,
  Alert,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Close,
  CheckCircle,
  CloudUpload,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [pic, setPic] = useState();
  const [picPreview, setPicPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);   // only for form submit
  const [uploadState, setUploadState] = useState("idle"); // idle | uploading | done | error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateName = (name) => {
    if (name.trim().length < 2) return "Name must be at least 2 characters long";
    if (name.trim().length > 50) return "Name must not exceed 50 characters";
    if (!/^[a-zA-Z\s]*$/.test(name)) return "Name can only contain letters and spaces";
    return "";
  };

  const validatePassword = (password) => {
    const errs = [];
    if (password.length < 8)          errs.push("At least 8 characters");
    if (!/[A-Z]/.test(password))      errs.push("One uppercase letter");
    if (!/[a-z]/.test(password))      errs.push("One lowercase letter");
    if (!/[0-9]/.test(password))      errs.push("One number");
    if (!/[!@#$%^&*]/.test(password)) errs.push("One special character (!@#$%^&*)");
    return errs;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else {
      const e = validateName(name);
      if (e) newErrors.name = e;
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else {
      const pe = validatePassword(password);
      if (pe.length > 0) newErrors.password = `Password must contain: ${pe.join(", ")}`;
    }
    if (!confirmpassword) {
      newErrors.confirmpassword = "Please confirm your password";
    } else if (password !== confirmpassword) {
      newErrors.confirmpassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const config = { headers: { "Content-type": "application/json" } };
      const { data } = await axios.post("/api/user", { name, email, password, pic }, config);
      toast.success("Registration Successful");
      localStorage.setItem("userInfo", JSON.stringify(data));
      setSubmitting(false);
      navigate("/chats");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error Occurred");
      setSubmitting(false);
    }
  };

  const postDetails = (pics) => {
    if (pics === undefined) {
      toast.error("Please select an image");
      return;
    }
    if (pics.type !== "image/jpeg" && pics.type !== "image/png") {
      toast.error("Please select a valid image (JPEG/PNG)");
      return;
    }
    if (pics.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Show local preview instantly
    const reader = new FileReader();
    reader.onloadend = () => setPicPreview(reader.result);
    reader.readAsDataURL(pics);

    // Upload with XHR so we get real progress events
    setUploadState("uploading");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", pics);
    formData.append("upload_preset", "chat-app");
    formData.append("cloud_name", "bmardi");

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(pct);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        setPic(data.url.toString());
        setUploadState("done");
        setUploadProgress(100);
        toast.success("Image uploaded successfully");
      } else {
        setUploadState("error");
        toast.error("Image upload failed");
      }
    });

    xhr.addEventListener("error", () => {
      setUploadState("error");
      toast.error("Image upload failed");
    });

    xhr.open("POST", "https://api.cloudinary.com/v1_1/bmardi/image/upload");
    xhr.send(formData);
  };

  const removeImage = () => {
    setPic(null);
    setPicPreview("");
    setUploadState("idle");
    setUploadProgress(0);
    toast.success("Image removed");
  };

  const isUploading = uploadState === "uploading";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>

      {/* ── Profile Image Section ── */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
          p: 2,
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          border: "1px solid rgba(99, 102, 241, 0.2)",
          borderRadius: 2,
          position: "relative",
        }}
      >
        {/* Avatar with spinner overlay while uploading */}
        <Box sx={{ position: "relative", display: "inline-flex" }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              border: uploadState === "done"
                ? "3px solid #4ade80"
                : "3px solid rgba(99, 102, 241, 0.5)",
              boxShadow: uploadState === "done"
                ? "0 0 20px rgba(74, 222, 128, 0.4)"
                : "0 0 20px rgba(99, 102, 241, 0.3)",
              backgroundColor: "rgba(99, 102, 241, 0.2)",
              fontSize: "3rem",
              transition: "border 0.4s ease, box-shadow 0.4s ease",
              filter: isUploading ? "brightness(0.5)" : "none",
            }}
            src={picPreview}
            alt="Profile Preview"
          >
            {!picPreview && "👤"}
          </Avatar>

          {/* Spinner overlay during upload */}
          {isUploading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress
                size={48}
                thickness={3}
                sx={{ color: "#a78bfa" }}
              />
            </Box>
          )}

          {/* Green tick when done */}
          {uploadState === "done" && (
            <CheckCircle
              sx={{
                position: "absolute",
                bottom: 4,
                right: 4,
                color: "#4ade80",
                backgroundColor: "#0f172a",
                borderRadius: "50%",
                fontSize: 28,
              }}
            />
          )}
        </Box>

        {/* ── Progress bar + status text ── */}
        {uploadState === "uploading" && (
          <Box sx={{ width: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: "#a5b4fc", display: "flex", alignItems: "center", gap: 0.5 }}>
                <CloudUpload sx={{ fontSize: 14 }} />
                Uploading image…
              </Typography>
              <Typography variant="caption" sx={{ color: "#a5b4fc", fontWeight: 600 }}>
                {uploadProgress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: "rgba(99, 102, 241, 0.15)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 3,
                  background: "linear-gradient(90deg, #6366f1, #a78bfa)",
                },
              }}
            />
          </Box>
        )}

        {uploadState === "done" && (
          <Typography
            variant="caption"
            sx={{ color: "#4ade80", display: "flex", alignItems: "center", gap: 0.5, fontWeight: 500 }}
          >
            <CheckCircle sx={{ fontSize: 14 }} />
            Image uploaded successfully
          </Typography>
        )}

        {uploadState === "error" && (
          <Typography variant="caption" sx={{ color: "#ef4444", fontWeight: 500 }}>
            Upload failed — please try again
          </Typography>
        )}

        {/* Buttons */}
        {picPreview && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              component="label"
              size="small"
              disabled={isUploading}
              sx={{ background: "linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)" }}
            >
              Change Image
              <input type="file" hidden accept="image/*" onChange={(e) => postDetails(e.target.files[0])} />
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Close />}
              onClick={removeImage}
              disabled={isUploading}
              sx={{
                borderColor: "rgba(239, 68, 68, 0.5)",
                color: "#ef4444",
                "&:hover": { borderColor: "#ef4444", backgroundColor: "rgba(239, 68, 68, 0.1)" },
              }}
            >
              Remove
            </Button>
          </Box>
        )}

        {!picPreview && (
          <Button
            variant="contained"
            component="label"
            disabled={isUploading}
            sx={{ background: "linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)" }}
          >
            Upload Image
            <input type="file" hidden accept="image/*" onChange={(e) => postDetails(e.target.files[0])} />
          </Button>
        )}

        <Typography variant="caption" sx={{ color: "#cbd5e1", textAlign: "center", fontSize: "0.75rem" }}>
          Accepted formats: JPEG, PNG (Max 5MB)
        </Typography>
      </Box>

      {/* ── Name ── */}
      <Box>
        <FormControl fullWidth variant="outlined" required className="input-wrapper" error={!!errors.name}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => { setName(e.target.value); if (errors.name) setErrors({ ...errors, name: "" }); }}
            placeholder="Enter Your Name"
            error={!!errors.name}
            helperText={errors.name}
          />
        </FormControl>
      </Box>

      {/* ── Email ── */}
      <Box>
        <FormControl fullWidth variant="outlined" required className="input-wrapper" error={!!errors.email}>
          <TextField
            label="Email Address"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: "" }); }}
            type="email"
            placeholder="Enter Your Email Address"
            error={!!errors.email}
            helperText={errors.email}
          />
        </FormControl>
      </Box>

      {/* ── Password ── */}
      <Box>
        <FormControl fullWidth variant="outlined" required className="input-wrapper" error={!!errors.password}>
          <InputLabel>Password</InputLabel>
          <OutlinedInput
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: "" }); }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={handleClickShowPassword} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
            placeholder="Enter Password"
            error={!!errors.password}
          />
        </FormControl>
        {errors.password && (
          <Typography variant="caption" sx={{ color: "#ef4444", display: "block", mt: 0.5, ml: 1 }}>
            {errors.password}
          </Typography>
        )}
      </Box>

      {/* ── Confirm Password ── */}
      <Box>
        <FormControl fullWidth variant="outlined" required className="input-wrapper" error={!!errors.confirmpassword}>
          <InputLabel>Confirm Password</InputLabel>
          <OutlinedInput
            type={showConfirmPassword ? "text" : "password"}
            value={confirmpassword}
            onChange={(e) => { setConfirmpassword(e.target.value); if (errors.confirmpassword) setErrors({ ...errors, confirmpassword: "" }); }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={handleClickShowConfirmPassword} edge="end">
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Confirm Password"
            placeholder="Confirm Password"
            error={!!errors.confirmpassword}
          />
        </FormControl>
        {errors.confirmpassword && (
          <Typography variant="caption" sx={{ color: "#ef4444", display: "block", mt: 0.5, ml: 1 }}>
            {errors.confirmpassword}
          </Typography>
        )}
      </Box>

      {/* ── Password Requirements ── */}
      {password && validatePassword(password).length > 0 && (
        <Alert
          severity="info"
          sx={{
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            color: "#e0e7ff",
            "& .MuiAlert-icon": { color: "#a5b4fc" },
          }}
        >
          <Typography variant="caption">
            Password Requirements:
            <ul style={{ margin: "0.5rem 0 0 0", paddingLeft: "1.5rem" }}>
              {[
                ["At least 8 characters",              password.length >= 8],
                ["One uppercase letter",               /[A-Z]/.test(password)],
                ["One lowercase letter",               /[a-z]/.test(password)],
                ["One number",                         /[0-9]/.test(password)],
                ["One special character (!@#$%^&*)",   /[!@#$%^&*]/.test(password)],
              ].map(([label, met]) => (
                <li key={label} style={{ textDecoration: met ? "line-through" : "none" }}>
                  {label}
                </li>
              ))}
            </ul>
          </Typography>
        </Alert>
      )}

      {/* ── Submit ── */}
      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={submitHandler}
        disabled={submitting || isUploading}
        className="submit-button"
      >
        {submitting ? "Creating Account…" : isUploading ? "Please wait for upload…" : "Sign Up"}
      </Button>
    </Box>
  );
};

export default Signup;