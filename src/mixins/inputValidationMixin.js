/**
 * Миксин для валидации отдельного поля ввода
 */

import { validateINNForUI } from "../core/innValidator";

export const inputValidationMixin = {
  props: {
    // Тип валидации
    validationType: {
      type: String,
      default: "inn", // 'inn', 'kpp', 'none'
      validator: (value) => ["inn", "kpp", "none"].includes(value),
    },
    // Название поля для сообщений
    fieldLabel: {
      type: String,
      default: "ИНН",
    },
    // Дополнительные опции валидации
    validationOptions: {
      type: Object,
      default: () => ({}),
    },
    // Мгновенная валидация при вводе
    validateOnInput: {
      type: Boolean,
      default: false,
    },
    // Показывать ошибку сразу или только после blur
    showErrorImmediately: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      inputState: {
        isValid: false,
        errorMessage: "",
        isTouched: false,
        isDirty: false,
        value: "",
        details: null,
      },
    };
  },

  computed: {
    /**
     * Показывать ли ошибку
     */
    shouldShowError() {
      if (!this.inputState.errorMessage) return false;
      if (this.showErrorImmediately) return true;
      return this.inputState.isTouched || this.inputState.isDirty;
    },

    /**
     * CSS классы для поля
     */
    inputClasses() {
      return {
        "is-valid": this.inputState.isValid && this.inputState.isDirty,
        "is-invalid": this.shouldShowError,
        "is-touched": this.inputState.isTouched,
      };
    },
  },

  methods: {
    /**
     * Валидация значения
     * @param {string} value - Значение для валидации
     * @returns {Object} Результат валидации
     */
    validate(value) {
      this.inputState.value = value;
      this.inputState.isDirty = true;

      if (this.validationType === "none" || !this.validationType) {
        this.inputState.isValid = true;
        this.inputState.errorMessage = "";
        this._emitValidation(true, value);
        return { isValid: true };
      }

      if (this.validationType === "inn") {
        return this._validateINN(value);
      }

      if (this.validationType === "kpp") {
        return this._validateKPP(value);
      }

      return { isValid: true };
    },

    /**
     * Валидация ИНН
     * @private
     */
    _validateINN(value) {
      const validation = validateINNForUI(
        value,
        this.fieldLabel,
        this.validationOptions,
      );

      this.inputState.isValid = validation.isValid;
      this.inputState.errorMessage = validation.message;
      this.inputState.details = validation.details;

      this._emitValidation(validation.isValid, value, validation);
      return validation;
    },

    /**
     * Валидация КПП
     * @private
     */
    async _validateKPP(value) {
      try {
        const { validateKPP } = await import("../core/innValidator");
        const validation = validateKPP(value);

        this.inputState.isValid = validation.isValid;
        this.inputState.errorMessage = validation.errorMessage;

        this._emitValidation(validation.isValid, value, validation);
        return validation;
      } catch (error) {
        console.error("Error validating KPP:", error);
        return { isValid: false, errorMessage: "Ошибка валидации" };
      }
    },

    /**
     * Эмит событий
     * @private
     */
    _emitValidation(isValid, value, details = null) {
      this.$emit("validation", {
        isValid,
        value,
        error: this.inputState.errorMessage,
        field: this.$attrs.id || "field",
        details,
      });

      this.$emit(isValid ? "valid" : "invalid", value);
    },

    /**
     * Обработчик input события
     * @param {Event} event
     */
    onInput(event) {
      const value = event.target.value;
      this.inputState.value = value;

      if (this.validateOnInput) {
        this.validate(value);
      }

      this.$emit("input", value);
    },

    /**
     * Обработчик blur события
     * @param {Event} event
     */
    onBlur(event) {
      this.inputState.isTouched = true;

      // При потере фокуса всегда валидируем
      this.validate(event.target.value);

      this.$emit("blur", event);
    },

    /**
     * Обработчик focus события
     * @param {Event} event
     */
    onFocus(event) {
      this.$emit("focus", event);
    },

    /**
     * Очистка поля
     */
    clear() {
      this.inputState.value = "";
      this.inputState.isValid = false;
      this.inputState.errorMessage = "";
      this.inputState.isDirty = false;
      this.inputState.isTouched = false;

      this._emitValidation(false, "");
      this.$emit("clear");
    },

    /**
     * Сброс состояния валидации
     */
    resetValidation() {
      this.inputState.isValid = false;
      this.inputState.errorMessage = "";
      this.inputState.isTouched = false;
      this.inputState.isDirty = false;
      this.inputState.details = null;
    },

    /**
     * Принудительная установка ошибки
     * @param {string} errorMessage
     */
    setError(errorMessage) {
      this.inputState.isValid = false;
      this.inputState.errorMessage = errorMessage;
      this.inputState.isTouched = true;
    },
  },
};

export default inputValidationMixin;
