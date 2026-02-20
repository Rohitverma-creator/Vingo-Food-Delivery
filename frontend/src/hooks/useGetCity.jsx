import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
  setCurrentAddress,
  setCurrentCity,
  setcurrentState,
} from "../redux/userSlice";
import { setAddress, setLocation } from "../redux/mapSlice";

const useGetCity = (demoCity) => {
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  useEffect(() => {
    if (demoCity === "lucknow") return;
   

    if (!navigator.geolocation) return;

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
          dispatch(setCurrentAddress(data.formatted || ""));
          dispatch(setAddress(data.formatted || ""));
        } catch (error) {
          console.error(error);
        }
      },
      () => {},
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, [dispatch, apiKey, demoCity]);
};

export default useGetCity;
