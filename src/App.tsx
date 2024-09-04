import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import { Register } from "./pages";

function App() {
    return (
        <BrowserRouter>
            <div>
                <Provider store={store}>
                    <Routes>
                        <Route path="/register" element={<Register />} />
                    </Routes>
                </Provider>
            </div>
        </BrowserRouter>
    );
}

export default App;
