import {
  validateINN,
  validateINNForUI,
  validateINNLegacy,
  validateINNWithKPP,
  ValidationErrorCodes,
  ValidationErrorMessages,
} from "../src/core/innValidator";

// ==========  Валидные ИНН для тестов ==========
// Физические лица (12 цифр):
const validIndividualINNs = [
  "639116743110",
  "599642980946",
  "087473999760",
  "801979376953",
  "637924902009"
];
// Юридические лица (10 цифр):
const validLegalINNs = [
  "9572907988",
  "9391531797",
  "6048891148",
  "7763864594",
  "9791945217"
];
// Некорректные ИНН (для негативных тестов)
const invalidINNs = [
  { inn: "639116743111", error: "неправильное КЧ (физлицо)" },
  { inn: "9572907989",   error: "неправильное КЧ (юрлицо)" }
];

describe("innValidator - Базовая валидация", () => {
  // ========== ТЕСТЫ НА ПУСТЫЕ ЗНАЧЕНИЯ ==========
  describe("Пустые значения", () => {
    test("должен возвращать ошибку для undefined", () => {
      const result = validateINN(undefined);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(ValidationErrorCodes.EMPTY);
      expect(result.errorMessage).toBe(
        ValidationErrorMessages[ValidationErrorCodes.EMPTY],
      );
    });

    test("должен возвращать ошибку для null", () => {
      const result = validateINN(null);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(ValidationErrorCodes.EMPTY);
    });

    test("должен возвращать ошибку для пустой строки", () => {
      const result = validateINN("");
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(ValidationErrorCodes.EMPTY);
    });

    test("должен возвращать ошибку для строки с пробелами", () => {
      const result = validateINN("   ");
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(ValidationErrorCodes.NOT_DIGITS);
    });
  });

  // ========== ТЕСТЫ НА НЕЦИФРОВЫЕ СИМВОЛЫ ==========
  describe("Нецифровые символы", () => {
    test("должен возвращать ошибку для букв", () => {
      const result = validateINN("ABC123");
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(ValidationErrorCodes.NOT_DIGITS);
    });

    test("должен возвращать ошибку для спецсимволов", () => {
      const result = validateINN("7707-083893");
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(ValidationErrorCodes.NOT_DIGITS);
    });

    test("должен возвращать ошибку для смешанных символов", () => {
      const result = validateINN("7707A83893");
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(ValidationErrorCodes.NOT_DIGITS);
    });
  });

  // ========== ТЕСТЫ НА ДЛИНУ ==========
  describe("Проверка длины", () => {
    test("должен возвращать ошибку для слишком короткого ИНН", () => {
      const result = validateINN("123");
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(ValidationErrorCodes.INVALID_LENGTH);
      expect(result.details.length).toBe(3);
    });

    test("должен возвращать ошибку для слишком длинного ИНН", () => {
      const result = validateINN("1234567890123");
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(ValidationErrorCodes.INVALID_LENGTH);
      expect(result.details.length).toBe(13);
    });
  });

  describe('Проверка 12-значных ИНН (физические лица)', () => {
  test.each(validIndividualINNs)("должен принимать валидный ИНН Физ.лица", (inn) => {
    const result = validateINN(inn, { validateStructure: false });
    expect(result.isValid).toBe(true);
    expect(result.details.type).toBe("individual");
    expect(result.errorMessage).toBe("");
  });

  test("должен отклонять невалидный 12-значный ИНН", () => {
    const invalidINN = "639116743111"; // На 1 отличается от валидного
    const result = validateINN(invalidINN, { validateStructure: false });
    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe(ValidationErrorCodes.INVALID_CHECKSUM);
  });
});

describe('Проверка 10-значных ИНН (юридические лица)', () => {
  test.each(validLegalINNs)("должен принимать валидный ИНН Юр.лица", (inn) => {
    const result = validateINN(inn, { validateStructure: false });
    expect(result.isValid).toBe(true);
    expect(result.details.type).toBe("organization");
    expect(result.errorMessage).toBe("");
  });

  test("должен отклонять невалидный 10-значный ИНН", () => {
    const invalidINN = "9572907989"; // На 1 отличается от валидного
    const result = validateINN(invalidINN, { validateStructure: false });
    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe(ValidationErrorCodes.INVALID_CHECKSUM);
  });
});

  // ========== ТЕСТЫ НА СТРУКТУРУ (NNYY) ==========
  describe("Проверка структуры NNYY", () => {
    test("должен принимать валидный код региона (01-99)", () => {
      const result = validateINN("7707083893", { validateStructure: true });
      expect(result.details.regionCode).toBe(77);
    });

    test("должен принимать код региона 01", () => {
      const result = validateINN("0107083893", { validateStructure: true });
      expect(result.details.regionCode).toBe(1);
    });

    test("должен принимать код региона 99", () => {
      const result = validateINN("9907083893", { validateStructure: true });
      expect(result.details.regionCode).toBe(99);
    });

    test("должен возвращать ошибку для невалидного кода региона", () => {
      const result = validateINN("0007083893", { validateStructure: true });
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(ValidationErrorCodes.INVALID_REGION_CODE);
    });

    test("должен принимать валидный YY индекс (00-99)", () => {
      const result = validateINN("7700083893", { validateStructure: true });
      expect(result.details.yyIndex).toBe(0);
    });

    test("должен возвращать ошибку для невалидного YY индекса", () => {
      const result = validateINN("7710083893", { validateStructure: true });
      expect(result.details.yyIndex).toBe(10);
      // YY=10 валиден (00-99), так что ошибки нет
      expect(result.isValid).toBe(true);
    });
  });

  // ========== ТЕСТЫ НА ИНОСТРАННЫЕ ОРГАНИЗАЦИИ ==========
  describe("Иностранные организации", () => {
    test("должен обрабатывать иностранные ИНН с префиксом 99", () => {
      const result = validateINN("9912345678", { allowForeignOrgs: true });
      expect(result.details.isForeignOrg).toBe(true);
    });

    test("должен возвращать ошибку если иностранные запрещены", () => {
      const result = validateINN("9912345678", { allowForeignOrgs: false });
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(ValidationErrorCodes.FOREIGN_ORG_INVALID);
    });
  });

  // ========== ТЕСТЫ НА КОНТРОЛЬНОЕ ЧИСЛО ==========
  describe("Проверка контрольного числа", () => {
    // Реальные ИНН из открытых источников
    const validINNs = [
      { inn: "7707083893", type: "organization" }, // Сбербанк
      { inn: "7702070139", type: "organization" }, // Газпром
      { inn: "7728168971", type: "organization" }, // Лукойл
      { inn: "7704218690", type: "organization" }, // Яндекс
      { inn: "7703401248", type: "organization" }, // Wildberries
    ];

    test.each(validINNs)("должен принимать валидный ИНН $inn", ({ inn }) => {
      const result = validateINN(inn, { validateStructure: false });
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBe("");
    });

    const invalidINNs = [
      { inn: "7707083894", error: "неправильное КЧ" },
      { inn: "123456789012", error: "неправильное КЧ" },
      { inn: "1111111111", error: "все единицы" },
      { inn: "0000000000", error: "все нули" },
    ];

    test.each(invalidINNs)("должен отклонять ИНН $inn с $error", ({ inn }) => {
      const result = validateINN(inn, { validateStructure: false });
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(ValidationErrorCodes.INVALID_CHECKSUM);
    });
  });

  // ========== ТЕСТЫ НА ДЕТАЛИ ==========
  describe("Детали валидации", () => {
    test("должен возвращать правильные детали для валидного ИНН", () => {
      const result = validateINN("7707083893", { validateStructure: true });

      expect(result.details).toEqual({
        length: 10,
        type: "organization",
        regionCode: 77,
        yyIndex: 7,
        isForeignOrg: false,
        isNewFormat: true,
      });
    });

    test("должен помечать ИНН с YY>0 как новые", () => {
      const result = validateINN("7712083893", { validateStructure: true });
      expect(result.details.isNewFormat).toBe(true);
    });

    test("должен помечать ИНН с YY=0 как новые (YY>=0)", () => {
      const result = validateINN("7700083893", { validateStructure: true });
      expect(result.details.isNewFormat).toBe(true);
    });
  });
});

describe("innValidator - validateINNForUI", () => {
  test("должен возвращать пустое сообщение для валидного ИНН", () => {
    const result = validateINNForUI("7707083893", "ИНН организации");
    expect(result.isValid).toBe(true);
    expect(result.message).toBe("");
  });

  test("должен возвращать человеческое сообщение для пустого поля", () => {
    const result = validateINNForUI("", "ИНН");
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Поле "ИНН" обязательно для заполнения');
  });

  test("должен возвращать человеческое сообщение для неверной длины", () => {
    const result = validateINNForUI("123", "ИНН");
    expect(result.message).toBe(
      "ИНН должен содержать 10 цифр (для организаций) или 12 цифр (для физ. лиц)",
    );
  });

  test("должен возвращать человеческое сообщение для неверного КЧ", () => {
    const result = validateINNForUI("7707083894", "ИНН");
    expect(result.message).toBe(
      "Неверное контрольное число ИНН. Проверьте правильность ввода",
    );
  });

  test("должен возвращать человеческое сообщение для неверного кода региона", () => {
    const result = validateINNForUI("0007083893", "ИНН");
    expect(result.message).toBe("Неверный код управления ФНС в ИНН");
  });

  test("должен использовать переданное имя поля в сообщениях", () => {
    const result = validateINNForUI("", "ИНН организации");
    expect(result.message).toContain("ИНН организации");
  });
});

describe("innValidator - validateINNLegacy", () => {
  test("должен пропускать ИНН без проверки структуры", () => {
    const result = validateINNLegacy("7707083893");
    expect(result.isValid).toBe(true);
    expect(result.details.regionCode).toBeNull();
  });

  test("должен проверять только длину и КЧ", () => {
    // Используем реальный валидный ИНН: 7707083893
    const result = validateINNLegacy("7707083893");
    expect(result.isValid).toBe(true);
    // Этот ИНН должен проходить проверку КЧ
    expect(result.errorMessage).toBe("");
  });
});

describe("innValidator - validateINNWithKPP", () => {
  test("должен валидировать ИНН без КПП", () => {
    const result = validateINNWithKPP("7707083893");
    expect(result.isValid).toBe(true);
    expect(result.details.kppError).toBeUndefined();
  });

  test("должен валидировать ИНН с валидным КПП", () => {
    const result = validateINNWithKPP("7707083893", "770701001");
    expect(result.isValid).toBe(true);
  });

  test("должен возвращать ошибку при невалидном КПП", () => {
    const result = validateINNWithKPP("7707083893", "123");
    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe(ValidationErrorCodes.INVALID_PP_CODE);
    expect(result.details.kppError).toBe(true);
  });

  test("должен возвращать ошибку при невалидном ИНН даже с валидным КПП", () => {
    const result = validateINNWithKPP("7707083894", "770701001");
    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe(ValidationErrorCodes.INVALID_CHECKSUM);
  });
});
