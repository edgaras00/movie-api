import React, { useState } from "react";
import JSONPretty from "react-json-pretty";
import JSONPrettyMon from "react-json-pretty/dist/acai";

const Response = ({ data, endpoint, handleClick, handleChange }) => {
  // Functional component that renders JSON response data

  // State to show / hide copy notification
  const [showNotification, setShowNotification] = useState(false);

  const copyToClipboard = (text) => {
    // Function to copy the request url to user's clipboard
    const textElement = document.createElement("textarea");
    textElement.value = text;
    document.body.appendChild(textElement);
    textElement.select();
    document.execCommand("copy");
    document.body.removeChild(textElement);
    // Show notification to user
    setShowNotification(true);
    // Hide notification after some time
    setTimeout(() => {
      setShowNotification(false);
    }, 1000);
  };

  return (
    <div className="response-container">
      <div className="input-container">
        <div className="host">
          <p>https://movie-api/</p>
        </div>
        <input
          type="text"
          name="requestUrl"
          value={endpoint}
          placeholder={endpoint}
          onChange={(event) => handleChange(event)}
        />
        <button onClick={() => handleClick(endpoint)}>Request!</button>
        <button
          onClick={() => copyToClipboard(`http://localhost:5000/${endpoint}`)}
        >
          Copy
        </button>
      </div>
      <div className="response">
        <pre>
          <code>
            <JSONPretty
              data={data}
              theme={JSONPrettyMon}
              space={8}
            ></JSONPretty>
          </code>
        </pre>
      </div>
      <br />
      {showNotification ? (
        <p className="notification">Copied Request to Clipboard</p>
      ) : (
        <p className="notification">&nbsp;</p>
      )}
    </div>
  );
};

export default Response;
