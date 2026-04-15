import { describe, it, expect } from "vitest";
import { STAGE_ORDER, STAGE_LABELS } from "@/types";
import type { ConversationStage } from "@/types";

describe("Types & Constants", () => {
  it("STAGE_ORDER 应包含 6 个阶段", () => {
    expect(STAGE_ORDER).toHaveLength(6);
  });

  it("STAGE_ORDER 顺序应正确", () => {
    expect(STAGE_ORDER).toEqual([
      "understand_background",
      "scope_splitting",
      "clarify_requirements",
      "generate_solution",
      "confirm_convergence",
      "output_result",
    ]);
  });

  it("每个阶段都应有对应的中文标签", () => {
    for (const stage of STAGE_ORDER) {
      expect(STAGE_LABELS[stage]).toBeDefined();
      expect(typeof STAGE_LABELS[stage]).toBe("string");
      expect(STAGE_LABELS[stage].length).toBeGreaterThan(0);
    }
  });

  it("STAGE_LABELS 应包含正确的中文名", () => {
    expect(STAGE_LABELS.understand_background).toBe("了解背景");
    expect(STAGE_LABELS.scope_splitting).toBe("拆分范围");
    expect(STAGE_LABELS.clarify_requirements).toBe("逐项澄清");
    expect(STAGE_LABELS.generate_solution).toBe("方案可视化");
    expect(STAGE_LABELS.confirm_convergence).toBe("确认收敛");
    expect(STAGE_LABELS.output_result).toBe("输出结果");
  });

  it("STAGE_LABELS 不应有多余的键", () => {
    const keys = Object.keys(STAGE_LABELS) as ConversationStage[];
    expect(keys).toHaveLength(STAGE_ORDER.length);
    for (const key of keys) {
      expect(STAGE_ORDER).toContain(key);
    }
  });
});
