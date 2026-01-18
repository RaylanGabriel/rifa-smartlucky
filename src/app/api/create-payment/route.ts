import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { nome, numeros, valorTotal } = await req.json();
    if (!nome || !numeros || !valorTotal) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const response = await fetch(
      "https://api.mercadopago.com/v1/payments",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          "X-Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          transaction_amount: Number(valorTotal),
          description: `Rifa SmartLucky - Números: ${numeros.join(", ")}`,
          payment_method_id: "pix",
          notification_url: "https://rifa-smartlucky.vercel.app//api/webhooks/mercadopago",
          payer: {
            email: "test_user_123@testuser.com", 
            first_name: nome,
          },
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro MP:", data);
      return NextResponse.json(
        { error: data.message || "Erro no Mercado Pago" },
        { status: response.status },
      );
    }

    return NextResponse.json({
      id: data.id,
      qr_code: data.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: data.point_of_interaction.transaction_data.qr_code_base64,
    });
  } catch (error) {
    console.error("Erro na Rota:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar pagamento" },
      { status: 500 },
    );
  }
}
