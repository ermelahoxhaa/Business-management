import React, {useState} from "react"
import { 
    Search, 
    FileText, 
    TrendingUp, 
    Pencil, 
    Trash2,
    Plus
} from "lucide-react"

import CreateClientModal from "../../modals/CreateClientModal"


export default function ClientManagement() {

    const [isModalOpen, setIsModalOpen] = useState(false)

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)

    return(
        <div className="container mx-auto px-4 py-8">
            <div className="mb-3 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
                    <button onClick={openModal} 
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors w-full sm:w-auto">
                        <Plus className="w-5 h-5 mr-2" />
                        Add Client
                    </button>
                </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                <div className="mb-6 w-full">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search clients..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-700 rounded-md "
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {/* Example client card */}
                <div className=" p-4 bg-linear-to-br from-white to-gray-50  rounded-xl shadow-lg overflow-hidden border border-gray-200  transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col min-h-70">
                    {/* Client details */}
                    <div className=" grow flex flex-col mb-4">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-0.5 truncate">
                        John Doe - Acme Corporation
                        </h3>
                    </div>
                    <div className="space-y-2 mb-4 text-sm grow">
                        <p className="text-gray-700 dark:text-gray-300 flex items-start gap-2"> Phone: +38349356478</p>
                        <p className="text-gray-700 dark:text-gray-300 flex items-start gap-2"> Email: john.doe@acme.com</p>
                        <p className="text-gray-700 dark:text-gray-300 flex items-start gap-2"> Address: 123 Main St, Anytown, USA</p>
                    </div>

                    <div className="mt-auto space-y-3 mb-4">
                        <div className="flex items-start gap-3">
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50  border-green-200 rounded-lg">
                            <FileText className="w-3.5 h-3.5 text-green-600" />
                                <span className="text-xs font-semibold text-green-700">
                                    1
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50  border-blue-200 rounded-lg">
                            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-xs font-semibold text-blue-700">
                                    4,500.00€
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                        <button
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-green-600 text-gray-700 dark:text-gray-300 hover:text-white transition-all duration-200"
                        title="Edit"
                        >
                        <Pencil className="w-4 h-4" />
                        </button>
                        <button
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-600 text-gray-700 dark:text-gray-300 hover:text-white transition-all duration-200"
                        title="Delete"
                        >
                        <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
            <CreateClientModal 
            isOpen={isModalOpen} 
            onClose={closeModal} 
            />
        </div>
    )
}