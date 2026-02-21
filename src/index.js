/**
 * inn-validator-rf
 * Валидация ИНН и КПП согласно требованиям ФНС РФ
 */

// Ядро
export {
  validateINN,
  validateINNForUI,
  validateINNLegacy,
  validateINNWithKPP,
  validateKPP,
  ValidationErrorCodes,
  ValidationErrorMessages,
} from "./core/innValidator";

// Vue миксины
export { formValidationMixin } from "./vue/formValidationMixin";
export { inputValidationMixin } from "./vue/inputValidationMixin";

// Версия
export const VERSION = "1.0.0";

// Плагин для Vue
export default {
  install(app, options = {}) {
    // Можно добавить глобальные методы если нужно
    app.config.globalProperties.$innValidator = {
      validateINN,
      validateKPP,
    };
  },
};
