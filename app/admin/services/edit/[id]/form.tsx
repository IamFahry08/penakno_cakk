"use client"

import { useState, FormEvent, useEffect } from "react"
import { Service } from "./page"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2, AlertCircle, Check, RefreshCw } from "lucide-react"
import { getCookies } from "@/helper/cookies"

type Props = {
  service: Service
}

export default function FormService({ service }: Props) {
  const [name, setName] = useState<string>(service.name)
  const [minUsage, setMinUsage] = useState<number>(service.min_usage)
  const [maxUsage, setMaxUsage] = useState<number>(service.max_usage)
  const [price, setPrice] = useState<number>(service.price)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const router = useRouter()
  // Reset error when user starts typing
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 10000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const validateForm = (): boolean => {
    setError("")
    
    if (!name.trim()) {
      setError("Service name is required")
      return false
    }
    if (name.length > 100) {
      setError("Service name cannot exceed 100 characters")
      return false
    }
    if (minUsage < 0) {
      setError("Minimum usage cannot be negative")
      return false
    }
    if (minUsage > 1000000) {
      setError("Minimum usage is too high (max: 1,000,000)")
      return false
    }
    if (maxUsage <= minUsage) {
      setError("Maximum usage must be greater than minimum usage")
      return false
    }
    if (maxUsage > 10000000) {
      setError("Maximum usage is too high (max: 10,000,000)")
      return false
    }
    if (price <= 0) {
      setError("Price must be greater than 0")
      return false
    }
    if (price > 1000000000) {
      setError("Price is too high (max: 1,000,000,000)")
      return false
    }
    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      console.log("🔄 [handleSubmit] Updating service ID:", service.id)
      console.log("📦 [handleSubmit] Request data:", { 
        name, 
        min_usage: minUsage, 
        max_usage: maxUsage, 
        price 
      })

      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/services/${service.id}`;
      const token = await getCookies("token");
      
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
          Authorization: `Bearer ${token}`

        },
        body: JSON.stringify({
          name,
          min_usage: minUsage,
          max_usage: maxUsage,
          price,
        }),
      })

      console.log("📊 [handleSubmit] Response status:", response.status)
      
      // Check content type first
      const contentType = response.headers.get("content-type")
      let data
      
      if (contentType?.includes("application/json")) {
        data = await response.json()
        console.log("📄 [handleSubmit] JSON response:", data)
      } else {
        const text = await response.text()
        console.error("❌ [handleSubmit] Non-JSON response:", text.substring(0, 200))
        throw new Error("Server returned invalid response (not JSON). Please check the API endpoint.")
      }

      if (!response.ok) {
        console.error("❌ [handleSubmit] API error:", data)
        throw new Error(data.message || `Failed to update service (Status: ${response.status})`)
      }

      console.log("✅ [handleSubmit] Success! Service updated")
      setSuccess("Service updated successfully!")
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/admin/services")
        router.refresh()
      }, 2000)

    } catch (err: any) {
      console.error("❌ [handleSubmit] Error:", err)
      setError(err.message || "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/admin/services")
  }

  const handleReset = () => {
    setName(service.name)
    setMinUsage(service.min_usage)
    setMaxUsage(service.max_usage)
    setPrice(service.price)
    setError("")
    setSuccess("")
  }

  // Test API endpoint button (for debugging)
  const testApiEndpoint = async () => {
    try {
      setLoading(true)
      console.log("🔧 [testApiEndpoint] Testing endpoint for service ID:", service.id)
      
      const response = await fetch(`/api/services/${service.id}`, {
        method: "GET",
      })
      
      const text = await response.text()
      console.log("🔧 [testApiEndpoint] Test response:", {
        status: response.status,
        contentType: response.headers.get("content-type"),
        body: text.substring(0, 500)
      })
      
      // Show detailed alert
      let alertMessage = `API Test Results:\n\n`
      alertMessage += `Status: ${response.status}\n`
      alertMessage += `Content-Type: ${response.headers.get("content-type")}\n\n`
      alertMessage += `First 500 characters:\n${text.substring(0, 500)}`
      
      if (text.includes("<!DOCTYPE")) {
        alertMessage += `\n\n⚠️ WARNING: HTML detected! API might be returning error page.`
      }
      
      alert(alertMessage)
    } catch (error: any) {
      console.error("❌ [testApiEndpoint] Failed:", error)
      alert(`API test failed:\n\n${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Services
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Service</h1>
            <p className="text-gray-600 mt-2">
              Update the service details below. ID: <span className="font-semibold">#{service.id}</span>
            </p>
          </div>
          <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
            <div className="font-medium">Created:</div>
            <div>{formatDate(service.createdAt)}</div>
          </div>
        </div>
      </div>

      {/* Debug Panel (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-yellow-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Debug Information
            </h3>
            <button
              onClick={testApiEndpoint}
              className="text-xs px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors flex items-center gap-1"
              disabled={loading}
            >
              <RefreshCw className="h-3 w-3" />
              Test API
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2 bg-white rounded border">
              <div className="font-medium">Service ID</div>
              <code className="text-gray-700">#{service.id}</code>
            </div>
            <div className="p-2 bg-white rounded border">
              <div className="font-medium">Last Updated</div>
              <div>{formatDate(service.updatedAt)}</div>
            </div>
            <div className="p-2 bg-white rounded border">
              <div className="font-medium">Owner Token</div>
              <code className="text-gray-700 truncate">{service.owner_token.substring(0, 10)}...</code>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-green-100 rounded-full">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-green-800">Success!</h3>
              <p className="text-green-600 mt-1">{success}</p>
              <div className="mt-2 text-sm text-green-500 flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Redirecting to services page in 2 seconds...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-red-100 rounded-full">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-red-800">
                {error.includes("JSON") ? "API Response Error" : "Validation Error"}
              </h3>
              <p className="text-red-600 mt-1 whitespace-pre-wrap">{error}</p>
              
              {error.includes("JSON") || error.includes("API") ? (
                <div className="mt-3 p-3 bg-red-100 rounded-lg">
                  <h4 className="font-medium text-red-700 mb-2">Troubleshooting Steps:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                    <li>Check if backend server is running</li>
                    <li>Verify API endpoint <code>/api/services/{service.id}</code> exists</li>
                    <li>Ensure authentication token is valid</li>
                    <li>Check browser console for detailed logs</li>
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Service Information</h2>
              <p className="text-sm text-gray-600 mt-1">
                Fill in the details below to update this service
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-sm px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Reset to original
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Service Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Service Name *
                <span className="text-gray-400 text-xs ml-2">
                  {name.length}/100 characters
                </span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter service name"
                required
                maxLength={100}
              />
              {name !== service.name && (
                <div className="mt-1 text-xs text-blue-600 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Changed from original: "{service.name}"
                </div>
              )}
            </div>

            {/* Usage Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="minUsage" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Usage *
                  <span className="text-gray-400 text-xs ml-2">(0 - 1,000,000)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="minUsage"
                    value={minUsage}
                    onChange={(e) => setMinUsage(Number(e.target.value))}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="0"
                    min="0"
                    max="1000000"
                    required
                    step="1"
                  />
                  <div className="absolute right-3 top-3 text-gray-500 font-medium">
                    units
                  </div>
                </div>
                {minUsage !== service.min_usage && (
                  <div className="mt-1 text-xs text-blue-600">
                    Original: {service.min_usage.toLocaleString()} units
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="maxUsage" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Usage *
                  <span className="text-gray-400 text-xs ml-2">(1 - 10,000,000)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="maxUsage"
                    value={maxUsage}
                    onChange={(e) => setMaxUsage(Number(e.target.value))}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="1000"
                    min="1"
                    max="10000000"
                    required
                    step="1"
                  />
                  <div className="absolute right-3 top-3 text-gray-500 font-medium">
                    units
                  </div>
                </div>
                {maxUsage !== service.max_usage && (
                  <div className="mt-1 text-xs text-blue-600">
                    Original: {service.max_usage.toLocaleString()} units
                  </div>
                )}
              </div>
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price (IDR) *
                <span className="text-gray-400 text-xs ml-2">(1 - 1,000,000,000)</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-500 font-medium">
                  Rp
                </div>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="100000"
                  min="1"
                  max="1000000000"
                  required
                  step="1"
                />
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-sm text-gray-500">
                  Price per unit in Indonesian Rupiah
                </p>
                {price !== service.price && (
                  <div className="text-xs text-blue-600">
                    Original: Rp{service.price.toLocaleString('id-ID')}
                  </div>
                )}
              </div>
            </div>

            {/* Formatted Preview */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Preview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-white rounded-lg border">
                  <div className="text-gray-600 text-xs uppercase tracking-wider mb-1">Name</div>
                  <p className="font-medium text-gray-900 truncate">{name || "Not set"}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <div className="text-gray-600 text-xs uppercase tracking-wider mb-1">Usage Range</div>
                  <p className="font-medium text-gray-900">
                    {minUsage.toLocaleString()} - {maxUsage.toLocaleString()} units
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <div className="text-gray-600 text-xs uppercase tracking-wider mb-1">Price</div>
                  <p className="font-medium text-lg text-gray-900">
                    Rp{price.toLocaleString('id-ID')}
                    <span className="text-sm text-gray-600 ml-1">per unit</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-8 mt-8 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Update Service
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 px-6 py-3.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Quick Tips */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <div className="text-blue-600 font-bold text-xl mb-2">💡</div>
          <h4 className="font-medium text-gray-800 mb-2">Clear Naming</h4>
          <p className="text-sm text-gray-600">Use descriptive names that customers can easily understand</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
          <div className="text-green-600 font-bold text-xl mb-2">📊</div>
          <h4 className="font-medium text-gray-800 mb-2">Realistic Ranges</h4>
          <p className="text-sm text-gray-600">Set achievable usage limits based on customer needs</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
          <div className="text-purple-600 font-bold text-xl mb-2">💰</div>
          <h4 className="font-medium text-gray-800 mb-2">Competitive Pricing</h4>
          <p className="text-sm text-gray-600">Research market rates to set competitive yet profitable prices</p>
        </div>
      </div>
    </div>
  )
}