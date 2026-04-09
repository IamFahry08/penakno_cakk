// app/admin/customers/edit/[id]/page.tsx
import { getCookies } from "@/helper/cookies";
import FormCustomer from "./form";

export interface Customer {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  address: string;
  service_id: number;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: number;
  name: string;
}

// Fetch single customer
async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/customers/${id}`;
    const token = await getCookies("token");

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
        Authorization: `Bearer ${token}`,
      },
    });

    const responseText = await response.text();
    if (responseText.trim().startsWith("<!DOCTYPE") || responseText.trim().startsWith("<html")) {
      console.error("Backend returned HTML instead of JSON");
      return null;
    }

    if (!response.ok) {
      console.error("HTTP error:", response.status);
      return null;
    }

    const responseData = JSON.parse(responseText);
    if (!responseData.success) {
      console.error("API error:", responseData.message);
      return null;
    }

    return responseData.data;
  } catch (error) {
    console.error("Error fetching customer:", error);
    return null;
  }
}

// Fetch list of services for dropdown
async function getServices(): Promise<Service[]> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/services`;
    const token = await getCookies("token");

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
        Authorization: `Bearer ${token}`,
      },
    });

    const responseText = await response.text();
    if (responseText.trim().startsWith("<!DOCTYPE") || responseText.trim().startsWith("<html")) {
      console.error("Backend returned HTML instead of JSON");
      return [];
    }

    if (!response.ok) {
      console.error("HTTP error fetching services:", response.status);
      return [];
    }

    const responseData = JSON.parse(responseText);
    if (!responseData.success) {
      console.error("API error fetching services:", responseData.message);
      return [];
    }

    return responseData.data; // expecting array of services with id and name
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCustomerPage({ params }: PageProps) {
  const { id } = await params;
  const [customer, services] = await Promise.all([getCustomerById(id), getServices()]);

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-red-200">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.795-.833-2.565 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Customer Not Found</h2>
            <p className="text-gray-600 mb-4">
              The customer you're trying to edit doesn't exist or could not be loaded.
            </p>
            <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left">
              <h3 className="font-medium text-gray-700 mb-2">Troubleshooting Steps:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Check if the customer ID <code className="bg-gray-200 px-2 py-1 rounded">#{id}</code> is correct</li>
                <li>Verify backend server is running</li>
                <li>Check your authentication token</li>
                <li>Ensure API endpoint <code>/customers/{id}</code> exists</li>
              </ol>
            </div>
            <div className="space-y-3">
              <a
                href="/admin/customers"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Customers List
              </a>
              <a
                href="/admin/customers/add"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Customer
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <FormCustomer customer={customer} services={services} />
    </div>
  );
}