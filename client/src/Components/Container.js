import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Response from "./Response";

const Container = () => {
  // Functional container component that holds other component data
  const [endpoint, setEndpoint] = useState("movies");
  const [data, setData] = useState("");

  const handleClick = (endpoint) => {
    let url = "http://localhost:5000/";
    fetch(url + endpoint)
      .then((res) => res.json())
      .then((data) => setData(data));
  };

  const handleInputChange = (event) => setEndpoint(event.target.value);

  const handleClickResource = (endpoint) => setEndpoint(endpoint);

  return (
    <div className="container">
      <Sidebar handleClick={handleClickResource} />
      <Response
        endpoint={endpoint}
        handleClick={handleClick}
        data={data}
        handleChange={handleInputChange}
      />
    </div>
  );
};

export default Container;
