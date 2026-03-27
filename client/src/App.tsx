import LandingPage from "./pages/landing"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import AuthPage from "./pages/Authpage";
import Home from "./pages/home";
import QuestPage from "./pages/quest";
import Lesson from "./pages/lesson";
function App(){



  return(

    <BrowserRouter>
    
    <Routes>

      <Route path="/" element={<LandingPage/>}/>
      <Route path="/auth" element ={<AuthPage/>}/>
      <Route path="/home" element={<Home/>}/>
      <Route path="/quest/:id" element={<QuestPage/>}/>
      <Route path="/lesson/:category" element={<Lesson />} />

    </Routes>
    
    </BrowserRouter>


  )
}

export default App;