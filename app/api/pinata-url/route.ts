import { NextResponse, type NextRequest } from "next/server";
import { uploadFile, type PinataConfig } from "pinata";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    console.log("=== Pinata Upload API Called ===");
    console.log("Environment check:");
    console.log("PINATA_JWT exists:", !!process.env.PINATA_JWT);
    console.log("PINATA_JWT length:", process.env.PINATA_JWT?.length || 0);
    console.log("NEXT_PUBLIC_GATEWAY_URL:", process.env.NEXT_PUBLIC_GATEWAY_URL);
    
    const data = await request.formData();
    console.log("FormData received");
    
    const file: File | null = data.get("file") as unknown as File;
    
    if (!file) {
      console.error("No file in form data");
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    console.log("File details:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!process.env.PINATA_JWT) {
      console.error("PINATA_JWT is not set in environment variables");
      return NextResponse.json(
        { error: "Server configuration error: PINATA_JWT not set" },
        { status: 500 }
      );
    }

    const config: PinataConfig = {
      pinataJwt: process.env.PINATA_JWT,
      pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL,
    };

    console.log("Pinata config created, attempting upload with standalone uploadFile function...");
    
    // Use the standalone uploadFile function
    const upload = await uploadFile(config, file, "public");
    console.log("Upload successful:", upload);
    
    return NextResponse.json({ cid: upload.cid }, { status: 200 });
  } catch (error: any) {
    console.error("=== Pinata Upload Error ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);
    
    return NextResponse.json(
      { 
        error: "Failed to upload file to Pinata", 
        message: error?.message || String(error),
        type: error?.constructor?.name,
      },
      { status: 500 }
    );
  }
}
