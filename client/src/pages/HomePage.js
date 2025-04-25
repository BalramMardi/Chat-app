import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Updated to useNavigate
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

function Homepage() {
  const navigate = useNavigate(); // Updated from useHistory
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) navigate("/chats"); // Updated to use navigate
  }, [navigate]);

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto">
      <div className="flex justify-center p-3 bg-white w-full mt-10 mb-4 rounded-lg border border-gray-300">
        <h1 className="text-4xl font-sans">WhizChat</h1>
      </div>
      <div className="bg-white w-full p-4 rounded-lg border border-gray-300">
        <div className="flex justify-center">
          <div className="w-full">
            <ul className="flex mb-4">
              <li className="flex-1 text-center">
                <button
                  className={`py-2 w-full transition-colors duration-200 ${
                    activeTab === "login"
                      ? "bg-blue-500 text-white font-semibold rounded-t-md"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("login")}
                >
                  Login
                </button>
              </li>
              <li className="flex-1 text-center">
                <button
                  className={`py-2 w-full transition-colors duration-200 ${
                    activeTab === "signup"
                      ? "bg-blue-500 text-white font-semibold rounded-t-md"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("signup")}
                >
                  Sign Up
                </button>
              </li>
            </ul>
            <div>{activeTab === "login" ? <Login /> : <Signup />}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
