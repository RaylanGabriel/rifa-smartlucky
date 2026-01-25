import { NextResponse } from "next/server";

type CreatePaymentBody = {
  nome: string;
  numeros: number[];
  valorTotal: number;
};

export async function POST(req: Request) {
  try {
    // 1️⃣ Lê o body da requisição
    const body = (await req.json()) as CreatePaymentBody;

    const { nome, numeros, valorTotal } = body;

    // 2️⃣ Validação correta (SEM any)
    if (
      typeof nome !== "string" ||
      !Array.isArray(numeros) ||
      numeros.length === 0 ||
      typeof valorTotal !== "number"
    ) {
      return NextResponse.json(
        { error: "Dados inválidos enviados" },
        { status: 400 }
      );
    }

    // 3️⃣ Chamada ao Mercado Pago (PIX)
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
          transaction_amount: valorTotal,
          description: `Rifa SmartLucky - Números: ${numeros.join(", ")}`,
          payment_method_id: "pix",
          external_reference: `RIFAS-${Date.now()}`,
          notification_url:
            "https://rifa-smartlucky.vercel.app/api/webhooks/mercadopago",

          // ⚠️ Email NÃO precisa vir do front
          payer: {
            email: "raylankuenca1@gmail.com",
            first_name: nome,
          },
        }),
      }
    );

    const data = await response.json();

    // 4️⃣ Erro vindo do Mercado Pago
    if (!response.ok) {
      console.error("Erro Mercado Pago:", data);
      return NextResponse.json(
        { error: data.message ?? "Erro ao criar pagamento" },
        { status: response.status }
      );
    }

    // 5️⃣ Retorno esperado pelo frontend
    return NextResponse.json({
      id: data.id,
      qr_code: data.point_of_interaction.transaction_data.qr_code,
      qr_code_base64:
        data.point_of_interaction.transaction_data.qr_code_base64,
    });
  } catch (error) {
    console.error("Erro create-payment:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
