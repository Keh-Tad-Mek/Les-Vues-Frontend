import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./auth/signin"
import SignUp from "./auth/signup"
import Home from "./home/home"
import Movies from "./movies/movies"

function AppRoutes(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/movies/:key" element={<Movies />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes