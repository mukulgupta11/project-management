// src/context/UserProvider.js
import { useEffect, useState } from "react";
import { UserContext } from "./userContext";
import { API_PATHS } from "../utils/apiPaths";
import axiosInstance from "../utils/axiosInstance";

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) return;

        const accessToken = localStorage.getItem("token");
        if (!accessToken) {
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
                setUser(response.data);
            } catch (error) {
                console.error("User not authenticated", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [user]);

    const updatedUser = (userData) => {
        setUser(userData);
        if (userData?.token) {
            localStorage.setItem("token", userData.token);
        }
        setLoading(false);
    };

    const clearUser = () => {
        setUser(null);
        localStorage.removeItem("token");
    };

    return (
        <UserContext.Provider value={{ user, loading, updatedUser, clearUser }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
