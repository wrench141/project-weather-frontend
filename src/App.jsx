// App.js
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './App.css';
import sunrise from "./assets/sunrise.png"
import sunset from "./assets/sunset.png"
import windspeed from "./assets/windy.png"
import sea from "./assets/sea.png"
import feels from "./assets/feels.png"

const App = () => {
  const [place, setPlace] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState('');
  const [data, setData] = useState();
  const [places, setPlaces] = useState([]);
  const [show, setShow] = useState(false)

  const btnRef = useRef();
  const optionsRef = useRef();

  const tomTomApiKey = 'LBwzfZ2CSQJ7w2XjTUCUO8Itpq63UK6I'; 
  const openWeatherApiKey = '584d06d2caf97b52b099317735fac5b1'; 
  const BK_URI = "https://project-weather-sand.vercel.app"

  const getCoordinates = async (place) => {
    try {
      const response = await axios.get(
        `https://api.tomtom.com/search/2/search/${encodeURIComponent(place)}.json`,
        {
          params: {
            key: tomTomApiKey,
            limit: 1,
          },
        }
      );

      const { results } = response.data;
      if (results && results.length > 0) {
        const { position } = results[0];
        setCoordinates({
          longitude: position.lon,
          latitude: position.lat,
        });

        await getWeather(position.lat, position.lon);
        setError('');
      } else {
        throw new Error('Location not found');
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      setError('Failed to fetch location. Please try again.');
      setCoordinates(null);
    }
  };
  
  console.log((new Date()).toTimeString().split(" ")[0], (new Date()).toDateString())

  const getWeather = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            lat: latitude,
            lon: longitude,
            appid: openWeatherApiKey,
            units: 'metric',
          },
        }
      );

      const { main } = response.data;
      setData({
        temperature: main.temp,
        description: response.data.weather[0].description,
        windspeed: response.data.wind.speed,
        humidity: main.humidity, 
        pressure: main.pressure,
        sealevel: main.sea_level, 
        mintemp: main.temp_min, 
        maxtemp: main.temp_max,
        sunrise: response.data.sys.sunrise,
        sunset: response.data.sys.sunset,
        feels: main.feels_like,
        date: (new Date()).toDateString() + ", " + (new Date()).toTimeString().split(" ")[0]
      });
      console.log(response.data)
    } catch (error) {
      console.error('Error fetching weather:', error);
      setError('Failed to fetch weather data. Please try again.');
    }
  };

  const recordSearch = async(query) => {
    const response = await axios.get(BK_URI+"/weather.api.v1/search/"+query, {
      headers: {
        token: window.localStorage.getItem("token")
      }
    });
    if(response.data?.token){
      window.localStorage.setItem("token", response.data.token);
    }
    console.log(response.data)
  }

  const getHistory = async() => {
    const response = await axios.get(BK_URI+"/weather.api.v1/history/", {
      headers: {
        token: window.localStorage.getItem("token")
      }
    });
    console.log(response.data, "history")
    setPlaces(response.data.data)
  }

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (place.trim()) {
      getCoordinates(place);
      
    } else {
      setError('Please enter a location');
      setCoordinates(null);
    };
    await recordSearch(place)
  };
  
  useEffect(() => {
    setData({
      date: (new Date()).toDateString() + ", " + (new Date()).toTimeString().split(" ")[0]
    });
    const tempPlace = "gajuwaka"
    if (tempPlace.trim()) {
      getCoordinates(tempPlace);
    } else {
      setError('Please enter a location');
      setCoordinates(null);
    }
  }, [])

  return (
    <div className="container">
      <div className="wrapper">
        <div className="row col">
          <div className="wrap" style={{flexDirection: "column", gap: "5px"}}>
            <p className="title">Weather foecast</p>
            <p className="sub">Get Accurate weather results based on location.</p>
          </div>
          <div className="wrap">
            <input type="text" placeholder='Search Location' value={place} onChange={(e) => {setPlace(e.target.value); setShow(false)}} onFocus={() => {
              getHistory(); setShow(true)
            }} className="inp" />
            {
              show ? (
                <div className="options hide">
                  {places.map((area, i) => (
                    <p className="option" key={i} onClick={(e) => {setPlace(area); setShow(false)}}>{area}</p>
                  ))}
                </div>
              ) : <></>
            }
            <button ref={btnRef} className="btn" onClick={(e) => handleSubmit(e)}>
              <ion-icon name="search-outline"></ion-icon>
            </button>
          </div>
        </div>
        <div className="row col alc">
          <div className="wrap" style={{flexDirection: "column"}}>
            <p className="main-title" style={{width: "max-content"}}>
              {data ? data.temperature : 23} Deg
            </p>
            <div className="sub-desc">
              <ion-icon name="rainy-outline"></ion-icon>
              <p>{data ? data.date : null}</p>
            </div>
            <p className="main-title" style={{width: "max-content", marginTop: "5px", fontSize: "15px"}}>
              {data ? data.description : "Overcast cloudy"}
            </p>
          </div>
          <div className="wrap" style={{flexDirection: "column"}}>
            <p className="sub meta">Humidity: {data ? data.humidity : ""}</p>
            <p className="sub meta">Pressure: {data ? data.pressure + " psi": ""}</p>
            <p className="sub meta">Minimum Temperature: {data ? data.mintemp  + " deg" : ""}</p>
            <p className="sub meta">Maximum Temperature: {data ? data.maxtemp  + " deg" : ""}</p>
          </div>
        </div>
        <div className="row grid">
          <div className="section">
            <img src={feels} alt="" className='icon' />
            <p className="label">Feels like </p>
            <p className="time">{data ? data.feels  + " deg" : ""}</p>
          </div>
          <div className="section">
            <img src={sunrise} alt="" className='icon' />
            <p className="label">Sunrise</p>
            <p className="time">{data ? (new Date(data.sunrise)).toTimeString().split(" ")[0] : ""}</p>
          </div>
          <div className="section">
            <img src={sunset} alt="" className='icon' />
            <p className="label">Sunset</p>
            <p className="time">{data ? (new Date(data.sunset)).toTimeString().split(" ")[0] : ""}</p>
          </div>
          <div className="section">
            <img src={windspeed} alt="" className='icon' />
            <p className="label">Windspeed</p>
            <p className="time">{data ? data.windspeed : ""}</p>
          </div>
          <div className="section">
            <img src={sea} alt="" className='icon' />
            <p className="label">Sea Levels</p>
            <p className="time">{data ? data.sealevel : ""}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
