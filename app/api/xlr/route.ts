import { NextResponse } from "next/server";

const LIU = ["大安", "留连", "速喜", "赤口", "小吉", "空亡"] as const;

// 简化版：用“公历月/日 + 时辰”来跑通 MVP（先让产品可用）
// 若你要严格“农历月日”，下一步我再给你加一个免费库做换算（不需要你写代码）。
function hourToShiChenIndex(h: number): number {
  // 1-12 对应 子丑寅卯辰巳午未申酉戌亥
  // 简化：子时 23-0点。这里按常见区间：
  if (h === 23 || h === 0) return 1; // 子
  if (h === 1 || h === 2) return 2;  // 丑
  if (h === 3 || h === 4) return 3;  // 寅
  if (h === 5 || h === 6) return 4;  // 卯
  if (h === 7 || h === 8) return 5;  // 辰
  if (h === 9 || h === 10) return 6; // 巳
  if (h === 11 || h === 12) return 7;// 午
  if (h === 13 || h === 14) return 8;// 未
  if (h === 15 || h === 16) return 9;// 申
  if (h === 17 || h === 18) return 10;// 酉
  if (h === 19 || h === 20) return 11;// 戌
  return 12; // 亥 (21-22)
}

function interpret(result: string): string {
  const dict: Record<string, string> = {
    "大安": "主稳主静，宜守不宜躁：按部就班更顺。",
    "留连": "主拖主缠，事多反复：宜耐心沟通、别急着拍板。",
    "速喜": "主快主喜，有喜讯/进展：宜趁势而为，速办。",
    "赤口": "主口舌是非：宜谨言慎行，避争执与冲动决策。",
    "小吉": "主小成小利：宜做具体可落地的小动作，积小胜。",
    "空亡": "主落空/不实：宜核实信息，留后手，别孤注一掷。"
  };
  return dict[result] || "（暂无解读）";
}

export async function POST() {
  try {
    const d = new Date();
    const month = d.getMonth() + 1;     // 公历月（MVP）
    const dayIndex = d.getDate();       // 公历日（MVP）
    const hourIndex = hourToShiChenIndex(d.getHours());

    // 常见口径：“大安起正月，月上起日，日上起时”，六神顺行循环 :contentReference[oaicite:2]{index=2}
    const posMonth = (month - 1) % 6;
    const posDay = (posMonth + (dayIndex - 1)) % 6;
    const posHour = (posDay + (hourIndex - 1)) % 6;

    const result = LIU[posHour];

    const text =
      `起卦（MVP：按公历月日 + 时辰）\n` +
      `1) 月：从【大安】起数到【${month}月】 → 落【${LIU[posMonth]}】\n` +
      `2) 日：从【${LIU[posMonth]}】起数到【${dayIndex}日】 → 落【${LIU[posDay]}】\n` +
      `3) 时：从【${LIU[posDay]}】起数到【第${hourIndex}时辰】 → 落【${result}】\n\n` +
      `解读：${interpret(result)}\n\n` +
      `说明：这是最快可用的MVP口径；下一步可升级为“严格农历月日”。`;

    return NextResponse.json({
      ok: true,
      result: { month, dayIndex, hourIndex, monthPos: LIU[posMonth], dayPos: LIU[posDay], final: result },
      text
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "未知错误" }, { status: 500 });
  }
}
