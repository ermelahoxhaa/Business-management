export default function Home() {
  return (
    <div className="min-h-[70vh] px-6 py-10 bg-gray-50">

     
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-800">
          Welcome to Business Management System
        </h1>

        <p className="mt-4 text-gray-600">
          Manage orders, clients, deliveries and invoices in one modern platform.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <button className="px-5 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition">
            Get Started
          </button>

          <button className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition">
            Learn More
          </button>
        </div>
      </div>

      
      <div className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-800">Order Management</h3>
          <p className="text-sm text-gray-600 mt-2">
            Create, update and track all business orders in real time.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-800">Client System</h3>
          <p className="text-sm text-gray-600 mt-2">
            Manage all customer data and history in one place.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-800">Reports</h3>
          <p className="text-sm text-gray-600 mt-2">
            View analytics and business performance easily.
          </p>
        </div>

      </div>
    </div>
  )
}