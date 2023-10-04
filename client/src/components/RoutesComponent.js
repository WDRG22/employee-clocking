import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import { useUser } from "../auth/UserContext";
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Signup from '../pages/Signup';


function RoutesComponent() {
    const { user } = useUser();

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
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    )
}

export default RoutesComponent;