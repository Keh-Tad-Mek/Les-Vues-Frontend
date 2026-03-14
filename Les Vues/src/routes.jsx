import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./auth/signin"
import SignUp from "./auth/signup"

function AppRoutes(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<div style={{ textAlign: 'center', padding: '2rem', fontFamily:"monospace" }}>
                <h1>Les Vues</h1>
                <p>Landing page coming soon</p>
                <nav>
                    <a href="/signup">Sign Up</a> | <a href="/signin">Sign In</a>
                </nav>
                </div>} />

                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes