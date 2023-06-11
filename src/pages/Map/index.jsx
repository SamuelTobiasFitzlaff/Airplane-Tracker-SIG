import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";
import dataJun10 from "../../json/dataJun10.json";

const geoUrl = "/countries.json";

const Map = () => {
  const [rotation, setRotation] = useState([58, 20, 0]);
  const [scale, setScale] = useState(300);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const filterStatesByCountry = (states, country) => {
    return states
      .filter((state) => state[2] === country)
      .map((state) => {
        const [name, , , , lastContact, lat, lon, , , , rot] = state;
        return {
          name,
          coordinates: [lat, lon],
          rotation: rot,
          lastContact: lastContact,
        };
      });
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "https://opensky-network.org/api/states/all"
      );

      setIsLoading(false);
      setData(filterStatesByCountry(response.data.states, "Brazil"));
    } catch (error) {
      setIsLoading(false);
      setData(filterStatesByCountry(dataJun10.states, "Brazil"));
      alert(error.response.data);
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleKeyDown = (event) => {
    const { key } = event;
    let movementX = 0;
    let movementY = 0;
    let newScale = scale;

    if (key === "ArrowUp") {
      movementY = -10;
    } else if (key === "ArrowDown") {
      movementY = 10;
    } else if (key === "ArrowLeft") {
      movementX = 10;
    } else if (key === "ArrowRight") {
      movementX = -10;
    }

    const newRotation = [
      rotation[0] + movementX,
      rotation[1] + movementY,
      rotation[2],
    ];

    if (newRotation[1] > 90) {
      newRotation[1] = 90;
    } else if (newRotation[1] < -90) {
      newRotation[1] = -90;
    }

    if (key === "+") {
      newScale += 100;
    } else if (key === "-") {
      newScale -= 100;
    }

    if (newScale < 100) {
      newScale = 100;
    }
    setRotation(newRotation);
    setScale(newScale);
  };

  return (
    <>
      <ComposableMap
        projection="geoAzimuthalEqualArea"
        projectionConfig={{
          rotate: rotation,
          scale: scale,
        }}
        onKeyDown={handleKeyDown}
        transform="translate(0, -225)"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#999"
                stroke="#CCC"
              />
            ))
          }
        </Geographies>

        {data &&
          data.map(({ name, coordinates, rotation, lastContact }) => (
            <Marker key={name} className="marker" coordinates={coordinates}>
              <g transform={`translate(-6, -12) rotate(${rotation})`}>
                <svg
                  width="12px"
                  height="12px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.0486 10.6286L15.3786 8.61859L14.3386 8.17859C14.1786 8.09859 14.0386 7.88859 14.0386 7.70859V4.64859C14.0386 3.68859 13.3286 2.54859 12.4686 2.10859C12.1686 1.95859 11.8086 1.95859 11.5086 2.10859C10.6586 2.54859 9.94859 3.69859 9.94859 4.65859V7.71859C9.94859 7.89859 9.80859 8.10859 9.64859 8.18859L3.94859 10.6386C3.31859 10.8986 2.80859 11.6886 2.80859 12.3686V13.6886C2.80859 14.5386 3.44859 14.9586 4.23859 14.6186L9.24859 12.4586C9.63859 12.2886 9.95859 12.4986 9.95859 12.9286V14.0386V15.8386C9.95859 16.0686 9.82859 16.3986 9.66859 16.5586L7.34859 18.8886C7.10859 19.1286 6.99859 19.5986 7.10859 19.9386L7.55859 21.2986C7.73859 21.8886 8.40859 22.1686 8.95859 21.8886L11.3386 19.8886C11.6986 19.5786 12.2886 19.5786 12.6486 19.8886L15.0286 21.8886C15.5786 22.1586 16.2486 21.8886 16.4486 21.2986L16.8986 19.9386C17.0086 19.6086 16.8986 19.1286 16.6586 18.8886L14.3386 16.5586C14.1686 16.3986 14.0386 16.0686 14.0386 15.8386V12.9286C14.0386 12.4986 14.3486 12.2986 14.7486 12.4586L19.7586 14.6186C20.5486 14.9586 21.1886 14.5386 21.1886 13.6886V12.3686C21.1886 11.6886 20.6786 10.8986 20.0486 10.6286Z"
                    fill="#292D32"
                  />
                </svg>
              </g>
              <text className="marker-text" textAnchor="middle" y={10}>
                icao24: {name}
              </text>
              <text className="marker-text" textAnchor="middle" y={20}>
                {new Date(lastContact * 1000).toLocaleString()}
              </text>
            </Marker>
          ))}
      </ComposableMap>
      {isLoading && (
        <img
          className="loading-container"
          src={`/loading-svgrepo-com.svg`}
          alt="Loading..."
        />
      )}
      <button className="reload-button" onClick={fetchData}>
        Reload
      </button>
    </>
  );
};

export default Map;