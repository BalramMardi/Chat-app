import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import "../components/Authentication/Authentication.css";

function Homepage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) navigate("/chats");
  }, [navigate]);

  useEffect(() => {
    const generateStars = () => {
      const starArray = [];
      for (let i = 0; i < 100; i++) {
        starArray.push({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: Math.random() * 2 + 0.5,
          duration: Math.random() * 2 + 2,
          delay: Math.random() * 5,
        });
      }
      setStars(starArray);
    };
    generateStars();
  }, []);

  return (
    <>
      {/* Fixed background layer: gradient + aurora + stars — never scrolls */}
      <div className="auth-container">
        {stars.map((star) => (
          <div
            key={star.id}
            className="stars"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Scrollable layer: sits on top of background, holds the card */}
      <div className="auth-scroll-layer">
        <div className="auth-wrapper card-border-glow">
          <h1 className="gradient-heading">WhizChat</h1>
          <p className="gradient-subheading">Connect • Chat • Collaborate</p>

          <div className="glass-panel">
            <div className="nav-tabs-container">
              <button
                className={`nav-tab-button ${activeTab === "login" ? "active" : ""}`}
                onClick={() => setActiveTab("login")}
              >
                Login
              </button>
              <button
                className={`nav-tab-button ${activeTab === "signup" ? "active" : ""}`}
                onClick={() => setActiveTab("signup")}
              >
                Sign Up
              </button>
            </div>

            <div className="form-container">
              {activeTab === "login" ? <Login /> : <Signup />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Homepage;