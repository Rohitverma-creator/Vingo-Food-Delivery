import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import {
  setCurrentCity,
  setcurrentState,
  setCurrentAddress,
} from "../redux/userSlice";
import { setLocation, setAddress } from "../redux/mapSlice";

const useUpdateLocation = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const updateLocation = async (lat, lon) => {
      const result = await axios.post(
        `${serverUrl}/api/user/update-location`,
        { lat, lon },
        { withCredentials: true },
      );
   
    };
    navigator.geolocation.watchPosition((pos)=>{
        updateLocation(pos.coords.latitude,pos.coords.longitude)
    })
  }, [userData]);
};

export default useUpdateLocation;
