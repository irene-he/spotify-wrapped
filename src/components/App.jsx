import React, { useState, useEffect } from "react";
import axios from "axios";
import { Login } from "./Login";
import { Wrapped } from "./wrapped/Wrapped";

export const App = () => {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken")
  );

  const fetchToken = async () => {
    const response = await axios.get("/accessToken");
    setAccessToken(response.data.accessToken);
    localStorage.setItem("accessToken", response.data.accessToken);
  };

  useEffect(() => {
    if (!accessToken) {
      fetchToken();
    }
  }, []);

  return (
    !accessToken ? <Login/> : <Wrapped accessToken={accessToken}/>
  );
};
