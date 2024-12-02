import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const token = Cookies.get("jwt");

    if (token) {
        try {
            const decodedToken: { role: string } = jwtDecode(token);

            if (allowedRoles.includes(decodedToken.role)) {
                return <>{children}</>; // Render children if role is valid
            }
        } catch (error) {
            console.error("Invalid token", error);
        }
    }

    return <Navigate to="/404" />;
};

export default ProtectedRoute;
