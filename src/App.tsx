import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import { BookingConfirm, BookingHistory, Home, PaymentMethod, Profile, ResendEmail, ResetPassword, SearchingPage, ThankyouPage } from "./pages";
import AccountActivation from "./components/AccountActivation";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ""}>
            <BrowserRouter>
                <div>
                    <Provider store={store}>
                        <div className="text-sm">
                            <ToastContainer />
                        </div>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/activate" element={<AccountActivation />} />
                            <Route path="/search" element={<SearchingPage />} />
                            <Route path="/booking-confirm" element={<BookingConfirm />} />
                            <Route path="/payment-method" element={<PaymentMethod />} />
                            <Route path="/thankyou" element={<ThankyouPage />} />
                            <Route path="/booking-history" element={<BookingHistory />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/resend-email" element={<ResendEmail />} />
                            <Route path="/profile" element={<Profile />} />
                        </Routes>
                    </Provider>
                </div>
            </BrowserRouter>
        </GoogleOAuthProvider>
    );
}

export default App;
