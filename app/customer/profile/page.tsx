import { getCookies } from "@/helper/cookies";

export interface ResponseCustomerProfile {
  success: boolean;
  message: string;
  data: Customer;
}

export interface Customer {
  id: number;
  user_id: number;
  customer_number: string;
  name: string;
  phone: string;
  address: string;
  service_id: number;
  owner_token: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
  owner_token: string;
  createdAt: string;
  updatedAt: string;
}

async function getCustomerProfile(): Promise<Customer | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/customers/me`;
    const response = await fetch(url, {
      method: `GET`,
      headers: {
        "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
        Authorization: `Bearer ${await getCookies(`token`)}`,
      },
    });
    const responseData: ResponseCustomerProfile = await response.json();
    if (!response.ok) {
      console.error("Failed to fetch customer profile:", responseData.message);
      return null;
    }
    return responseData.data;

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    return null;
  }
}

export default async function ProfilePage() {
  const customerProfile = await getCustomerProfile();
  if (customerProfile == null) {
    return (
      <div className="w-full h-dvh flex items-center justify-center">
        sory masseh
      </div>
    );
  }
  return (
    <div className="w-full p-5">
      <div className="w-full rounded bg-blue-50 p-6">
        <h1 className="text-2xl font-bold text-blue-800 mb-6">
          Customer Profile
        </h1>

        <div className="space-y-4">
          <div className="grid grid-cols-12 items-center">
            <span className="col-span-3 font-semibold">ID</span>
            <span className="col-span-9">{customerProfile.id}</span>
          </div>
          <hr />

          <div className="grid grid-cols-12 items-center">
            <span className="col-span-3 font-semibold">Customer Number</span>
            <span className="col-span-9">
              {customerProfile.customer_number}
            </span>
          </div>
          <hr />

          <div className="grid grid-cols-12 items-center">
            <span className="col-span-3 font-semibold">Name</span>
            <span className="col-span-9">{customerProfile.name}</span>
          </div>
          <hr />

          <div className="grid grid-cols-12 items-center">
            <span className="col-span-3 font-semibold">Phone</span>
            <span className="col-span-9">{customerProfile.phone}</span>
          </div>
          <hr />

          <div className="grid grid-cols-12 items-center">
            <span className="col-span-3 font-semibold">Address</span>
            <span className="col-span-9">{customerProfile.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
