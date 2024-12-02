import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AccountActivation from "../components/Customer/AccountActivation";
import {
    Home,
    ResendEmail,
    ResetPassword,
    SearchingPage,
    BookingConfirm,
    PaymentMethod,
    DashBoard,
    NotFound,
    Profile,
} from "../pages";

function AppRoutes() {
    return (
        <Routes>
            {/* Common routes */}
            <Route path="/" element={<Home />} />
            <Route path="/activate" element={<AccountActivation />} />
            <Route path="/search" element={<SearchingPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/resend-email" element={<ResendEmail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />

            {/* Customer-specific routes */}
            <Route
                path="/booking-confirm"
                element={
                    <ProtectedRoute allowedRoles={["ROLE_CUSTOMER"]}>
                        <BookingConfirm />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/payment-method"
                element={
                    <ProtectedRoute allowedRoles={["ROLE_CUSTOMER"]}>
                        <PaymentMethod />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["ROLE_BUS_COMPANY"]}>
                        <DashBoard />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default AppRoutes;
