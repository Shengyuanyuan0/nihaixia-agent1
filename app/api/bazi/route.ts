import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const apiKey = process.env.YUANFENJU_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "未配置 YUANFENJU_API_KEY（在 Vercel 环境变量里设置）" }, { status: 400 });
    }

    // 缘份居：八字排盘接口（GET/POST，form 表单）
    // 接口地址：https://api.yuanfenju.com/index.php/v1/Bazi/paipan :contentReference[oaicite:1]{index=1}
    const url = "https://api.yuanfenju.com/index.php/v1/Bazi/paipan";

    // 常见字段：api_key, name, sex, type, year, month, day, hours, minute
    // type：是否真太阳时/排盘类型等，不同文档版本可能不同；这里先给默认 1
    const form = new URLSearchParams();
    form.set("api_key", apiKey);
    form.set("name", String(body.name ?? "匿名"));
    form.set("sex", String(body.sex ?? 0));
    form.set("type", String(body.type ?? 1));
    form.set("year", String(body.year));
    form.set("month", String(body.month));
    form.set("day", String(body.day));
    form.set("hours", String(body.hours));
    form.set("minute", String(body.minute ?? 0));
    form.set("sect", String(body.sect ?? 1));     // 可不传，默认1
form.set("zhen", String(body.zhen ?? 2));     // 可不传，默认2：不使用真太阳时
form.set("timezone", String(body.timezone ?? "Asia/Shanghai"));


    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString()
    });

    const data = await r.json();
    return NextResponse.json({ ok: true, raw: data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "未知错误" }, { status: 500 });
  }
}
