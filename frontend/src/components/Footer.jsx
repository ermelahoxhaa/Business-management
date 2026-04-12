import mapImg from '../assets/map.png'

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-10">

       
        <div className="flex-shrink-0">
          <img
            src={mapImg}
            alt="map"
            className="w-[280px] rounded-lg shadow-md object-cover"
          />
        </div>

        
        <div className="flex flex-1 flex-wrap gap-10 justify-between">

          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">
              Contact Us
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>Bulevardi Bill Clinton, Prishtinë</li>
              <li>+383 49 123 456</li>
              <li>business.management@email.com</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">
              Support
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>Returns & Exchanges</li>
              <li>About Us</li>
              <li>Shipping Information</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">
              Follow Us
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>Facebook</li>
              <li>Instagram</li>
              <li>LinkedIn</li>
            </ul>
          </div>

        </div>
      </div>

      
      <div className="text-center py-4 text-sm text-gray-500 border-t">
        © 2026 Business-Management. All rights reserved.
      </div>
    </footer>
  )
}