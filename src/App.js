import React from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import AssessinhomesssForm from "./components/AssessinhomesssForm";


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
import Chat from "./components/chat/Chat";
import Allpatient from "./components/allpatient";
import Infopatient from "./components/infopatient";
import Updatepatient from "./components/updatepatient";
import Updatemedicalinformation from "./components/updatemedicalinformation";
import Addequippatient from "./components/addequippatient";
import Assessment from "./components/Assessment";
import Assessmentuser from "./components/Assessmentuser";
import Assessmentuserone from "./components/Assessmentuserone";
import Assessreadiness from "./components/Assessreadiness";
import Assessreadiness1 from "./components/Assessrdnpage1";
import DetailAssessreadiness from "./components/detailassessrdn";
import Assessinhomesss from "./components/Assessinhomesss";
import Assessinhomesssuser from "./components/Assessinhomesssuser";
import Assessreadinessuser from "./components/Assessreadinessuser";
import MultiStepForm from "./components/MultiStepForm";
import DetailAssessinhomesss from "./components/DetailAssessinhomeForm";
import DetailAgenda from "./components/DetailAgendaForm";
import Abnormalcase from "./components/Abnormalcase"
// import Immobility from "./components/Immobility";

import Emailverification from "./components/email-verification";
import VerifyOtp from "./components/VerifyOtp";
import UpdateEmail from "./components/updateemail";
import UpdateOTP from "./components/updateotp";
import AgendaForm from "./components/AgendaForm";
import UpdateCaregiver from "./components/updatecaregiver";
import AddCaregiver from "./components/addcaregiver";
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
            path="/chat"
            element={
              <PrivateRoute element={<Chat />} isLoggedIn={isLoggedIn} />
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
          <Route
            path="/allpatient"
            element={
              <PrivateRoute
                element={<Allpatient />}
                isLoggedIn={isLoggedIn}
              />
            }
          />
          <Route
            path="/infopatient"
            element={
              <PrivateRoute
                element={<Infopatient />}
                isLoggedIn={isLoggedIn}
              />
            }
          />
          <Route
            path="/updatepatient"
            element={
              <PrivateRoute
                element={<Updatepatient />}
                isLoggedIn={isLoggedIn}
              />
            }
          />
          <Route
            path="/updatemedicalinformation"
            element={
              <PrivateRoute
                element={<Updatemedicalinformation />}
                isLoggedIn={isLoggedIn}
              />
            }
          />
          <Route
            path="/addequippatient"
            element={
              <PrivateRoute
                element={<Addequippatient />}
                isLoggedIn={isLoggedIn}
              />
            }
          />
          <Route
            path="/assessinhomesssform"
            element={
              <PrivateRoute
                element={<AssessinhomesssForm />}
                isLoggedIn={isLoggedIn}
              />
            }
          />
          <Route
            path="/agendaform"
            element={
              <PrivateRoute
                element={<AgendaForm />}
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
            path="/assessreadiness"
            element={
              <PrivateRoute
                element={<Assessreadiness />}
                isLoggedIn={isLoggedIn}
              />
            }
          />
          <Route
            path="/assessreadinessuser"
            element={
              <PrivateRoute
                element={<Assessreadinessuser />}
                isLoggedIn={isLoggedIn}
              />
            }
          />
          <Route
            path="/detailassessreadiness"
            element={
              <PrivateRoute
                element={<DetailAssessreadiness />}
                isLoggedIn={isLoggedIn}
              />
            }
          />
          <Route
            path="/assessreadinesspage1"
            element={
              <PrivateRoute
                element={<Assessreadiness1 />}
                isLoggedIn={isLoggedIn}
              />
            }
          />
          <Route
            path="/assessinhomesss"
            element={
              <PrivateRoute
                element={<Assessinhomesss />}
                isLoggedIn={isLoggedIn}
              />
            }
          />
          <Route
            path="/assessinhomesssuser"
            element={
              <PrivateRoute
                element={<Assessinhomesssuser />}
                isLoggedIn={isLoggedIn}
              />
            }
          />
          <Route
            path="/abnormalcase"
            element={
              <PrivateRoute
                element={<Abnormalcase />}
                isLoggedIn={isLoggedIn}
              />
            }
          />
          <Route
            path="/MultiStepForm"
            element={
              <PrivateRoute
                element={<MultiStepForm />}
                isLoggedIn={isLoggedIn}
              />
            }
          />
          <Route
            path="/detailAssessinhomeForm"
            element={
              <PrivateRoute
                element={<DetailAssessinhomesss />}
                isLoggedIn={isLoggedIn}
              />
            }
          />
          <Route
            path="/detailAgendaForm"
            element={
              <PrivateRoute
                element={<DetailAgenda />}
                isLoggedIn={isLoggedIn}
              />
            }
          />

          <Route
            path="/emailverification"
            element={
              <PrivateRoute element={<Emailverification />} isLoggedIn={isLoggedIn} />
            }
          />
          <Route
            path="/verifyotp"
            element={
              <PrivateRoute element={<VerifyOtp />} isLoggedIn={isLoggedIn} />
            }
          />

          <Route
            path="/updateemail"
            element={
              <PrivateRoute element={<UpdateEmail />} isLoggedIn={isLoggedIn} />
            }
          />
          <Route
            path="/updateotp"
            element={
              <PrivateRoute element={<UpdateOTP />} isLoggedIn={isLoggedIn} />
            }
          />
                 <Route
            path="/updatecaregiver"
            element={
              <PrivateRoute element={<UpdateCaregiver />} isLoggedIn={isLoggedIn} />
            }
          />
            <Route
            path="/addcaregiver"
            element={
              <PrivateRoute
                element={<AddCaregiver />}
                isLoggedIn={isLoggedIn}
              />
            }
          />
          {/* <Route
            path="/immobility"
            element={
              <PrivateRoute
                element={<Immobility />}
                isLoggedIn={isLoggedIn}
              />
            }
          /> */}
          <Route path="/forgetpassword" element={<Reset />} />
          <Route path="/success" element={<Success />} />
        </Routes>

      </div>
    </Router>

  );
}


export default App;
