import React from "react";
import image from "../public/record-player.gif";
import { Button } from "./Button";

export const Login = () => {
  const redirect = () => {
    window.location.href = "http://localhost:5000/login";
  };

  return (
    <div
      className="login"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
        backgroundColor: "#ddb2ba",
      }}
    >
      <h1> Monthly Spotify Wrapped </h1>
      <span style={{fontWeight: 'bold'}}> It's like Spotify Wrapped but for your monthly stats :) </span>

      <img src={image} alt="record-player" />

      <Button onClick={redirect} text={"Login"} />
    </div>
  );
};
