import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { raw } = await req.json();

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json({ ok: false, error: "未配置 OPENAI_API_KEY（不配置也能用，只是没有自动解读）" });
    }

    // 用 OpenAI 的 Chat Completions 方式（简单、兼容性好）
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "你是传统命理讲解员，语言风格偏中式讲课口吻、直白、有比喻，但不得声称自己是倪海厦本人或其官方观点。输出仅供学习与娱乐参考，不构成医疗、投资或法律建议。不要编造命盘字段，必须基于用户提供的JSON。"
          },
          {
            role: "user",
            content:
              "下面是八字排盘接口的原始JSON，请你用通俗、可执行的方式总结“主要运势”。请按结构输出：\n" +
              "1) 总论（格局与性格倾向）\n" +
              "2) 事业/财运/感情/健康（每项3-6条要点）\n" +
              "3) 未来1-3年提醒（以可行动建议为主）\n\n" +
              "命盘JSON：\n" +
              JSON.stringify(raw).slice(0, 18000) // 防止过长
          }
        ]
      })
    });

    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content?.trim();

    if (!text) return NextResponse.json({ ok: false, error: "模型未返回内容" });

    return NextResponse.json({ ok: true, text });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "未知错误" }, { status: 500 });
  }
}
