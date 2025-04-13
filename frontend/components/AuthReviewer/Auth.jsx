'use client'
import ProtectedRouteClient from './AuthClient';

export default function ProtectedRoute({
    routesToSkip,
    children,
}) {

    const renderProtectedRoute = () => {
        return <ProtectedRouteClient routesToSkip={routesToSkip}>{children}</ProtectedRouteClient>;
    };

    return renderProtectedRoute();
}
