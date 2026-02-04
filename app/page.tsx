"use client";

import { useMemo, useState } from "react";

type BaziResp = { ok: boolean; raw?: any; error?: string };
type XlrResp = { ok: boolean; result?: any; text?: string; error?: string };
type InterpretResp = { ok: boolean; text?: string; error?: string };

export default function Page() {
  const [active, setActive] = useState<"bazi" | "xlr">("bazi");

  // 八字表单
  const [name, setName] = useState("张三");
  const [sex, setSex] = useState<0 | 1>(0); // 0男 1女（你也可反过来，保持一致就行）
  const [year, setYear] = useState(1994);
  const [month, setMonth] = useState(12);
  const [day, setDay] = useState(3);
  const [hours, setHours] = useState(18);
  const [minute, setMinute] = useState(55);

  const [baziLoading, setBaziLoading] = useState(false);
  const [baziRaw, setBaziRaw] = useState<any>(null);
  const [baziText, setBaziText] = useState<string>("");

  // 小六壬
  const [xlrLoading, setXlrLoading] = useState(false);
  const [xlrText, setXlrText] = useState<string>("");

  const nowStr = useMemo(() => {
    const d = new Date();
    return d.toLocaleString("zh-CN", { hour12: false });
  }, []);

  async function doBazi() {
    setBaziLoading(true);
    setBaziRaw(null);
    setBaziText("");
    try {
      const r = await fetch("/api/bazi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sex, year, month, day, hours, minute })
      });
      const data: BaziResp = await r.json();
      if (!data.ok) throw new Error(data.error || "排盘失败");
      setBaziRaw(data.raw);

      // 可选：调用 /api/interpret 生成“师父口吻”解读（不想花钱就别配 OPENAI_API_KEY）
      const r2 = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw: data.raw })
      });
      const d2: InterpretResp = await r2.json();
      if (d2.ok && d2.text) setBaziText(d2.text);
      else setBaziText("（未启用自动解读：你可以先看下方原始排盘JSON；配置 OPENAI_API_KEY 后会自动生成解读）");
    } catch (e: any) {
      setBaziText("错误：" + (e?.message || "未知错误"));
    } finally {
      setBaziLoading(false);
    }
  }

  async function doXlr() {
    setXlrLoading(true);
    setXlrText("");
    try {
      const r = await fetch("/api/xlr", { method: "POST" });
      const data: XlrResp = await r.json();
      if (!data.ok) throw new Error(data.error || "起卦失败");
      setXlrText(data.text || JSON.stringify(data.result, null, 2));
    } catch (e: any) {
      setXlrText("错误：" + (e?.message || "未知错误"));
    } finally {
      setXlrLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>倪派命理助手（MVP）</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        仅供学习/娱乐参考，不构成医疗、投资或法律建议。
      </p>

      <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        <button onClick={() => setActive("bazi")} style={btnStyle(active === "bazi")}>八字</button>
        <button onClick={() => setActive("xlr")} style={btnStyle(active === "xlr")}>小六壬</button>
      </div>

      {active === "bazi" && (
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>八字排盘（缘份居）</h2>

          <div style={gridStyle}>
            <label style={labelStyle}>姓名
              <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
            </label>

            <label style={labelStyle}>性别
              <select value={sex} onChange={(e) => setSex(Number(e.target.value) as 0 | 1)} style={inputStyle}>
                <option value={0}>男</option>
                <option value={1}>女</option>
              </select>
            </label>

            <label style={labelStyle}>出生年
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} style={inputStyle} />
            </label>
            <label style={labelStyle}>月
              <input type="number" value={month} onChange={(e) => setMonth(Number(e.target.value))} style={inputStyle} />
            </label>
            <label style={labelStyle}>日
              <input type="number" value={day} onChange={(e) => setDay(Number(e.target.value))} style={inputStyle} />
            </label>
            <label style={labelStyle}>时（0-23）
              <input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} style={inputStyle} />
            </label>
            <label style={labelStyle}>分
              <input type="number" value={minute} onChange={(e) => setMinute(Number(e.target.value))} style={inputStyle} />
            </label>
          </div>

          <button onClick={doBazi} disabled={baziLoading} style={{ ...primaryStyle, marginTop: 12 }}>
            {baziLoading ? "排盘中…" : "开始排盘"}
          </button>

          <h3>解读（可选：配置 OPENAI_API_KEY 后自动生成）</h3>
          <pre style={preStyle}>{baziText || "（尚未生成）"}</pre>

          <h3>原始排盘 JSON（调试用）</h3>
          <pre style={preStyle}>{baziRaw ? JSON.stringify(baziRaw, null, 2) : "（尚无）"}</pre>
        </section>
      )}

      {active === "xlr" && (
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>小六壬（以当前时间起卦）</h2>
          <p style={{ marginTop: 0, opacity: 0.85 }}>当前时间：{nowStr}</p>

          <button onClick={doXlr} disabled={xlrLoading} style={primaryStyle}>
            {xlrLoading ? "起卦中…" : "一键起卦"}
          </button>

          <h3>结果</h3>
          <pre style={preStyle}>{xlrText || "（尚未起卦）"}</pre>
        </section>
      )}

      <footer style={{ marginTop: 24, opacity: 0.75, fontSize: 12 }}>
        提示：八字接口 Key、（可选）OpenAI Key 都只放在服务器环境变量里，不会暴露给用户浏览器。
      </footer>
    </main>
  );
}

function btnStyle(active: boolean): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ddd",
    background: active ? "#111" : "#fff",
    color: active ? "#fff" : "#111",
    cursor: "pointer"
  };
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #eee",
  borderRadius: 14,
  padding: 16,
  boxShadow: "0 8px 20px rgba(0,0,0,0.04)"
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12
};

const labelStyle: React.CSSProperties = { display: "grid", gap: 6, fontSize: 13 };
const inputStyle: React.CSSProperties = { padding: 10, borderRadius: 10, border: "1px solid #ddd" };
const primaryStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  cursor: "pointer"
};
const preStyle: React.CSSProperties = {
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  background: "#0b1020",
  color: "#e8eefc",
  padding: 12,
  borderRadius: 12,
  overflow: "auto",
  maxHeight: 360
};
