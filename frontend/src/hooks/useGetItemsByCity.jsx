import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setItemsInMyCity, setUserData } from "../redux/userSlice";

const useGetItemByCity = () => {
    const dispatch=useDispatch();
    const currentCity=useSelector(state=>state.user.currentCity)
useEffect(() => {
  if (!currentCity) return; 

  const fetchItems = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/item/get-by-city/${currentCity}`,
        { withCredentials: true }
      );
      dispatch(setItemsInMyCity(result.data));
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  fetchItems();
}, [currentCity]);

};

export default useGetItemByCity;
