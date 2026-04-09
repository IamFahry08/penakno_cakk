import { getCookies } from "@/helper/cookies";
import FormService from "./form";

export interface ServiceResponse {
  success: boolean;
  message: string;
  data: Service;
}

export interface Service {
  id: number;
  name: string;
  min_usage: number;
  max_usage: number;
  price: number;
  owner_token: string;
  createdAt: string;
  updatedAt: string;
}

async function getServiceById(service_id: string): Promise<Service | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/services/${service_id}`;
    
    // Debug logging
    console.log("📡 [getServiceById] Fetching from URL:", url);
    
    const token = await getCookies("token");
    console.log("🔑 [getServiceById] Token exists:", !!token);
    
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("📊 [getServiceById] Response status:", response.status);
    
    // Get response as text first
    const responseText = await response.text();
    console.log("📄 [getServiceById] Response text (first 300 chars):", responseText.substring(0, 300));
    
    // Check if response is HTML (error page)
    if (responseText.trim().startsWith("<!DOCTYPE") || 
        responseText.trim().startsWith("<html")) {
      console.error("❌ [getServiceById] Backend returned HTML instead of JSON");
      console.error("📄 HTML content:", responseText.substring(0, 500));
      return null;
    }

    if (!response.ok) {
      console.error("❌ [getServiceById] HTTP Error:", response.status, responseText);
      return null;
    }

    // Try to parse as JSON
    try {
      const responseData: ServiceResponse = JSON.parse(responseText);
      
      if (!responseData.success) {
        console.error("❌ [getServiceById] API error:", responseData.message);
        return null;
      }

      console.log("✅ [getServiceById] Successfully fetched service:", responseData.data.name);
      return responseData.data;
    } catch (jsonError) {
      console.error("❌ [getServiceById] Failed to parse JSON:", jsonError);
      console.error("📄 Raw response:", responseText);
      return null;
    }
  } catch (error) {
    console.error("❌ [getServiceById] Network error:", error);
    return null;
  }
}

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditServicePage({ params }: PageProps) {
  const { id } = await params;
  
  console.log("🔄 [EditServicePage] Loading service with ID:", id);
  
  const selectedService = await getServiceById(id);

  if (selectedService === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-red-200">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.795-.833-2.565 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Service Not Found</h2>
            <p className="text-gray-600 mb-4">
              The service you're trying to edit doesn't exist or could not be loaded.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left">
              <h3 className="font-medium text-gray-700 mb-2">Troubleshooting Steps:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Check if the service ID <code className="bg-gray-200 px-2 py-1 rounded">#{id}</code> is correct</li>
                <li>Verify backend server is running</li>
                <li>Check your authentication token</li>
                <li>Ensure API endpoint <code>/services/{id}</code> exists</li>
              </ol>
            </div>
            
            <div className="space-y-3">
              <a
                href="/admin/services"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Services List
              </a>
              <a
                href="/admin/services/add"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Service
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log("✅ [EditServicePage] Service loaded successfully:", selectedService.name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <FormService service={selectedService} />
    </div>
  );
}