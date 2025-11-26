import React from 'react'
import Navbar from './components/Navbar'
import SearchItems from './pages/SearchItem'
import About from './pages/About'
import Home from './pages/Home'
import Footer from './components/Footer'
import {Routes,Route} from 'react-router-dom'

const App = () => {
  return (
    <div className="relative w-full min-h-screen flex flex-col overflow-hidden bg-black">
      {/* Background layer */}
      <div className="w-full h-full absolute inset-0 bg-black bg-[url('https://imgs.search.brave.com/bHGHJer-hiDImfWrRSV8S_W91Av_qNF7VHfKJ63z3jw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/ZnJlZS1waG90by8z/ZC1kYXJrLWdydW5n/ZS1kaXNwbGF5LWJh/Y2tncm91bmQtd2l0/aC1zbW9reS1hdG1v/c3BoZXJlXzEwNDgt/MTYyMTguanBnP3Nl/bXQ9YWlzX2h5YnJp/ZCZ3PTc0MCZxPTgw')] bg-cover bg-center blur-md"></div>
      <div className="absolute inset-0 bg-black/40"></div>
      {/* Content layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/browse" element={<SearchItems />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default App
