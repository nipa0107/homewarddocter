import React, { Component } from "react";
import "../css/styles.css";
import logo from "../img/logo.png";

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const { username, password } = this.state;
    console.log(username, password);
    fetch("http://localhost:5000/loginmpersonnel", {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",

        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        username,
        password,
        errorMessage: "", // เพิ่ม state เก็บข้อความผิดพลาด
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "userLogin");
        if (data.status === "ok") {
          // เก็บข้อมูลเข้าสู่ระบบไว้
          window.localStorage.setItem("token", data.data);
          window.localStorage.setItem("loggedIn", true);
          window.location.href = "./home";
        }  else {
            //ถ้าเข้าสู่ระบบไม่สำเร็จ
            this.setState({
              errorMessage: "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
            });
        }
      });
  }

  render() {
    return (
      <div className="logincontainer">
        <div className="formcontainer">
          <div className="left">
            <h1>Welcome</h1>
            <h5 style={{ color: 'white' }}>Docter</h5>
          </div>
          <div className="right">
            <form onSubmit={this.handleSubmit}>
              <div className="logologin">
                <img src={logo} className="logologin" alt="logo"></img>
              </div>

              <div className="mb-3">
                {/* <label>Username</label> */}
                <input
                  type="username"
                  className="form-control"
                  placeholder="ชื่อผู้ใช้"
                  onChange={(e) => this.setState({ username: e.target.value })}
                />
              </div>

              <div className="mb-3">
                {/* <label>Password</label> */}
                <input
                  type="password"
                  className="form-control"
                  placeholder="รหัสผ่าน"
                  onChange={(e) => this.setState({ password: e.target.value })}
                />
              </div>

              {/* <div className="mb-3">
          <div className="custom-control custom-checkbox">
            <input
              type="checkbox"
              className="custom-control-input"
              id="customCheck1"
            />
            <label className="custom-control-label" htmlFor="customCheck1">
              Remember me
            </label>
          </div>
        </div> */}
                  {/* แสดงข้อความผิดพลาด */}
              <p id="errormessage" className="errormessage">
                {this.state.errorMessage}
              </p>
              

              <p className="forgot-password">
                <a href="/forgetpassword">ลืมรหัสผ่าน ?</a>
              </p>
              
              <div className="d-grid homesubmit">
                <button type="submit" className="btn btnlogin">
                  เข้าสู่ระบบ
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
