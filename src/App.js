import React from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./components/login";
import Home from "./components/home";
import Reset from "./components/forgetpassword";
import Profile from "./components/profile";
import Updatepassword from "./components/updatepassword";
import UpdateProfile from "./components/updateprofile";
import Success from "./components/success";
import Assessment from "./components/Assessment";
import Assessmentuser from "./components/Assessmentuser";
import Assessmentuserone from "./components/Assessmentuserone";
import ChatComponent from "./components/Chat";

const PrivateRoute = ({ element, isLoggedIn }) => {
  return isLoggedIn === "true" ? (
    element
  ) : (
    <Navigate to="/" replace state={{ from: window.location.pathname }} />
  );
};

function App() {
  const isLoggedIn = window.localStorage.getItem("loggedIn");

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            exact
            path="/"
            element={isLoggedIn === "true" ? <Home /> : <Login />}
          />
          <Route
            path="/home"
            element={
              <PrivateRoute element={<Home />} isLoggedIn={isLoggedIn} />
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute element={<Profile />} isLoggedIn={isLoggedIn} />
            }
          />

          <Route
            path="/updatepassword"
            element={
              <PrivateRoute
                element={<Updatepassword />}
                isLoggedIn={isLoggedIn}
              />
            }
          />
          <Route
            path="/updateprofile"
            element={
              <PrivateRoute
                element={<UpdateProfile />}
                isLoggedIn={isLoggedIn}
              />
            }
          />

{/* การประเมิน */}
          <Route
            path="/assessment"
            element={
              <PrivateRoute
                element={<Assessment />}
                isLoggedIn={isLoggedIn}
              />
            }
          />
          <Route
            path="/assessmentuser"
            element={
              <PrivateRoute
                element={<Assessmentuser />}
                isLoggedIn={isLoggedIn}
              />
            }
          />
          <Route
            path="/assessmentuserone"
            element={
              <PrivateRoute
                element={<Assessmentuserone />}
                isLoggedIn={isLoggedIn}
              />
            }
          />
                  <Route
            path="/chat"
            element={
              <PrivateRoute
                element={<ChatComponent/>}
                isLoggedIn={isLoggedIn}
              />
            }
          />
          <Route path="/forgetpassword" element={<Reset />} />
          <Route path="/success" element={<Success />} />
        </Routes>
        
      </div>
    </Router>
    
  );
}


export default App;
