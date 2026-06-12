import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createTheme } from "@mui/material/styles";

import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";


const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState("dark");

  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "dark",
          primary: {
            main: "#6366f1",
            light: "#818cf8",
            dark: "#4f46e5",
          },
          secondary: {
            main: "#a78bfa",
            light: "#c4b5fd",
            dark: "#9333ea",
          },
          background: {
            default: "#0a0e27",
            paper: "#0f172a",
            tabs: "#1e293b",
            extra: {
              default: "#1e293b",
              100: "#334155",
              200: "#475569",
              300: "#64748b",
              400: "#cbd5e1",
            },
          },
          text: {
            primary: "#e2e8f0",
            secondary: "#cbd5e1",
          },
          divider: "rgba(148, 163, 184, 0.12)",
          action: {
            hover: "rgba(99, 102, 241, 0.08)",
            selected: "rgba(99, 102, 241, 0.12)",
            disabled: "rgba(226, 232, 240, 0.38)",
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: "10px",
                padding: "10px 20px",
                textTransform: "none",
                fontWeight: 600,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 0 30px rgba(99, 102, 241, 0.4)",
                },
              },
              contained: {
                background: "linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 0 20px rgba(99, 102, 241, 0.2)",
                "&:hover": {
                  background: "linear-gradient(135deg, #818cf8 0%, #c4b5fd 100%)",
                  boxShadow: "0 0 30px rgba(99, 102, 241, 0.4)",
                },
              },
              outlined: {
                borderColor: "rgba(99, 102, 241, 0.4)",
                color: "#a5b4fc",
                "&:hover": {
                  background: "rgba(99, 102, 241, 0.15)",
                  borderColor: "rgba(99, 102, 241, 0.6)",
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                padding: "16px",
                borderRadius: "12px",
                background: "rgba(15, 23, 42, 0.8)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                "&:hover": {
                  background: "rgba(15, 23, 42, 0.85)",
                  borderColor: "rgba(148, 163, 184, 0.3)",
                  boxShadow: "0 8px 40px rgba(99, 102, 241, 0.15)",
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-root": {
                  color: "#e2e8f0",
                  background: "rgba(30, 41, 59, 0.8)",
                  borderRadius: "10px",
                  "& fieldset": {
                    borderColor: "rgba(148, 163, 184, 0.25)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(148, 163, 184, 0.35)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(99, 102, 241, 0.5)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#cbd5e1",
                  "&.Mui-focused": {
                    color: "#a5b4fc",
                  },
                },
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                background: "rgba(15, 23, 42, 0.8)",
                backdropFilter: "blur(10px)",
                borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                background: "rgba(15, 23, 42, 0.95)",
                backdropFilter: "blur(10px)",
                borderRight: "1px solid rgba(148, 163, 184, 0.2)",
              },
            },
          },
          MuiList: {
            styleOverrides: {
              root: {
                background: "transparent",
              },
            },
          },
          MuiListItem: {
            styleOverrides: {
              root: {
                borderRadius: "10px",
                margin: "0.5rem 0",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "rgba(99, 102, 241, 0.15)",
                },
              },
            },
          },
          MuiModal: {
            styleOverrides: {
              backdrop: {
                backdropFilter: "blur(4px)",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
              },
            },
          },
          MuiMenu: {
            styleOverrides: {
              paper: {
                background: "rgba(15, 23, 42, 0.95)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
              },
            },
          },
        },
      }),
    []
  );

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
   <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <MuiThemeProvider theme={theme}> 
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
