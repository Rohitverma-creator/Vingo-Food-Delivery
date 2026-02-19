import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
  setCurrentAddress,
  setCurrentCity,
  setcurrentState,
} from "../redux/userSlice";
import { setAddress, setLocation } from "../redux/mapSlice";

const useGetCity = () => {
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

         
          dispatch(setLocation({ lat: latitude, lon: longitude }));

          const result = await axios.get(
            "https://api.geoapify.com/v1/geocode/reverse",
            {
              params: {
                lat: latitude,
                lon: longitude,
                format: "json",
                apiKey,
              },
            }
          );
          

          const data = result?.data?.results?.[0];
          if (!data) return;

         
          const city =
            data.city ||
            data.town ||
            data.village ||
            data.suburb ||
            data.county ||
            "";

          dispatch(setCurrentCity(city));
          dispatch(setcurrentState(data.state || ""));

          const fullAddress =
            data.formatted ||
            data.address_line1 ||
            "";

          dispatch(setCurrentAddress(fullAddress));

        
          dispatch(setAddress(fullAddress));

        } catch (error) {
          console.error("Geoapify API error:", error);
        }
      },
      (error) => {
        console.error("Geolocation error:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, [dispatch, apiKey]);
};

export default useGetCity;
