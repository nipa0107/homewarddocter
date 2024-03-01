import React, { Component } from "react";
import "../css/styles.css";
import logo from "../img/logo.png";
import "../css/alladmin.css";
import "../css/profile.css";
import "../css/sidebar.css";
// สไตล์อยู่sidebar
export default class Reset extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
    };
    this.hanleSubmit = this.hanleSubmit.bind(this);
  }
  hanleSubmit(e) {
    e.preventDefault();
    const { email } = this.state;
    console.log(email);
    fetch("http://localhost:5000/forgot-passworddt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        email,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        alert(data.status);
      });
  }

  render() {
    return (
        <div className="homereset_content">
              <div className="logoreset">
          <img src={logo} className="logoreset" alt="logo"></img>
        </div>
        <div className="header1">ลืมรหัสผ่าน</div>
        <div className="formcontainerpf card mb-3">
      

        <form onSubmit={this.hanleSubmit}>
        <div className="header2">รีเซ็ทรหัสผ่านโดยใช้อีเมล</div>
          <div className="mb-3">
            {/* <label>กรอกอีเมลของคุณเพื่อเปลี่ยนรหัสผ่าน</label> */}
            <input
              type="email"
              className="form-control"
              placeholder="อีเมล"
              onChange={(e) => this.setState({ email: e.target.value })}
            />
          </div>

          <div className="d-grid">
            <button type="submit" className="btn btn-outline py-2">
            รีเซ็ทรหัสผ่าน
            </button>
            <br />
          </div>
        </form>
      </div>
      </div>
    );
  }
}
