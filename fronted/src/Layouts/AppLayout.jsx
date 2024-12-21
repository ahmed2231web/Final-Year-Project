import Header from '../Components/Common/Header'
import Footer from "../Components/Common/Footer"
import FooterBar from "../Components/Common/FooterBar"
import { Outlet } from 'react-router-dom'

function AppLayout() {
  return (
    <>
    <Header/>
    <Outlet/>
    <FooterBar/>
    <Footer/>
    </>
  )
}

export default AppLayout