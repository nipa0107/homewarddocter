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

          <Route path="/forgetpassword" element={<Reset />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
