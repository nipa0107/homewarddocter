import React, { useEffect, useState } from "react";

export default function Home({ }) {


  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./";
  };




  return (
          <div className="profile">
       
            <button onClick={logOut}>logout</button>
          </div>

  );
}
