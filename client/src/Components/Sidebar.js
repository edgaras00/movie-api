import React from "react";

const Sidebar = ({ handleClick }) => {
  // Functional sidebar component that shows available resources
  return (
    <div className="sidebar">
      <ul>
        <li onClick={() => handleClick("movies")}>Movies</li>
        <li onClick={() => handleClick("directors")}>Directors</li>
        <li onClick={() => handleClick("genres")}>Genres</li>
        <li onClick={() => handleClick("search/movies?query=avengers")}>
          Search
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
