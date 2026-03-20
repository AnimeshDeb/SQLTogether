import LandingPage from "./pages/landing"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import AuthPage from "./pages/Authpage";
import Home from "./pages/home";
import QuestPage from "./pages/quest";
function App(){



  return(

    <BrowserRouter>
    
    <Routes>

      <Route path="/" element={<LandingPage/>}/>
      <Route path="/auth" element ={<AuthPage/>}/>
      <Route path="/home" element={<Home/>}/>
      <Route path="/quest/:id" element={<QuestPage/>}/>

    </Routes>
    
    </BrowserRouter>


  )
}

export default App;