/**
 * TypeScript definitions for inn-validator
 * Валидация ИНН и КПП согласно требованиям ФНС РФ
 */

declare module "inn-validator" {
  // ========== КОДЫ ОШИБОК ==========
  export enum ValidationErrorCodes {
    EMPTY = 1,
    NOT_DIGITS = 2,
    INVALID_LENGTH = 3,
    INVALID_CHECKSUM = 4,
    INVALID_REGION_CODE = 5,
    INVALID_YY_INDEX = 6,
    FOREIGN_ORG_INVALID = 7,
    INVALID_PP_CODE = 8,
  }

  // ========== СООБЩЕНИЯ ОБ ОШИБКАХ ==========
  export const ValidationErrorMessages: Record<ValidationErrorCodes, string>;

  // ========== ТИПЫ ДАННЫХ ==========
  export type InnType = "organization" | "individual" | "foreign";

  export interface InnValidationDetails {
    length: number;
    type: InnType | null;
    regionCode: number | null;
    yyIndex: number | null;
    isForeignOrg: boolean;
    isNewFormat: boolean;
    kppError?: boolean;
  }

  export interface InnValidationResult {
    isValid: boolean;
    errorCode: ValidationErrorCodes | null;
    errorMessage: string;
    details: InnValidationDetails;
  }

  export interface InnUIValidationResult {
    isValid: boolean;
    message: string;
    details: InnValidationDetails;
  }

  export interface KPPValidationResult {
    isValid: boolean;
    errorMessage: string;
  }

  export interface InnWithKPPResult extends InnValidationResult {
    kppValid?: boolean;
    kppError?: string;
  }

  // ========== ОПЦИИ ВАЛИДАЦИИ ==========
  export interface InnValidationOptions {
    validateStructure?: boolean;
    allowForeignOrgs?: boolean;
    strictMode?: boolean;
    fieldLabel?: string;
  }

  // ========== ОСНОВНЫЕ ФУНКЦИИ ==========

  /**
   * Основная функция валидации ИНН
   * @param inn - ИНН для проверки (строка или число)
   * @param options - дополнительные опции
   * @returns результат валидации
   *
   * @example
   * const result = validateINN('7707083893');
   * if (result.isValid) {
   *   console.log('ИНН корректен');
   * }
   */
  export function validateINN(
    inn: string | number,
    options?: InnValidationOptions,
  ): InnValidationResult;

  /**
   * Валидация для UI с человеческими сообщениями
   * @param inn - ИНН для проверки
   * @param fieldName - название поля (для сообщений)
   * @param options - дополнительные опции
   */
  export function validateINNForUI(
    inn: string | number,
    fieldName?: string,
    options?: InnValidationOptions,
  ): InnUIValidationResult;

  /**
   * Упрощенная валидация (без проверки структуры)
   * Для обратной совместимости со старыми ИНН
   */
  export function validateINNLegacy(inn: string | number): InnValidationResult;

  /**
   * Валидация КПП
   * @param kpp - КПП для проверки
   */
  export function validateKPP(kpp: string | number): KPPValidationResult;

  /**
   * Валидация ИНН с учетом КПП
   * @param inn - ИНН для проверки
   * @param kpp - КПП для проверки (опционально)
   */
  export function validateINNWithKPP(
    inn: string | number,
    kpp?: string | number | null,
  ): InnWithKPPResult;

  // ========== VUE МИКСИНЫ ==========

  export interface FormField {
    error: string;
    isValid: boolean;
    value: string;
    type: string;
    label: string;
    required: boolean;
    touched: boolean;
  }

  export interface FormValidationState {
    fields: Record<string, FormField>;
    isFormValid: boolean;
  }

  /**
   * Миксин для валидации форм
   */
  export const formValidationMixin: any;

  /**
   * Миксин для валидации полей ввода
   */
  export const inputValidationMixin: any;

  // ========== ПЛАГИН ДЛЯ VUE ==========
  export interface InnValidatorPlugin {
    install(app: any, options?: any): void;
    validateINN: typeof validateINN;
    validateKPP: typeof validateKPP;
  }

  const plugin: InnValidatorPlugin;
  export default plugin;

  // Версия
  export const VERSION: string;
}
