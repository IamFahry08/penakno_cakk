import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return Response.json(
        {
          success: false,
          message: "User is not authenticated",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/services`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    return Response.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("POST /api/services error:", error);

    return Response.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { getCookies } from '@/helper/cookies';

// PUT handler for updating a service
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("🔄 [API PUT] Starting update request")
  
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log("📦 [API PUT] Service ID:", id)
    console.log("📦 [API PUT] Request body:", body)
    
    // Get authentication token
    const token = await getCookies("token");
    if (!token) {
      console.error("❌ [API PUT] No authentication token found")
      return NextResponse.json(
        { 
          success: false, 
          message: 'Authentication required. Please login again.' 
        },
        { status: 401 }
      );
    }

    // Validate request body
    if (!body.name || !body.min_usage || !body.max_usage || !body.price) {
      console.error("❌ [API PUT] Missing required fields")
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required fields: name, min_usage, max_usage, price' 
        },
        { status: 400 }
      );
    }

    // Check environment variables
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const appKey = process.env.NEXT_PUBLIC_APP_KEY;
    
    if (!baseUrl) {
      console.error("❌ [API PUT] NEXT_PUBLIC_BASE_URL is not set")
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!appKey) {
      console.warn("⚠️ [API PUT] NEXT_PUBLIC_APP_KEY is not set")
    }

    const apiUrl = `${baseUrl}/services/${id}`;
    console.log("📡 [API PUT] Forwarding to backend:", apiUrl)
    
    // Make request to backend
    const backendResponse = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'APP-KEY': appKey || '',
      },
      body: JSON.stringify(body),
    });

    console.log("📊 [API PUT] Backend response status:", backendResponse.status)
    
    // Get response as text first
    const responseText = await backendResponse.text();
    console.log("📄 [API PUT] Backend response (first 500 chars):", responseText.substring(0, 500))
    
    // Check if response is HTML (error page)
    if (responseText.trim().startsWith("<!DOCTYPE") || 
        responseText.trim().startsWith("<html") ||
        responseText.trim().startsWith("<")) {
      console.error("❌ [API PUT] Backend returned HTML instead of JSON")
      return NextResponse.json(
        { 
          success: false, 
          message: 'Backend server error: returned HTML page instead of JSON response' 
        },
        { status: 502 }
      );
    }

    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText);
      
      if (!backendResponse.ok) {
        console.error("❌ [API PUT] Backend API error:", data)
        return NextResponse.json(
          { 
            success: false, 
            message: data.message || `Backend error: ${backendResponse.status}` 
          },
          { status: backendResponse.status }
        );
      }

      console.log("✅ [API PUT] Successfully updated service")
      return NextResponse.json({
        success: true,
        message: 'Service updated successfully',
        data: data.data || data,
      });
      
    } catch (jsonError) {
      // If not JSON, return the raw response
      console.error("❌ [API PUT] Failed to parse backend response as JSON:", jsonError)
      return NextResponse.json(
        { 
          success: false, 
          message: `Invalid backend response: ${responseText.substring(0, 100)}...` 
        },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error("❌ [API PUT] Unexpected error:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Internal server error. Please try again.' 
      },
      { status: 500 }
    );
  }
}

// GET handler for debugging
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("🔍 [API GET] Starting GET request")
  
  try {
    const { id } = await params;
    console.log("🔍 [API GET] Service ID:", id)
    
    const token = await getCookies("token");
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const appKey = process.env.NEXT_PUBLIC_APP_KEY;
    
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_BASE_URL is not configured' },
        { status: 500 }
      );
    }
    
    const apiUrl = `${baseUrl}/services/${id}`;
    console.log("🔍 [API GET] Fetching from:", apiUrl)
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'APP-KEY': appKey || '',
      },
    });
    
    const text = await response.text();
    console.log("🔍 [API GET] Response status:", response.status)
    console.log("🔍 [API GET] Response body preview:", text.substring(0, 300))
    
    // Return the response as-is for debugging
    return new NextResponse(text, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'text/plain',
      },
    });
  } catch (error: any) {
    console.error("❌ [API GET] Error:", error)
    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}