export default function About() {
  return (
    <div className="min-h-[70vh] px-6 py-10 bg-gray-50">

      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-800">
          About Us
        </h1>

        <p className="mt-4 text-gray-600 leading-7">
          Business Management System is a modern full-stack application built to
          simplify business operations such as order handling, client management,
          delivery tracking and invoicing.
        </p>
      </div>

  
      <div className="max-w-5xl mx-auto mt-12 grid md:grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="font-semibold text-gray-800">Our Mission</h2>
          <p className="text-sm text-gray-600 mt-2">
            To help businesses manage operations efficiently using modern technology.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="font-semibold text-gray-800">Our Vision</h2>
          <p className="text-sm text-gray-600 mt-2">
            To build a scalable system that supports real-world business workflows.
          </p>
        </div>

      </div>
    </div>
  )
}