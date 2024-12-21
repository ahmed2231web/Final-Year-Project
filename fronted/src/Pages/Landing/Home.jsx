import Features from "../../Components/Common/Features"
import Hero from "../../Components/HomePage/Hero"
import Marquee from "../../Components/Common/Marquee"
import CropGrid from "../../Components/HomePage/CropGrid"


function Home() {
  return (
<div className="bg-white overflow-x-hidden">
    <Hero />
    <Marquee />
    <Features />
    <CropGrid/>
</div>
  )
}

export default Home