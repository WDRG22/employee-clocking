import React from "react";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import { useEmployee } from "../auth/EmployeeContext";
import Login from '../components/login/Login';
import Signup from '../components/signup/Signup';
import Layout from "../components/layout/Layout";
import Dashboard from '../components/dashboard/Dashboard';
import AdminDashboard from '../components/adminDashboard/AdminDashboard';
import Settings from "../components/settings/Settings";
import EmployeeAttendance from '../components/employeeAttendance/EmployeeAttendance';
import NotFound from "../components/notFound/NotFound";

const PrivateRoute = ({ children, requiresAdmin = false }) => {
    const { employee } = useEmployee();
    if (!employee) return <Navigate to="/login" replace />;
    if (requiresAdmin && !employee.is_admin) return <Navigate to="/" replace />;
    return children;
}

function MyRouter() {
    const { employee } = useEmployee();

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={employee ? <Navigate to="/" replace /> : <Login />} />
                <Route path="/signup" element={employee ? <Navigate to="/" replace /> : <Signup />}/>
                
                <Route path="/" element={
                    <PrivateRoute>
                        <Layout>
                            {employee?.is_admin ? <AdminDashboard /> : <Dashboard />}
                        </Layout>
                    </PrivateRoute>
                }/>                

                <Route path="/attendance/:employee_id" element={
                    <PrivateRoute>
                        <Layout>
                            <EmployeeAttendance />
                        </Layout>
                    </PrivateRoute>
                }/>

                <Route path="/settings" element={
                    <PrivateRoute>
                        <Layout>
                            <Settings />
                        </Layout>
                    </PrivateRoute>
                }/>
                
                <Route path="*" element={<NotFound />} /> 
            </Routes>
        </BrowserRouter>
    );
}


export default MyRouter;