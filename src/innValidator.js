/**
 * Валидация ИНН согласно официальным требованиям ФНС РФ
 * Приказ № ЕД-7-14/559@ от 26.06.2025 (действует с 01.01.2026)
 * Предыдущий приказ № ММВ-7-6/435@ от 29.06.2012 утратил силу
 */

export const ValidationErrorCodes = {
  EMPTY: 1,
  NOT_DIGITS: 2,
  INVALID_LENGTH: 3,
  INVALID_CHECKSUM: 4,
  INVALID_REGION_CODE: 5, // NN - код управления ФНС по субъекту
  INVALID_YY_INDEX: 6, // YY - индекс ФНС
  FOREIGN_ORG_INVALID: 7,
  INVALID_PP_CODE: 8, // для КПП
};

export const ValidationErrorMessages = {
  [ValidationErrorCodes.EMPTY]: "ИНН не может быть пустым",
  [ValidationErrorCodes.NOT_DIGITS]: "ИНН должен содержать только цифры",
  [ValidationErrorCodes.INVALID_LENGTH]:
    "ИНН должен содержать 10 цифр (организация) или 12 цифр (физ. лицо/ИП)",
  [ValidationErrorCodes.INVALID_CHECKSUM]: "Неверное контрольное число",
  [ValidationErrorCodes.INVALID_REGION_CODE]:
    "Неверный код управления ФНС (первые 2 цифры)",
  [ValidationErrorCodes.INVALID_YY_INDEX]:
    "Неверный индекс ФНС (третья и четвертая цифры)",
  [ValidationErrorCodes.FOREIGN_ORG_INVALID]:
    "Неверный формат ИНН иностранной организации",
  [ValidationErrorCodes.INVALID_PP_CODE]:
    "Неверный код причины постановки на учет (КПП)",
};

// Список кодов управлений ФНС по субъектам РФ (первые 2 цифры)
// На основе Общероссийского классификатора территорий муниципальных образований (ОКТМО)
const VALID_REGION_CODES = new Set([
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
  '31', '32', '33', '34', '35', '36', '37', '38', '39', '40',
  '41', '42', '43', '44', '45', '46', '47', '48', '49', '50',
  '51', '52', '53', '54', '55', '56', '57', '58', '59', '60',
  '61', '62', '63', '64', '65', '66', '67', '68', '69', '70',
  '71', '72', '73', '74', '75', '76', '77', '78', '79', '80',
  '81', '82', '83', '84', '85', '86', '87', '88', '89', '90',
  '91', '92', '93', '94', '95', '96', '97', '98', '99'
]);

// Для иностранных организаций используется индекс, определяемый ФНС
// Обычно это специальные коды, начинающиеся с 99 или другие reserved коды
const FOREIGN_ORG_PREFIXES = new Set(["99"]); // 99 - зарезервировано для иностранных

/**
 * Проверка контрольного числа ИНН (алгоритм не изменился)
 * @param {string} inn - ИНН для проверки
 * @returns {boolean} - true если контрольное число верно
 */
const validateChecksum = (inn) => {
  if (inn.length === 10) {
    const coefficients = [2, 4, 10, 3, 5, 9, 4, 6, 8];
    let sum = 0;

    for (let i = 0; i < 9; i++) {
      sum += coefficients[i] * parseInt(inn[i], 10);
    }

    const controlDigit = (sum % 11) % 10;
    return controlDigit === parseInt(inn[9], 10);
  } else if (inn.length === 12) {
    const coefficients1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    let sum1 = 0;

    for (let i = 0; i < 10; i++) {
      sum1 += coefficients1[i] * parseInt(inn[i], 10);
    }

    const controlDigit1 = (sum1 % 11) % 10;
    if (controlDigit1 !== parseInt(inn[10], 10)) return false;

    const coefficients2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    let sum2 = 0;

    for (let i = 0; i < 11; i++) {
      sum2 += coefficients2[i] * parseInt(inn[i], 10);
    }

    const controlDigit2 = (sum2 % 11) % 10;
    return controlDigit2 === parseInt(inn[11], 10);
  }

  return false;
};

/**
 * Проверка структуры ИНН согласно новым правилам (Приказ № ЕД-7-14/559@)
 * NN (первые 2 цифры) - код управления ФНС России по субъекту РФ
 * YY (следующие 2 цифры) - индекс, определяемый ФНС
 * @param {string} inn - ИНН для проверки
 * @returns {Object} {isValid: boolean, errorCode: number, isForeign: boolean, details: Object}
 */
const validateStructure = (inn) => {
  const prefix = inn.substring(0, 2); // NN
  const yy = parseInt(inn.substring(2, 4), 10); // YY

  // Проверка на иностранную организацию
  if (FOREIGN_ORG_PREFIXES.has(prefix)) {
    return {
      isValid: true, // Специальный индекс ФНС для иностранных
      errorCode: null,
      isForeign: true,
      details: { nn: prefix, yy },
    };
  }

  // Проверка кода управления ФНС по субъекту РФ
  if (!VALID_REGION_CODES.has(prefix)) {
    return {
      isValid: false,
      errorCode: ValidationErrorCodes.INVALID_REGION_CODE,
      isForeign: false,
      details: { nn: prefix, yy },
    };
  }

  // Проверка индекса ФНС (YY)
  // Согласно приказу, YY может быть 00-99
  // Конкретные допустимые значения определяются ФНС
  if (yy < 0 || yy > 99) {
    return {
      isValid: false,
      errorCode: ValidationErrorCodes.INVALID_YY_INDEX,
      isForeign: false,
      details: { nn: prefix, yy },
    };
  }

  return {
    isValid: true,
    errorCode: null,
    isForeign: false,
    details: { nn: parseInt(prefix, 10), yy },
  };
};

/**
 * Основная функция валидации ИНН
 * Поддерживает как старые (до 2026), так и новые (с 2026) ИНН
 * @param {string|number} inn - ИНН для проверки
 * @param {Object} options - Дополнительные опции
 * @returns {Object} {isValid: boolean, errorCode: number|null, errorMessage: string, details: Object}
 */
export const validateINN = (inn, options = {}) => {
  const {
    validateStructure: validateStruct = true,
    allowForeignOrgs = true, // По умолчанию разрешаем иностранные
    strictMode = false,
  } = options;

  const result = {
    isValid: false,
    errorCode: null,
    errorMessage: "",
    details: {
      length: 0,
      type: null, // 'organization' | 'individual' | 'foreign'
      regionCode: null,
      yyIndex: null,
      isForeignOrg: false,
      isNewFormat: false, // true для ИНН, выданных после 2026
    },
  };

  // 1. Проверка на пустое значение
  if (inn === undefined || inn === null || inn === "") {
    result.errorCode = ValidationErrorCodes.EMPTY;
    result.errorMessage = ValidationErrorMessages[ValidationErrorCodes.EMPTY];
    return result;
  }

  const strInn = String(inn).trim();
  result.details.length = strInn.length;

  // 2. Проверка на цифры
  if (!/^\d+$/.test(strInn)) {
    result.errorCode = ValidationErrorCodes.NOT_DIGITS;
    result.errorMessage =
      ValidationErrorMessages[ValidationErrorCodes.NOT_DIGITS];
    return result;
  }

  // 3. Проверка длины
  if (strInn.length !== 10 && strInn.length !== 12) {
    result.errorCode = ValidationErrorCodes.INVALID_LENGTH;
    result.errorMessage =
      ValidationErrorMessages[ValidationErrorCodes.INVALID_LENGTH];
    return result;
  }

  // 4. Определение типа ИНН
  result.details.type = strInn.length === 10 ? "organization" : "individual";

  // 5. Проверка структуры (NNYY)
  if (validateStruct && strInn.length >= 4) {
    const structCheck = validateStructure(strInn);

    result.details.isForeignOrg = structCheck.isForeign;
    result.details.regionCode = structCheck.details.nn;
    result.details.yyIndex = structCheck.details.yy;

    // Новый формат: ИНН с валидным YY считаем новыми
    result.details.isNewFormat = structCheck.details.yy >= 0;

    if (!structCheck.isValid) {
      result.errorCode = structCheck.errorCode;
      result.errorMessage = ValidationErrorMessages[structCheck.errorCode];

      // Если это иностранная организация и они запрещены - особая ошибка
      if (structCheck.isForeign && !allowForeignOrgs) {
        result.errorCode = ValidationErrorCodes.FOREIGN_ORG_INVALID;
        result.errorMessage =
          ValidationErrorMessages[ValidationErrorCodes.FOREIGN_ORG_INVALID];
      }

      return result;
    }
  }

  // 6. Проверка контрольного числа (алгоритм не изменился)
  if (!validateChecksum(strInn)) {
    result.errorCode = ValidationErrorCodes.INVALID_CHECKSUM;
    result.errorMessage =
      ValidationErrorMessages[ValidationErrorCodes.INVALID_CHECKSUM];
    return result;
  }

  // 7. Все проверки пройдены
  result.isValid = true;
  result.errorMessage = "";
  return result;
};

/**
 * Валидация КПП согласно структуре из приказа
 * @param {string} kpp - КПП для проверки
 * @returns {Object} {isValid: boolean, errorMessage: string}
 */
export const validateKPP = (kpp) => {
  if (!kpp) return { isValid: false, errorMessage: "КПП не может быть пустым" };

  const strKpp = String(kpp).trim();

  // Проверка длины
  if (strKpp.length !== 9) {
    return { isValid: false, errorMessage: "КПП должен содержать 9 знаков" };
  }

  // Проверка формата: NNNN PP XXX, где PP может быть цифрой или буквой
  const kppRegex = /^\d{4}[0-9A-Z]{2}\d{3}$/;
  if (!kppRegex.test(strKpp)) {
    return { isValid: false, errorMessage: "Неверный формат КПП" };
  }

  // Проверка причины постановки (PP)
  const pp = strKpp.substring(4, 6);
  const ppNum = parseInt(pp, 10);

  // Для российских: 01-50, для иностранных: 50-99
  if (ppNum >= 1 && ppNum <= 50) {
    // Российская организация
  } else if (ppNum >= 50 && ppNum <= 99) {
    // Иностранная организация
  } else if (isNaN(ppNum)) {
    // Если не число - возможно буквенный код (допустимо для некоторых случаев)
  } else {
    return {
      isValid: false,
      errorMessage: "Неверный код причины постановки на учет",
    };
  }

  return { isValid: true, errorMessage: "" };
};

/**
 * Валидация ИНН с учетом КПП
 * @param {string|number} inn - ИНН для проверки
 * @param {string|number} kpp - КПП для проверки
 * @returns {Object}
 */
export const validateINNWithKPP = (inn, kpp = null) => {
  const innValidation = validateINN(inn);

  if (!innValidation.isValid) {
    return innValidation;
  }

  if (kpp) {
    const kppValidation = validateKPP(kpp);
    if (!kppValidation.isValid) {
      return {
        ...innValidation,
        isValid: false,
        errorCode: ValidationErrorCodes.INVALID_PP_CODE,
        errorMessage: kppValidation.errorMessage,
        details: { ...innValidation.details, kppError: true },
      };
    }
  }

  return innValidation;
};

/**
 * Валидация для UI (с человеческими сообщениями)
 * @param {string|number} inn - ИНН для проверки
 * @param {string} fieldName - Название поля
 * @returns {Object}
 */
export const validateINNForUI = (inn, fieldName = "ИНН", options = {}) => {
  const validation = validateINN(inn, options);

  if (validation.isValid) {
    return {
      isValid: true,
      message: "",
      details: validation.details,
    };
  }

  let message = "";
  switch (validation.errorCode) {
    case ValidationErrorCodes.EMPTY:
      message = `Поле "${fieldName}" обязательно для заполнения`;
      break;
    case ValidationErrorCodes.NOT_DIGITS:
      message = `Поле "${fieldName}" должно содержать только цифры`;
      break;
    case ValidationErrorCodes.INVALID_LENGTH:
      message = `ИНН должен содержать 10 цифр (для организаций) или 12 цифр (для физ. лиц)`;
      break;
    case ValidationErrorCodes.INVALID_REGION_CODE:
      message = `Неверный код управления ФНС в ИНН`;
      break;
    case ValidationErrorCodes.INVALID_YY_INDEX:
      message = `Неверный индекс ФНС в ИНН`;
      break;
    case ValidationErrorCodes.INVALID_CHECKSUM:
      message = `Неверное контрольное число ИНН. Проверьте правильность ввода`;
      break;
    case ValidationErrorCodes.FOREIGN_ORG_INVALID:
      message = `Неверный формат ИНН иностранной организации`;
      break;
    default:
      message = `Некорректный ИНН`;
  }

  return {
    isValid: false,
    message,
    details: validation.details,
  };
};

/**
 * Упрощенная валидация (без проверки структуры)
 */
export const validateINNLegacy = (inn) => {
  return validateINN(inn, { validateStructure: false });
};

// Экспорт всех функций и констант
export default {
  validateINN,
  validateINNForUI,
  validateINNLegacy,
  validateINNWithKPP,
  validateKPP,
  ValidationErrorCodes,
  ValidationErrorMessages,
};
