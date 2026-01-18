import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const paymentid = body.data?.id || body.id;

    if (paymentid) {
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentid}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          },
        },
      );

      if (response.ok) {
        const paymentData = await response.json();

        const { error } = await supabase
          .from("rifas")
          .update({
            status: paymentData.status,
            payment_info: paymentData,
          })
          .eq("payment_id", String(paymentid));

        if (error) {
          console.error("Erro Supabase:", error);
          return NextResponse.json(
            { message: "Erro no banco" },
            { status: 500 },
          );
        }
      }
    }

    return NextResponse.json({ message: "Recebido" }, { status: 200 });
  } catch (err) {
    console.error("Erro Webhook:", err);
    return NextResponse.json({ message: "Erro interno" }, { status: 200 });
  }
}
