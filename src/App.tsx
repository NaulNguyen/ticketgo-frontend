import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AppRoutes from "./routes/routes";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
    return (
        <GoogleOAuthProvider
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ""}
        >
            <BrowserRouter>
                <div>
                    <SpeedInsights />
                    <Provider store={store}>
                        <div className="text-sm">
                            <ToastContainer />
                        </div>
                        <AppRoutes />
                    </Provider>
                </div>
            </BrowserRouter>
        </GoogleOAuthProvider>
    );
}

export default App;
