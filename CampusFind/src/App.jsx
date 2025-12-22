import React from 'react'
import { lazy,Suspense } from 'react'
import SearchItems from './pages/SearchItem'
import About from './pages/About'
import Home from './pages/Home'
import Footer from './components/Footer'
import { Routes, Route } from 'react-router-dom'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import ItemDetail from './pages/ItemDetail'
import PostItem from './pages/PostItem'

const Navbar=lazy(()=> import('./components/Navbar'))
const Claimitem=lazy(()=>import('./pages/Claimitem'))
const App = () => {
  return (
    <div
      className="min-h-screen w-full relative bg-black"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(34, 197, 94, 0.25), transparent 70%), #000000",
           backgroundAttachment: "fixed",

      }}
    >
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="main px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/browse" element={<SearchItems />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/itemdetails" element={<ItemDetail />} />
            <Route path="/postitem" element={<PostItem />} />
            <Route path="/claim" element={<Claimitem />} />
            

          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  )
}


export default App
