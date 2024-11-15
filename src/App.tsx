import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import { BookingConfirm, BookingHistory, Home, PaymentMethod, SearchingPage, ThankyouPage } from "./pages";
import AccountActivation from "./components/AccountActivation";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

function App() {
    return (
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
                    </Routes>
                </Provider>
            </div>
        </BrowserRouter>
    );
}

export default App;
