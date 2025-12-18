import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-transparent text-white text-center p-4 ">
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-12 text-gray-300">
        
        <div className="grid gap-8 md:grid-cols-4">
         
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg font-semibold">CampusFind</h2>
                <p className="text-xs text-gray-400">
                  Lost & found platform to reconnect people with their belongings.
                </p>
              </div>
            </div>
          </div>

          {/* <!-- Product links --> */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Product</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white hover:underline underline-offset-4">Home</a></li>
              <li><a href="#" className="hover:text-white hover:underline underline-offset-4">Browse Items</a>
              </li>
              <li><a href="#" className="hover:text-white hover:underline underline-offset-4">Report Lost Item</a>
              </li>
              <li><a href="#" className="hover:text-white hover:underline underline-offset-4">FAQ</a></li>
            </ul>
          </div>

          {/* <!-- Support links --> */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white hover:underline underline-offset-4">Contact Us</a></li>
              <li><a href="#" className="hover:text-white hover:underline underline-offset-4">Report an Issue</a>
              </li>
              <li><a href="#" className="hover:text-white hover:underline underline-offset-4">Feedback</a></li>
            </ul>
          </div>

          {/* <!-- Contact / Social --> */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold mb-1">Stay connected</h3>
            <p className="text-sm text-gray-400">
              Have a suggestion or found a bug? Reach out anytime.
            </p>
            <p className="text-sm">
              Email:
              <a href="mailto:raundalerutik@example.com" className="text-gray-200 hover:text-white hover:underline">
                raundalerutik@gmail.com
              </a>
            </p>
            <div className="flex gap-4 text-sm text-gray-400 justify-center">
              <a href="https://github.com/rutikraundale" className="hover:text-white">GitHub</a>
              <a href="https://www.linkedin.com/in/rutik-raundale-348136289?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" className="hover:text-white">LinkedIn</a>
              <a href="#" className="hover:text-white">Instagram</a>
            </div>
          </div>
        </div>

        {/* <!-- Bottom section --> */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-3 border-t border-white/5 pt-4">
          <p className="text-xs text-gray-500">
            © 2025 CampusFind. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );

}

export default Footer