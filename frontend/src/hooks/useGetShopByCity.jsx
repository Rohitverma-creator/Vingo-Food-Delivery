import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setShopInMyCity, setUserData } from "../redux/userSlice";

const useGetShopByCity = () => {
    const dispatch=useDispatch();
    const currentCity=useSelector(state=>state.user.currentCity)
useEffect(() => {
  if (!currentCity) return; 

  const fetchShop = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/shop/get-by-city/${currentCity}`,
        { withCredentials: true }
      );
      dispatch(setShopInMyCity(result.data));
     
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  fetchShop();
}, [currentCity]);

};

export default useGetShopByCity;
