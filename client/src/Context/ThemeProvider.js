import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createTheme } from "@mui/material/styles";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(
    localStorage.getItem("themeMode") || "light"
  );

  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                // Light mode colors
                primary: {
                  main: "#1976d2",
                },
                secondary: {
                  main: "#dc004e",
                },
                background: {
                  default: "#e0e0e0",
                  paper: "#f2f2f2",

                  tabs: "#f3f3f3",
                  extra: {
                    default: "#f5f5f5", // Default shade of extra
                    100: "#fafafa", // Lightest shade
                    200: "#eeeeee", // Slightly darker
                    300: "#e0e0e0", // Darker
                    400: "#bdbdbd", // Much darker
                  },
                },
                text: {
                  primary: "#000000",
                  secondary: "#555555",
                },
              }
            : {
                // Dark mode colors
                primary: {
                  main: "#2478d4",
                },
                secondary: {
                  main: "#f48fb1",
                },
                background: {
                  default: "#313239",
                  paper: "#121212",
                  // extra: "#2a2d30",
                  tabs: "#35373c",
                  extra: {
                    default: "#2a2d30", // Default shade of extra
                    100: "#808487", // Lightest shade
                    200: "#6c6f73", // Slightly darker
                    300: "#4c4f53", // Darker
                    400: "#2a2d30", // Much darker
                  },
                },
                text: {
                  primary: "#ffffff",
                  secondary: "#cccccc",
                },
                black: {
                  main: "#000000", // Define the main black color
                  100: "#f5f5f5", // Light gray
                  200: "#aaaaaa", // Gray
                  300: "#555555", // Dark gray
                },
              }),
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: "8px",
                padding: "10px 20px",
                textTransform: "none",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                padding: "16px",
                borderRadius: "8px",
              },
            },
          },
        },
      }),
    [mode]
  );

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
