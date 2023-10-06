import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import { useUser } from "../auth/UserContext";
import Dashboard from '../pages/dashboard/Dashboard';
import Login from '../pages/login/Login';
import Signup from '../pages/signup/Signup';


function MyRouter() {
    const { user, isLoading } = useUser();

    if (isLoading) {
        return <div>Loading...</div>; // or your preferred loading indicator
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={user ? (<Dashboard/>) : (<Navigate to="/login" />)}
                />
                <Route
                    path="/login"
                    element={user ? <Navigate to="/" /> : <Login />}
                />
                <Route
                    path="/signup"
                    element={user? <Navigate to="/" /> : <Signup />}
                />
                {/* Create page not found */}
                <Route path="*" element={<Navigate to="/" />} /> 
            </Routes>
        </BrowserRouter>
    )
}

export default MyRouter;