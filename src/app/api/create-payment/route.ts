import { NextResponse } from "next/server";

interface CreatePaymentBody {
  nome: string;
  numeros: number[];
  valorTotal: number;
  deviceId?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreatePaymentBody;

    const { nome, numeros, valorTotal, deviceId } = body;

    if (!nome || !Array.isArray(numeros) || numeros.length === 0 || !valorTotal) {
      return NextResponse.json(
        { error: "Dados incompletos ou inválidos" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        transaction_amount: Number(valorTotal),
        payment_method_id: "pix",
        description: `Rifa SmartLucky - Números: ${numeros.join(", ")}`,
        external_reference: `RIFAS-${Date.now()}`,
        notification_url:
          "https://rifa-smartlucky.vercel.app/api/webhooks/mercadopago",
        payer: {
          email: "raylankuenca1@gmail.com", 
          first_name: nome,
        },
        device_id: deviceId, 
      }),
    });

    const data: unknown = await response.json();

    if (!response.ok) {
      console.error("Erro MP:", data);
      return NextResponse.json(
        { error: "Erro ao criar pagamento" },
        { status: response.status }
      );
    }

    const mpData = data as {
      id: number;
      point_of_interaction: {
        transaction_data: {
          qr_code: string;
          qr_code_base64: string;
        };
      };
    };

    return NextResponse.json({
      id: mpData.id,
      qr_code: mpData.point_of_interaction.transaction_data.qr_code,
      qr_code_base64:
        mpData.point_of_interaction.transaction_data.qr_code_base64,
    });
  } catch (error) {
    console.error("Erro interno:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar pagamento" },
      { status: 500 }
    );
  }
}
