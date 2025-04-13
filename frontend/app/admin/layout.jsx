
import AuthAdmin from "../../components/AuthAdmin"

export default function adminLayout({ children }) {

    return <AuthAdmin routesToSkip={{
        '/signin': true,
        '/signup': true,
        '/signout': true,
    }}>{children}</AuthAdmin>
}