import { NextResponse } from "next/server";

interface CreatePaymentBody {
  nome: string;
  email: string;
  numeros: number[];
  valorTotal: number;
  deviceId: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreatePaymentBody;

    const { nome, email, numeros, valorTotal, deviceId } = body;

    // Validação básica
    if (!nome || !email || !numeros?.length || !valorTotal || !deviceId) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    // Criação do pagamento PIX
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
        statement_descriptor: "SMARTLUCKY",

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

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Mercado Pago:", data);
      return NextResponse.json(
        { error: data.message || "Erro ao criar pagamento" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      id: data.id,
      qr_code: data.point_of_interaction.transaction_data.qr_code,
      qr_code_base64:
        data.point_of_interaction.transaction_data.qr_code_base64,
    });
  } catch (error) {
    console.error("Erro interno:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar pagamento" },
      { status: 500 }
    );
  }
}
