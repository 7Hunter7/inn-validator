import { validateKPP } from "../src/core/innValidator";

describe("kppValidator - Валидация КПП", () => {
  // ========== ТЕСТЫ НА ПУСТЫЕ ЗНАЧЕНИЯ ==========
  describe("Пустые значения", () => {
    test("должен возвращать ошибку для undefined", () => {
      const result = validateKPP(undefined);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("КПП не может быть пустым");
    });

    test("должен возвращать ошибку для null", () => {
      const result = validateKPP(null);
      expect(result.isValid).toBe(false);
    });

    test("должен возвращать ошибку для пустой строки", () => {
      const result = validateKPP("");
      expect(result.isValid).toBe(false);
    });
  });

  // ========== ТЕСТЫ НА ДЛИНУ ==========
  describe("Проверка длины", () => {
    test("должен принимать 9-значный КПП", () => {
      const result = validateKPP("770701001");
      expect(result.isValid).toBe(true);
    });

    test("должен возвращать ошибку для КПП короче 9 знаков", () => {
      const result = validateKPP("77070100");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("КПП должен содержать 9 знаков");
    });

    test("должен возвращать ошибку для КПП длиннее 9 знаков", () => {
      const result = validateKPP("7707010010");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("КПП должен содержать 9 знаков");
    });
  });

  // ========== ТЕСТЫ НА ФОРМАТ ==========
  describe("Проверка формата", () => {
    const validKPPs = [
      "770701001",
      "772201001",
      "502701001",
      "990900001",
      "1234AB123",
      "5678CD456",
      "9901ZZ999",
    ];

    test.each(validKPPs)("должен принимать валидный формат КПП: %s", (kpp) => {
      const result = validateKPP(kpp);
      expect(result.isValid).toBe(true);
    });

    const invalidFormats = [
      { kpp: "7707A1001", error: "буква не на месте" },
      { kpp: "A70701001", error: "буква в первой части" },
      { kpp: "77070100A", error: "буква в конце" },
      { kpp: "7707-01001", error: "дефис" },
      { kpp: "77 701001", error: "пробел" },
    ];

    test.each(invalidFormats)(
      "должен отклонять неверный формат: $error",
      ({ kpp }) => {
        const result = validateKPP(kpp);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe("Неверный формат КПП");
      },
    );
  });

  // ========== ТЕСТЫ НА ПРИЧИНУ ПОСТАНОВКИ (PP) ==========
  describe("Проверка причины постановки (PP)", () => {
    test("должен принимать российские коды (01-50)", () => {
      const result = validateKPP("770101001"); // PP = 01
      expect(result.isValid).toBe(true);
    });

    test("должен принимать российские коды до 50", () => {
      const result = validateKPP("775001001"); // PP = 50
      expect(result.isValid).toBe(true);
    });

    test("должен принимать иностранные коды (50-99)", () => {
      const result = validateKPP("775101001"); // PP = 51
      expect(result.isValid).toBe(true);
    });

    test("должен принимать иностранные коды до 99", () => {
      const result = validateKPP("779901001"); // PP = 99
      expect(result.isValid).toBe(true);
    });

    test("должен принимать буквенные коды", () => {
      const result = validateKPP("7701AB001"); // PP = AB
      expect(result.isValid).toBe(true);
    });

    test("должен отклонять недопустимые коды PP", () => {
      const result = validateKPP("770100001"); // PP = 00
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        "Неверный код причины постановки на учет",
      );
    });
  });

  // ========== РЕАЛЬНЫЕ ПРИМЕРЫ ==========
  describe("Реальные примеры", () => {
    const realKPPs = [
      "770701001", // Московская инспекция
      "772201001", // Московская область
      "502701001", // Московская область (Балашиха)
      "990900001", // Межрегиональная инспекция
    ];

    test.each(realKPPs)("должен принимать реальный КПП: %s", (kpp) => {
      const result = validateKPP(kpp);
      expect(result.isValid).toBe(true);
    });
  });
});
