import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import Controller from "./pages/Controller";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Controller />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  )
}

export default App