import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import { Home } from "./pages";
import AccountActivation from "./components/AccountActivation";
import SearchingPage from "./pages/SearchingPage";

function App() {
    return (
        <BrowserRouter>
            <div>
                <Provider store={store}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/activate" element={<AccountActivation />} />
                        <Route path="/search" element={<SearchingPage />} />
                    </Routes>
                </Provider>
            </div>
        </BrowserRouter>
    );
}

export default App;
