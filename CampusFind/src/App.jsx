import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { routes } from "./routes/Routes";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const App = () => (
  <div className="min-h-screen w-full relative bg-black">
    <div className="relative z-10 flex flex-col min-h-screen">
      <Navbar />
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        
        <main className="main px-4 sm:px-6 lg:px-8">
          <Routes>
            {routes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Routes>
        </main>
        
      </Suspense>
      <Footer />
    </div>
  </div>
);

export default App;