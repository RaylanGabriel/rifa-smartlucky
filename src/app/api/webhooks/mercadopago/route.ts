import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
export async function POST(request: Request) {
    const body = await request.json();
      const paymentid = body.data?.id;
    if (body.type === "payment" && paymentid) {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentid}`, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      });
      const paymentData = await response.json();
      if (paymentData.status === "approved") {
        const { error } = await supabase
          .from("payments")
          .update({ status: "approved", payment_info: paymentData })
          .eq("payment_id", paymentid);
        if (error) {
          console.error("Erro ao atualizar o pagamento:", error);
          return NextResponse.json({ message: "Erro ao atualizar o pagamento." }, { status: 500 });
        }
        return NextResponse.json({ message: "Pagamento atualizado com sucesso." }, { status: 200 });
      } 
      else {
        const { error } = await supabase
          .from("payments")
          .update({ status: paymentData.status, payment_info: paymentData })
          .eq("payment_id", paymentid);
        if (error) {
          console.error("Erro ao atualizar o pagamento:", error);
          return NextResponse.json({ message: "Erro ao atualizar o pagamento." }, { status: 500 });
        }
        return NextResponse.json({ message: "Pagamento atualizado com sucesso." }, { status: 200 });
      }
    }
    return NextResponse.json({ message: "Evento não tratado." }, { status: 400 });
}
