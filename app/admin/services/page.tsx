import { getCookies } from "@/helper/cookies"
import Link from "next/link"
import { PlusCircle, Pencil, AlertCircle, RefreshCw, Info, ArrowLeft } from "lucide-react"
import ServiceSearch from "./search"

export interface ServiceResponse {
  success: boolean
  message: string
  data: ServiceType[]
  count: number
}

export interface ServiceType {
  id: number
  name: string
  min_usage: number
  max_usage: number
  price: number
  owner_token: string
  createdAt: string
  updatedAt: string
}

type SearchParams = {
  [key: string]: string | number | undefined | boolean
}

async function getServices(params?: SearchParams): Promise<ServiceResponse> {
  try {
    let url = `${process.env.NEXT_PUBLIC_BASE_URL}/services`
    
    // Jika ada params, tambahkan ke URL
    if (params) {
      const queryString = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== "")
        .map(key => `${key}=${encodeURIComponent(String(params[key]))}`)
        .join("&")
      
      if (queryString) {
        url += `?${queryString}`
      }
    }
    
    console.log("Fetching from URL:", url) // Debug log
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
        "Authorization": `Bearer ${await getCookies("token")}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        message: errorData?.message || "Failed to fetch services",
        data: [],
        count: 0,
      }
    }

    return await response.json()
  } catch (error) {
    console.error("Fetch error:", error) // Debug log
    return {
      success: false,
      message: "Network error. Please check your connection.",
      data: [],
      count: 0,
    }
  }
}

type PageProp = {
  searchParams: Promise<{
    search?: string
  }>
}

export default async function ServicesPage(prop: PageProp) {
  const params = await prop.searchParams
  const search = params.search || ""
  
  // Siapkan parameter untuk API call
  const apiParams: SearchParams = {}
  if (search) {
    apiParams.search = search
  }
  
  const { success, message, data } = await getServices(apiParams)

  // Filter data di frontend sebagai fallback jika backend belum support search
  const filteredData = search 
    ? data.filter(service => 
        service.name.toLowerCase().includes(search.toLowerCase()) ||
        service.id.toString().includes(search) ||
        service.price.toString().includes(search) ||
        service.min_usage.toString().includes(search) ||
        service.max_usage.toString().includes(search)
      )
    : data

  if (!success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Oops! Something went wrong</h2>
                <p className="text-gray-600 mt-1">We encountered an error while loading services</p>
              </div>
            </div>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
              <p className="text-red-700 font-medium">{message}</p>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <Link
                href="/dashboard"
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (data.length === 0 && !search) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-200">
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
              <Info className="h-10 w-10 text-blue-500" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Services Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't created any services. Start by adding your first service to manage your offerings.
            </p>
            
            <Link
              href="/admin/services/add"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <PlusCircle className="h-5 w-5" />
              Add Your First Service
            </Link>
            
            <div className="mt-10 pt-8 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Getting Started Tips
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="text-blue-600 font-bold text-lg mb-1">1</div>
                  <p className="text-sm text-gray-700">Define clear service names</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="text-green-600 font-bold text-lg mb-1">2</div>
                  <p className="text-sm text-gray-700">Set reasonable usage limits</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="text-purple-600 font-bold text-lg mb-1">3</div>
                  <p className="text-sm text-gray-700">Configure competitive pricing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left section: back button + title */}
            <div className="flex items-center gap-4">
              <Link
                href="/admin/profile"
                className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
                title="Kembali ke Profile"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
                <p className="text-gray-600 mt-2">
                  klik tombol ini apabila kamu ingin kembali ke halaman profile
                </p>
              </div>
            </div>
            
            {/* Right section: search + add button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <ServiceSearch search={search} />
              
              <Link
                href="/admin/services/add"
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap"
              >
                <PlusCircle className="h-5 w-5" />
                Add New Service
              </Link>
            </div>
          </div>
          
          {/* Search Info */}
          {search && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-blue-700 font-medium">
                    Showing results for: "{search}"
                  </span>
                  <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {filteredData.length} {filteredData.length === 1 ? 'service' : 'services'} found
                  </span>
                </div>
                <Link
                  href="/admin/services"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Clear search
                </Link>
              </div>
            </div>
          )}
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="text-sm text-gray-500 font-medium">
                {search ? 'Filtered Services' : 'Total Services'}
              </div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{filteredData.length}</div>
              {search && data.length !== filteredData.length && (
                <div className="text-xs text-gray-500 mt-1">
                  of {data.length} total
                </div>
              )}
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="text-sm text-gray-500 font-medium">Avg. Price</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {filteredData.length > 0 
                  ? `Rp${Math.round(filteredData.reduce((acc, s) => acc + s.price, 0) / filteredData.length).toLocaleString()}`
                  : 'Rp0'
                }
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="text-sm text-gray-500 font-medium">Total Usage Range</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {filteredData.length > 0 
                  ? filteredData.reduce((acc, s) => acc + s.max_usage, 0).toLocaleString()
                  : '0'
                }
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="text-sm text-gray-500 font-medium">
                {search ? 'Filtered' : 'Last Updated'}
              </div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {filteredData.length > 0 && filteredData[0]?.updatedAt
                  ? new Date(filteredData[0].updatedAt).toLocaleDateString('id-ID')
                  : 'N/A'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Services List</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Click edit to modify any service details
                </p>
              </div>
              {search && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600">
                    {filteredData.length} of {data.length}
                  </span>
                  <span className="text-gray-500"> services match your search</span>
                </div>
              )}
            </div>
          </div>
          
          {filteredData.length === 0 && search ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Info className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No services found</h3>
              <p className="text-gray-500 mb-6">
                No services match your search for "{search}". Try a different keyword.
              </p>
              <Link
                href="/admin/services"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300"
              >
                View all services
              </Link>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Info className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No services available</h3>
              <p className="text-gray-500 mb-6">
                There are no services to display.
              </p>
              <Link
                href="/admin/services/add"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
              >
                <PlusCircle className="h-4 w-4" />
                Add New Service
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left font-semibold text-gray-700">Service Details</th>
                      <th className="px-6 py-4 text-center font-semibold text-gray-700">Usage Range</th>
                      <th className="px-6 py-4 text-right font-semibold text-gray-700">Price</th>
                      <th className="px-6 py-4 text-center font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((service, index) => (
                      <tr 
                        key={service.id} 
                        className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-200 ${
                          index % 2 === 0 ? 'bg-gray-50/50' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                              <span className="font-bold text-blue-600">S</span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{service.name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                  ID: {service.id}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Created: {new Date(service.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                              <span className="font-medium text-gray-700">
                                {service.min_usage.toLocaleString()}
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className="font-medium text-gray-700">
                                {service.max_usage.toLocaleString()}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              per unit
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-right">
                            <div className="font-bold text-lg text-gray-900">
                              Rp{service.price.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              per transaction
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <Link
                              href={`/admin/services/edit/${service.id}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 border border-blue-200 hover:border-blue-300"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Footer */}
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{filteredData.length}</span> services
                    {search && (
                      <span className="ml-2 text-gray-500">
                        (filtered from {data.length} total)
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Tip:</span> You can click edit to update service details anytime
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}