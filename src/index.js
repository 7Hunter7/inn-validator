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
export { formValidationMixin } from "./mixins/formValidationMixin";
export { inputValidationMixin } from "./mixins/inputValidationMixin";

// Версия
export const VERSION = "1.1.1";

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
