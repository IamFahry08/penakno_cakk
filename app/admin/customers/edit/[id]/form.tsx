"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, AlertCircle, Check, RefreshCw } from "lucide-react";
import { getCookies } from "@/helper/cookies";
import { Customer } from "./page";

interface Service {
  id: number;
  name: string;
}

type Props = {
  customer: Customer;
  services: Service[];
};

export default function FormCustomer({ customer, services }: Props) {
  const [name, setName] = useState<string>(customer.name);
  const [phone, setPhone] = useState<string>(customer.phone || "");
  const [address, setAddress] = useState<string>(customer.address || "");
  const [serviceId, setServiceId] = useState<number>(customer.service_id);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const validateForm = (): boolean => {
    setError("");
    if (!name.trim()) {
      setError("Customer name is required");
      return false;
    }
    if (name.length > 100) {
      setError("Name cannot exceed 100 characters");
      return false;
    }
    if (phone && phone.replace(/\D/g, "").length > 15) {
      setError("Phone number cannot exceed 15 digits");
      return false;
    }
    if (address && address.length > 255) {
      setError("Address cannot exceed 255 characters");
      return false;
    }
    if (!serviceId || serviceId <= 0) {
      setError("Please select a valid service");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = await getCookies("token");
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/customers/${customer.id}`;

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          phone,
          address,
          service_id: serviceId,
        }),
      });

      const contentType = response.headers.get("content-type");
      let data;
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error("Server returned invalid response (not JSON).");
      }

      if (!response.ok) {
        throw new Error(data.message || `Failed to update customer (Status: ${response.status})`);
      }

      setSuccess("Customer updated successfully!");
      setTimeout(() => {
        router.push("/admin/customers");
        router.refresh();
      }, 2000);
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/customers");
  };

  const handleReset = () => {
    setName(customer.name);
    setPhone(customer.phone || "");
    setAddress(customer.address || "");
    setServiceId(customer.service_id);
    setError("");
    setSuccess("");
  };

  const testApiEndpoint = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/customers/${customer.id}`, { method: "GET" });
      const text = await response.text();
      alert(`API Test Results:\n\nStatus: ${response.status}\nContent-Type: ${response.headers.get("content-type")}\n\nFirst 500 chars:\n${text.substring(0, 500)}`);
    } catch (err: any) {
      alert(`API test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Customers
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Customer</h1>
            <p className="text-gray-600 mt-2">
              Update the customer details below. ID: <span className="font-semibold">#{customer.id}</span>
            </p>
          </div>
          <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
            <div className="font-medium">Created:</div>
            <div>{formatDate(customer.createdAt)}</div>
          </div>
        </div>
      </div>

      {/* Debug Panel (only in development) */}
      {process.env.NODE_ENV === "development" && (
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
              <div className="font-medium">Customer ID</div>
              <code className="text-gray-700">#{customer.id}</code>
            </div>
            <div className="p-2 bg-white rounded border">
              <div className="font-medium">User ID</div>
              <code>{customer.user_id}</code>
            </div>
            <div className="p-2 bg-white rounded border">
              <div className="font-medium">Last Updated</div>
              <div>{formatDate(customer.updatedAt)}</div>
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
                Redirecting to customers page in 2 seconds...
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
                    <li>Verify API endpoint <code>/api/customers/{customer.id}</code> exists</li>
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
              <h2 className="text-lg font-semibold text-gray-800">Customer Information</h2>
              <p className="text-sm text-gray-600 mt-1">
                Fill in the details below to update this customer
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
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name *
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
                placeholder="Enter customer name"
                required
                maxLength={100}
              />
              {name !== customer.name && (
                <div className="mt-1 text-xs text-blue-600 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Changed from original: "{customer.name}"
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="e.g., 081234567890"
              />
              {phone !== (customer.phone || "") && (
                <div className="mt-1 text-xs text-blue-600">
                  Original: {customer.phone || "(not set)"}
                </div>
              )}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter address"
              />
              {address !== (customer.address || "") && (
                <div className="mt-1 text-xs text-blue-600">
                  Original: {customer.address || "(not set)"}
                </div>
              )}
            </div>

            {/* Service ID - DROPDOWN */}
            <div>
              <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700 mb-2">
                Service *
              </label>
              <select
                id="serviceId"
                value={serviceId}
                onChange={(e) => setServiceId(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                required
              >
                <option value="" disabled>Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} (ID: {service.id})
                  </option>
                ))}
              </select>
              {serviceId !== customer.service_id && (
                <div className="mt-1 text-xs text-blue-600">
                  Changed from original: Service ID {customer.service_id}
                </div>
              )}
              {services.length === 0 && (
                <p className="mt-1 text-xs text-red-500">No services available. Please create a service first.</p>
              )}
            </div>

            {/* Preview Card */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Preview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-white rounded-lg border">
                  <div className="text-gray-600 text-xs uppercase tracking-wider mb-1">Name</div>
                  <p className="font-medium text-gray-900">{name || "(not set)"}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <div className="text-gray-600 text-xs uppercase tracking-wider mb-1">Phone</div>
                  <p className="font-medium text-gray-900">{phone || "(not set)"}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border md:col-span-2">
                  <div className="text-gray-600 text-xs uppercase tracking-wider mb-1">Address</div>
                  <p className="font-medium text-gray-900">{address || "(not set)"}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border md:col-span-2">
                  <div className="text-gray-600 text-xs uppercase tracking-wider mb-1">Service</div>
                  <p className="font-medium text-gray-900">
                    {services.find(s => s.id === serviceId)?.name || `ID: ${serviceId}`}
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
                  Update Customer
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
          <h4 className="font-medium text-gray-800 mb-2">Valid Phone Numbers</h4>
          <p className="text-sm text-gray-600">Use international format for consistency (e.g., +6281234567890)</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
          <div className="text-green-600 font-bold text-xl mb-2">📌</div>
          <h4 className="font-medium text-gray-800 mb-2">Complete Address</h4>
          <p className="text-sm text-gray-600">Include street, district, city, and postal code for accurate billing</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
          <div className="text-purple-600 font-bold text-xl mb-2">🆔</div>
          <h4 className="font-medium text-gray-800 mb-2">Service Selection</h4>
          <p className="text-sm text-gray-600">Choose the appropriate service that this customer subscribes to</p>
        </div>
      </div>
    </div>
  );
}