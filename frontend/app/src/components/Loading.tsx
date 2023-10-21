import React from "react";
import "./Loading.css";
const Loading = () => {
  return (
    <div className="w-[60%] h-[100vh]  flex justify-center align-middle bg-white">
      <div className="three-body absolute top-[50%]">
        <div className="three-body__dot"></div>
        <div className="three-body__dot"></div>
        <div className="three-body__dot"></div>
      </div>
    </div>
  );
};

export default Loading;
