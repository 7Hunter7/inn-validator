/**
 * Миксин для валидации полей формы
 * Универсальная версия для использования в любых Vue-проектах
 */

import { validateINNForUI } from "../core/innValidator";

export const formValidationMixin = {
  data() {
    return {
      // Динамическая структура для любых полей
      formValidation: {
        fields: {}, // { fieldName: { error: '', isValid: false, value: '' } }
        isFormValid: false,
      },
    };
  },

  methods: {
    /**
     * Регистрация поля для валидации
     * @param {string} fieldName - Имя поля
     * @param {Object} options - Опции валидации
     */
    registerField(fieldName, options = {}) {
      if (!this.formValidation.fields[fieldName]) {
        this.$set(this.formValidation.fields, fieldName, {
          error: "",
          isValid: false,
          value: "",
          type: options.type || "inn", // 'inn', 'kpp', etc.
          label: options.label || fieldName,
          required: options.required ?? true,
          touched: false,
        });
      }
    },

    /**
     * Валидация поля ИНН
     * @param {string} fieldName - Имя поля
     * @param {string} value - Значение
     * @param {Object} options - Опции валидации
     * @returns {Object} Результат валидации
     */
    validateINNField(fieldName, value, options = {}) {
      // Автоматическая регистрация поля, если не зарегистрировано
      if (!this.formValidation.fields[fieldName]) {
        this.registerField(fieldName, { type: "inn", ...options });
      }

      const field = this.formValidation.fields[fieldName];
      field.value = value;
      field.touched = true;

      const validation = validateINNForUI(
        value,
        options.fieldLabel || field.label,
        options,
      );

      field.error = validation.message;
      field.isValid = validation.isValid;

      // Эмитим событие для родительских компонентов
      this.$emit("field-validation", {
        field: fieldName,
        isValid: validation.isValid,
        value,
        error: validation.message,
        details: validation.details,
      });

      this._checkFormValidity();
      return validation;
    },

    /**
     * Валидация поля КПП
     * @param {string} fieldName - Имя поля
     * @param {string} value - Значение
     * @returns {Object} Результат валидации
     */
    validateKPPField(fieldName, value) {
      if (!this.formValidation.fields[fieldName]) {
        this.registerField(fieldName, { type: "kpp", label: "КПП" });
      }

      const field = this.formValidation.fields[fieldName];
      field.value = value;
      field.touched = true;

      // Импортируем validateKPP если нужно
      import("../core/innValidator").then(({ validateKPP }) => {
        const validation = validateKPP(value);
        field.error = validation.errorMessage;
        field.isValid = validation.isValid;

        this.$emit("field-validation", {
          field: fieldName,
          isValid: validation.isValid,
          value,
          error: validation.errorMessage,
        });

        this._checkFormValidity();
      });
    },

    /**
     * Валидация пары ИНН + КПП
     * @param {Object} data - { inn: '', kpp: '' }
     * @returns {Object} Результат
     */
    validateINNWithKPP(data) {
      const { inn, kpp } = data;

      // Валидируем оба поля
      this.validateINNField("inn", inn);
      if (kpp !== undefined) {
        this.validateKPPField("kpp", kpp);
      }

      // Проверяем совместную валидацию
      const innField = this.formValidation.fields["inn"];
      const kppField = this.formValidation.fields["kpp"];

      if (innField?.isValid && (!kpp || kppField?.isValid)) {
        this.formValidation.isFormValid = true;
        return { isValid: true, inn, kpp };
      }

      return { isValid: false, inn, kpp };
    },

    /**
     * Проверка валидности всей формы
     * @private
     */
    _checkFormValidity() {
      const fields = Object.values(this.formValidation.fields);

      // Проверяем все зарегистрированные поля
      this.formValidation.isFormValid = fields.every((field) => {
        // Если поле обязательное - должно быть валидным
        if (field.required) return field.isValid;
        // Если необязательное - либо валидно, либо пустое
        return field.isValid || !field.value;
      });
    },

    /**
     * Получение ошибки поля
     * @param {string} fieldName
     * @returns {string}
     */
    getFieldError(fieldName) {
      return this.formValidation.fields[fieldName]?.error || "";
    },

    /**
     * Проверка, было ли поле "тронуто"
     * @param {string} fieldName
     * @returns {boolean}
     */
    isFieldTouched(fieldName) {
      return this.formValidation.fields[fieldName]?.touched || false;
    },

    /**
     * Проверка валидности поля
     * @param {string} fieldName
     * @returns {boolean}
     */
    isFieldValid(fieldName) {
      return this.formValidation.fields[fieldName]?.isValid || false;
    },

    /**
     * Сброс валидации формы
     */
    resetFormValidation() {
      this.formValidation.fields = {};
      this.formValidation.isFormValid = false;
    },

    /**
     * Сброс конкретного поля
     * @param {string} fieldName
     */
    resetField(fieldName) {
      if (this.formValidation.fields[fieldName]) {
        this.formValidation.fields[fieldName] = {
          ...this.formValidation.fields[fieldName],
          error: "",
          isValid: false,
          value: "",
          touched: false,
        };
      }
      this._checkFormValidity();
    },

    /**
     * Получение всех данных формы
     * @returns {Object}
     */
    getFormData() {
      const data = {};
      Object.entries(this.formValidation.fields).forEach(([key, field]) => {
        data[key] = field.value;
      });
      return data;
    },

    /**
     * Проверка, можно ли отправлять форму
     * @returns {boolean}
     */
    canSubmit() {
      return this.formValidation.isFormValid;
    },
  },

  computed: {
    /**
     * Компьютед для удобства в шаблоне
     */
    validationState() {
      return {
        isValid: this.formValidation.isFormValid,
        fields: this.formValidation.fields,
        getError: this.getFieldError,
        isTouched: this.isFieldTouched,
        isValidField: this.isFieldValid,
      };
    },
  },
};

export default formValidationMixin;
