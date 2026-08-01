import { useState } from "react";

export default function useLocalStorage() {
    const [user, setUserValue] = useState(() => localStorage.getItem("user"));
    function setUser(user) {
        localStorage.setItem("user", user);
    }
    function getUser() {
        return localStorage.getItem("user");
    }
    return [setUser, getUser];
}

