import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Max allowed image size: 10MB
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif']);

export interface GeminiVisionFields {
  product_name: string | null;
  net_quantity: string | null;
  mrp: string | null;
  usp: string | null;
  mfg_date: string | null;
  expiry_date: string | null;
  batch_number: string | null;
  manufacturer_address: string | null;
  marketed_by: string | null;
  consumer_care: string | null;
  country_of_origin: string | null;
  fssai_license: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing imageBase64 payload.' },
        { status: 400 }
      );
    }

    const cleanMimeType = (mimeType || 'image/jpeg').toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(cleanMimeType)) {
      return NextResponse.json(
        { error: `Unsupported image MIME type: ${cleanMimeType}. Allowed: JPEG, PNG, WebP, HEIC, GIF.` },
        { status: 400 }
      );
    }

    const approxBytes = Math.ceil((imageBase64.length * 3) / 4);
    if (approxBytes > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: `Image size exceeds 10MB limit (${(approxBytes / (1024 * 1024)).toFixed(2)}MB).` },
        { status: 413 }
      );
    }

    const prompt = `You are an expert Legal Metrology Rule 6 & Pharmaceutical Package Auditor.
Analyze the provided packaged-product label image and extract the following declarations EXACTLY as printed on the packaging:

1. product_name: The clear brand / product name (e.g. "TATA 1MG Healthcare Product", "Parle-G"). Do NOT include "Marketed By" or "Address" as product name!
2. net_quantity: Net weight, volume, or pack quantity (e.g. "3 x 10 Tablets = 30 Tablets", "500 g", "100 ml").
3. mrp: Maximum Retail Price including all taxes (e.g. "Rs. 155.00", "₹ 155.00"). CAUTION: Explicitly distinguish MRP from USP (Unit Sale Price) or wholesale prices. Look for "MRP", "Max. Retail Price".
4. usp: Unit Sale Price per tablet/unit if present (e.g. "Rs. 5.17 per Tablet").
5. mfg_date: Date of manufacturing / packing / MFD (e.g. "OCT/2025", "10/2025"). Preserve the EXACT printed string.
6. expiry_date: Best Before / Expiry date / Use By / EXP (e.g. "MAR/2027", "03/2027"). Preserve the EXACT printed string.
7. batch_number: Exact alphanumeric Batch / Lot number (e.g. "AQE25AR11", "B-90234"). Do NOT infer batch numbers from unrelated digits or nearby text.
8. manufacturer_address: Name and full postal address of the manufacturer or packer (e.g. "Maxcure Nutravedics Limited, Plot No. 13, Sector-6A, I.I.E., SIDCUL, Haridwar").
9. marketed_by: Name and address of the marketer / distributor (e.g. "TATA 1MG Healthcare Solutions Pvt. Ltd.").
10. consumer_care: Customer helpline / email / phone details (e.g. "care@1mg.com | +91-995-8932200").
11. country_of_origin: Country of origin (e.g. "India").
12. fssai_license: FSSAI License Number (e.g. "13321999000183" or "10016012000340").

CRITICAL GUARANTEE:
- Extract ONLY text visibly printed on the packaging.
- If a field is NOT visible or unreadable, set its JSON value to null.
- NEVER invent, infer, or fabricate missing values.
- Return ONLY valid JSON matching the schema.`;

    const candidateModels = [
      'gemini-1.5-flash',
      
      
      
    ];

    let lastError = 'No model succeeded';
    let rawContent: string | null = null;
    let selectedModel = '';

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    for (const model of candidateModels) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

      try {
        console.time(`Gemini API Request - ${model}`);
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType: cleanMimeType,
                      data: cleanBase64,
                    },
                  },
                  { text: prompt },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          }),
        });

        if (geminiRes.ok) {
          console.timeEnd(`Gemini API Request - ${model}`);
          const geminiJson = await geminiRes.json();
          const textPart = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textPart) {
            rawContent = textPart;
            selectedModel = model;
            break;
          }
        } else {
          const errText = await geminiRes.text();
          console.warn(`[Gemini Model Notice] Model ${model} returned ${geminiRes.status}:`, errText);
          lastError = `Status ${geminiRes.status}: ${errText}`;
        }
      } catch (err: any) {
        console.warn(`[Gemini Model Exception] Model ${model}:`, err.message);
        lastError = err.message;
      }
    }

    if (!rawContent) {
      return NextResponse.json(
        { error: `Gemini API vision calls failed. ${lastError}` },
        { status: 502 }
      );
    }

    let parsedFields: GeminiVisionFields;
    try {
      parsedFields = JSON.parse(rawContent);
    } catch {
      const cleanJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedFields = JSON.parse(cleanJson);
    }

    return NextResponse.json({
      model: selectedModel,
      fields: parsedFields,
    });
  } catch (err: any) {
    console.error('[AI Vision Route Exception]', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error processing vision API request.' },
      { status: 500 }
    );
  }
}
