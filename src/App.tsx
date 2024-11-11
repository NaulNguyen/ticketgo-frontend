import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import { Home } from "./pages";
import AccountActivation from "./components/AccountActivation";
import SearchingPage from "./pages/SearchingPage";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import BookingConfirm from "./pages/BookingConfirm";

function App() {
    return (
        <BrowserRouter>
            <div>
                <Provider store={store}>
                        <div className='text-sm'>
                            <ToastContainer />
                        </div>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/activate" element={<AccountActivation />} />
                        <Route path="/search" element={<SearchingPage />} />
                        <Route path="/bookingConfirm" element={<BookingConfirm />} />
                    </Routes>
                </Provider>
            </div>
        </BrowserRouter>
    );
}

export default App;
