import { mount } from "@vue/test-utils";
import {
  validateINN,
  validateINNForUI,
  validateINNWithKPP,
} from "../src/core/innValidator";
import { formValidationMixin } from "../src/mixins/formValidationMixin";
import { inputValidationMixin } from "../src/mixins/inputValidationMixin";

describe("Интеграция: Полный поток валидации", () => {
  test("ядро + миксины должны работать вместе", () => {
    // Проверяем, что все экспорты доступны
    expect(validateINN).toBeDefined();
    expect(validateINNForUI).toBeDefined();
    expect(validateINNWithKPP).toBeDefined();
    expect(formValidationMixin).toBeDefined();
    expect(inputValidationMixin).toBeDefined();
  });

  test("валидация ИНН + КПП в реальном сценарии", () => {
    const testData = [
      { inn: "7707083893", kpp: "770701001", expected: true }, // Сбербанк
      { inn: "7707083894", kpp: "770701001", expected: false }, // неверный ИНН
      { inn: "7707083893", kpp: "123", expected: false }, // неверный КПП
      { inn: "123", kpp: "770701001", expected: false }, // короткий ИНН
    ];

    testData.forEach(({ inn, kpp, expected }) => {
      const result = validateINNWithKPP(inn, kpp);
      expect(result.isValid).toBe(expected);
    });
  });

  test("UI сообщения должны быть понятными", () => {
    const testCases = [
      { input: "", expected: "обязательно для заполнения" },
      { input: "abc", expected: "только цифры" },
      { input: "123", expected: "10 или 12 цифр" },
      { input: "7707083894", expected: "контрольное число" },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = validateINNForUI(input, "ИНН");

      const message = result.message.toLowerCase();

      // Проверяем наличие ключевых слов, а не точную фразу
      if (input === "123") {
        expect(message).toContain("10");
        expect(message).toContain("12");
        expect(message).toContain("цифр");
      } else {
        expect(message).toContain(expected.toLowerCase());
      }
    });
  });
});

describe("Интеграция: Vue компонент с миксинами", () => {
  test("Form + Input миксины должны работать в реальном компоненте", () => {
    const TestForm = {
      mixins: [formValidationMixin],
      components: {
        InnInput: {
          mixins: [inputValidationMixin],
          props: ["value"],
          template: `
            <div>
              <input :value="value" @input="onInput" @blur="onBlur" />
              <span v-if="shouldShowError" class="error">{{ inputState.errorMessage }}</span>
            </div>
          `,
        },
      },
      template: `
        <form @submit.prevent="handleSubmit">
          <InnInput 
            v-model="formData.inn"
            validation-type="inn"
            field-label="ИНН"
            @validation="handleInnValidation"
          />
          <button type="submit" :disabled="!canSubmit()">Submit</button>
        </form>
      `,
      data() {
        return {
          formData: { inn: "" },
        };
      },
      methods: {
        handleInnValidation(result) {
          this.validateINNField("inn", result.value, { fieldLabel: "ИНН" });
        },
        handleSubmit() {
          if (this.canSubmit()) {
            this.$emit("submit", this.getFormData());
          }
        },
      },
    };

    const wrapper = mount(TestForm);

    // Начальное состояние
    expect(wrapper.vm.canSubmit()).toBe(false);

    // Ввод валидного ИНН
    const input = wrapper.find("input");
    input.setValue("7707083893");
    input.trigger("blur");

    // Ждем обновления
    return new Promise((resolve) => setTimeout(resolve, 100)).then(() => {
      expect(wrapper.vm.canSubmit()).toBe(true);

      // Сабмит формы
      wrapper.find("form").trigger("submit");
      expect(wrapper.emitted("submit")).toBeTruthy();
    });
  });
});
