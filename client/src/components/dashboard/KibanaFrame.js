import React from "react";
import "../../App.css";

const KibanaFrame = () => {
  return (
    <div>
      <iframe
        width="100%"
        height="900px"
        title="Kibana"
        src={
          process.env.REACT_APP_KIBANA === "true"
            ? `${window.location.protocol}//${window.location.hostname}/inventory/kibana`
            : `${window.location.protocol}//${window.location.hostname}:5601`
        }
      />
    </div>
  );
};

export default KibanaFrame;
