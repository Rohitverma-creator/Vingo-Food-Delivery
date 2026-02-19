import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setMyOrders, setUserData } from "../redux/userSlice";

const useGetMyOrders = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/order/my-orders`, {
          withCredentials: true,
        });
        dispatch(setMyOrders(result.data));
      } catch (error) {
        console.log(error);
      }
    };

    fetchOrders();
  }, []);
};

export default useGetMyOrders;
