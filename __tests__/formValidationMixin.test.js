import { mount } from "@vue/test-utils";
import { formValidationMixin } from "../src/mixins/formValidationMixin";

describe("formValidationMixin", () => {
  let wrapper;

  beforeEach(() => {
    const TestComponent = {
      mixins: [formValidationMixin],
      template: `<div>Test Component</div>`,
    };

    wrapper = mount(TestComponent);
  });

  afterEach(() => {
    wrapper.destroy();
  });

  test("должен инициализировать состояние формы", () => {
    expect(wrapper.vm.formValidation).toBeDefined();
    expect(wrapper.vm.formValidation.fields).toEqual({});
    expect(wrapper.vm.formValidation.isFormValid).toBe(false);
  });

  describe("registerField", () => {
    test("должен регистрировать новое поле", () => {
      wrapper.vm.registerField("inn", { label: "ИНН" });

      const field = wrapper.vm.formValidation.fields["inn"];
      expect(field).toBeDefined();
      expect(field.label).toBe("ИНН");
      expect(field.type).toBe("inn");
      expect(field.required).toBe(true);
      expect(field.touched).toBe(false);
    });

    test("должен использовать переданные опции", () => {
      wrapper.vm.registerField("test", {
        type: "custom",
        label: "Тест",
        required: false,
      });

      const field = wrapper.vm.formValidation.fields["test"];
      expect(field.type).toBe("custom");
      expect(field.label).toBe("Тест");
      expect(field.required).toBe(false);
    });

    test("не должен перезаписывать существующее поле", () => {
      wrapper.vm.registerField("inn", { label: "ИНН" });
      const field1 = wrapper.vm.formValidation.fields["inn"];

      wrapper.vm.registerField("inn", { label: "Другой" });
      const field2 = wrapper.vm.formValidation.fields["inn"];

      expect(field1).toBe(field2);
      expect(field2.label).toBe("ИНН"); // не изменилось
    });
  });

  describe("validateINNField", () => {
    test("должен автоматически регистрировать поле", () => {
      wrapper.vm.validateINNField("inn", "7707083893");

      expect(wrapper.vm.formValidation.fields["inn"]).toBeDefined();
    });

    test("должен валидировать корректный ИНН", () => {
      const result = wrapper.vm.validateINNField("inn", "7707083893");

      expect(result.isValid).toBe(true);
      expect(result.message).toBe("");

      const field = wrapper.vm.formValidation.fields["inn"];
      expect(field.isValid).toBe(true);
      expect(field.error).toBe("");
      expect(field.touched).toBe(true);
    });

    test("должен валидировать некорректный ИНН", () => {
      const result = wrapper.vm.validateINNField("inn", "123");

      expect(result.isValid).toBe(false);
      expect(result.message).toContain("10 или 12 цифр");

      const field = wrapper.vm.formValidation.fields["inn"];
      expect(field.isValid).toBe(false);
      expect(field.error).toContain("10 или 12 цифр");
    });

    test("должен эмитить событие field-validation", () => {
      wrapper.vm.validateINNField("inn", "7707083893");

      expect(wrapper.emitted("field-validation")).toBeTruthy();
      const event = wrapper.emitted("field-validation")[0][0];
      expect(event.field).toBe("inn");
      expect(event.isValid).toBe(true);
      expect(event.value).toBe("7707083893");
    });
  });

  describe("checkFormValidity", () => {
    test("должен считать форму валидной если все поля валидны", () => {
      wrapper.vm.registerField("inn", { required: true });
      wrapper.vm.formValidation.fields["inn"].isValid = true;

      wrapper.vm._checkFormValidity();
      expect(wrapper.vm.formValidation.isFormValid).toBe(true);
    });

    test("должен считать форму невалидной если есть невалидное поле", () => {
      wrapper.vm.registerField("inn", { required: true });
      wrapper.vm.formValidation.fields["inn"].isValid = false;

      wrapper.vm._checkFormValidity();
      expect(wrapper.vm.formValidation.isFormValid).toBe(false);
    });

    test("должен игнорировать необязательные пустые поля", () => {
      wrapper.vm.registerField("inn", { required: false });
      wrapper.vm.formValidation.fields["inn"].isValid = false;
      wrapper.vm.formValidation.fields["inn"].value = "";

      wrapper.vm._checkFormValidity();
      expect(wrapper.vm.formValidation.isFormValid).toBe(true);
    });
  });

  describe("getFieldError", () => {
    test("должен возвращать ошибку поля", () => {
      wrapper.vm.registerField("inn");
      wrapper.vm.formValidation.fields["inn"].error = "Ошибка тест";

      expect(wrapper.vm.getFieldError("inn")).toBe("Ошибка тест");
    });

    test("должен возвращать пустую строку для несуществующего поля", () => {
      expect(wrapper.vm.getFieldError("unknown")).toBe("");
    });
  });

  describe("resetFormValidation", () => {
    test("должен сбрасывать все поля", () => {
      wrapper.vm.registerField("inn");
      wrapper.vm.formValidation.fields["inn"].value = "test";
      wrapper.vm.formValidation.fields["inn"].isValid = true;

      wrapper.vm.resetFormValidation();

      expect(wrapper.vm.formValidation.fields).toEqual({});
      expect(wrapper.vm.formValidation.isFormValid).toBe(false);
    });
  });

  describe("resetField", () => {
    test("должен сбрасывать конкретное поле", () => {
      wrapper.vm.registerField("inn");
      wrapper.vm.formValidation.fields["inn"].value = "test";
      wrapper.vm.formValidation.fields["inn"].isValid = true;
      wrapper.vm.formValidation.fields["inn"].touched = true;

      wrapper.vm.resetField("inn");

      const field = wrapper.vm.formValidation.fields["inn"];
      expect(field.value).toBe("");
      expect(field.isValid).toBe(false);
      expect(field.touched).toBe(false);
    });
  });

  describe("getFormData", () => {
    test("должен возвращать все значения полей", () => {
      wrapper.vm.registerField("inn");
      wrapper.vm.registerField("kpp");

      wrapper.vm.formValidation.fields["inn"].value = "7707083893";
      wrapper.vm.formValidation.fields["kpp"].value = "770701001";

      const data = wrapper.vm.getFormData();
      expect(data).toEqual({
        inn: "7707083893",
        kpp: "770701001",
      });
    });
  });

  describe("canSubmit", () => {
    test("должен возвращать true если форма валидна", () => {
      wrapper.vm.formValidation.isFormValid = true;
      expect(wrapper.vm.canSubmit()).toBe(true);
    });

    test("должен возвращать false если форма невалидна", () => {
      wrapper.vm.formValidation.isFormValid = false;
      expect(wrapper.vm.canSubmit()).toBe(false);
    });
  });

  describe("validationState computed", () => {
    test("должен предоставлять удобный доступ к состоянию", () => {
      wrapper.vm.registerField("inn");
      wrapper.vm.formValidation.fields["inn"].error = "Ошибка";

      expect(wrapper.vm.validationState.getError("inn")).toBe("Ошибка");
      expect(wrapper.vm.validationState.isValid).toBe(false);
    });
  });
});
