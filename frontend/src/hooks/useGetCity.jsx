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

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  useEffect(() => {

    if (demoCity === "lucknow") {
      sessionStorage.setItem("demoCity", "lucknow");
    }

    const demo = sessionStorage.getItem("demoCity");

    if (demo === "lucknow") {
      dispatch(setCurrentCity("Lucknow"));
      dispatch(setcurrentState("Uttar Pradesh"));
      dispatch(setCurrentAddress("Lucknow, Uttar Pradesh, India"));
      dispatch(setAddress("Lucknow, Uttar Pradesh, India"));

      dispatch(
        setLocation({
          lat: 26.8467,
          lon: 80.9462,
        })
      );

      return;
    }

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

          const distanceFromLucknow = getDistance(
            latitude,
            longitude,
            26.8467,
            80.9462
          );

          if (distanceFromLucknow <= 40) {
            dispatch(setCurrentCity("Lucknow"));
          } else {
            dispatch(setCurrentCity(city));
          }

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
