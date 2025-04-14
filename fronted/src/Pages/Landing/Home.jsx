import Features from "../../Components/Common/Features"
import Hero from "../../Components/HomePage/Hero"
import Marquee from "../../Components/Common/Marquee"
import CropGrid from "../../Components/HomePage/CropGrid"


function Home() {
  return (
    <div className="bg-white overflow-x-hidden w-full">
      <div className="max-w-[100vw]">
        <Hero />
        <Marquee />
        <Features />
        <CropGrid/>
      </div>
    </div>
  )
}

export default Home