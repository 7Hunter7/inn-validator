import { mount } from "@vue/test-utils";
import { inputValidationMixin } from "../../src/vue/inputValidationMixin";

describe("inputValidationMixin", () => {
  let wrapper;

  beforeEach(() => {
    const TestComponent = {
      mixins: [inputValidationMixin],
      props: ["value"],
      template: `
        <div>
          <input 
            :value="value" 
            @input="onInput" 
            @blur="onBlur"
            data-test="input"
          />
          <span v-if="shouldShowError" data-test="error">
            {{ inputState.errorMessage }}
          </span>
        </div>
      `,
    };

    wrapper = mount(TestComponent, {
      propsData: { value: "" },
    });
  });

  afterEach(() => {
    wrapper.destroy();
  });

  describe("props", () => {
    test("должен принимать validationType", () => {
      wrapper.setProps({ validationType: "inn" });
      expect(wrapper.props().validationType).toBe("inn");
    });

    test("должен принимать fieldLabel", () => {
      wrapper.setProps({ fieldLabel: "ИНН организации" });
      expect(wrapper.props().fieldLabel).toBe("ИНН организации");
    });

    test("должен принимать validateOnInput", () => {
      wrapper.setProps({ validateOnInput: true });
      expect(wrapper.props().validateOnInput).toBe(true);
    });
  });

  describe("validate", () => {
    test("должен валидировать ИНН", () => {
      wrapper.setProps({ validationType: "inn" });
      const result = wrapper.vm.validate("7707083893");

      expect(result.isValid).toBe(true);
      expect(wrapper.vm.inputState.isValid).toBe(true);
      expect(wrapper.vm.inputState.errorMessage).toBe("");
    });

    test("должен валидировать КПП", async () => {
      wrapper.setProps({ validationType: "kpp" });

      // Асинхронная валидация КПП
      await wrapper.vm.validate("770701001");

      expect(wrapper.vm.inputState.isValid).toBe(true);
    });

    test("должен пропускать валидацию если validationType = none", () => {
      wrapper.setProps({ validationType: "none" });
      const result = wrapper.vm.validate("anything");

      expect(result.isValid).toBe(true);
      expect(wrapper.vm.inputState.isValid).toBe(true);
    });
  });

  describe("onInput", () => {
    test("должен обновлять значение", () => {
      const event = { target: { value: "7707083893" } };
      wrapper.vm.onInput(event);

      expect(wrapper.vm.inputState.value).toBe("7707083893");
    });

    test("должен валидировать если validateOnInput = true", () => {
      wrapper.setProps({
        validationType: "inn",
        validateOnInput: true,
      });

      const validateSpy = jest.spyOn(wrapper.vm, "validate");
      const event = { target: { value: "7707083893" } };

      wrapper.vm.onInput(event);

      expect(validateSpy).toHaveBeenCalledWith("7707083893");
    });

    test("не должен валидировать если validateOnInput = false", () => {
      wrapper.setProps({
        validationType: "inn",
        validateOnInput: false,
      });

      const validateSpy = jest.spyOn(wrapper.vm, "validate");
      const event = { target: { value: "7707083893" } };

      wrapper.vm.onInput(event);

      expect(validateSpy).not.toHaveBeenCalled();
    });

    test("должен эмитить input событие", () => {
      const event = { target: { value: "7707083893" } };
      wrapper.vm.onInput(event);

      expect(wrapper.emitted("input")).toBeTruthy();
      expect(wrapper.emitted("input")[0][0]).toBe("7707083893");
    });
  });

  describe("onBlur", () => {
    test("должен отмечать поле как touched", () => {
      const event = { target: { value: "7707083893" } };
      wrapper.vm.onBlur(event);

      expect(wrapper.vm.inputState.isTouched).toBe(true);
    });

    test("должен валидировать при потере фокуса", () => {
      const validateSpy = jest.spyOn(wrapper.vm, "validate");
      const event = { target: { value: "7707083893" } };

      wrapper.vm.onBlur(event);

      expect(validateSpy).toHaveBeenCalledWith("7707083893");
    });

    test("должен эмитить blur событие", () => {
      const event = { target: { value: "" } };
      wrapper.vm.onBlur(event);

      expect(wrapper.emitted("blur")).toBeTruthy();
    });
  });

  describe("shouldShowError", () => {
    test("должен показывать ошибку если showErrorImmediately = true", () => {
      wrapper.setProps({ showErrorImmediately: true });
      wrapper.vm.inputState.errorMessage = "Ошибка";

      expect(wrapper.vm.shouldShowError).toBe(true);
    });

    test("должен показывать ошибку только после touched если showErrorImmediately = false", () => {
      wrapper.setProps({ showErrorImmediately: false });
      wrapper.vm.inputState.errorMessage = "Ошибка";
      wrapper.vm.inputState.isTouched = false;

      expect(wrapper.vm.shouldShowError).toBe(false);

      wrapper.vm.inputState.isTouched = true;
      expect(wrapper.vm.shouldShowError).toBe(true);
    });

    test("должен показывать ошибку если поле dirty", () => {
      wrapper.setProps({ showErrorImmediately: false });
      wrapper.vm.inputState.errorMessage = "Ошибка";
      wrapper.vm.inputState.isDirty = true;

      expect(wrapper.vm.shouldShowError).toBe(true);
    });
  });

  describe("inputClasses", () => {
    test("должен добавлять класс is-valid для валидного dirty поля", () => {
      wrapper.vm.inputState.isValid = true;
      wrapper.vm.inputState.isDirty = true;

      expect(wrapper.vm.inputClasses["is-valid"]).toBe(true);
    });

    test("должен добавлять класс is-invalid когда есть ошибка", () => {
      wrapper.vm.inputState.errorMessage = "Ошибка";
      wrapper.vm.inputState.isTouched = true;

      expect(wrapper.vm.inputClasses["is-invalid"]).toBe(true);
    });

    test("должен добавлять класс is-touched", () => {
      wrapper.vm.inputState.isTouched = true;

      expect(wrapper.vm.inputClasses["is-touched"]).toBe(true);
    });
  });

  describe("clear", () => {
    test("должен очищать значение и состояние", () => {
      wrapper.vm.inputState.value = "test";
      wrapper.vm.inputState.isValid = true;
      wrapper.vm.inputState.isDirty = true;
      wrapper.vm.inputState.isTouched = true;

      wrapper.vm.clear();

      expect(wrapper.vm.inputState.value).toBe("");
      expect(wrapper.vm.inputState.isValid).toBe(false);
      expect(wrapper.vm.inputState.isDirty).toBe(false);
      expect(wrapper.vm.inputState.isTouched).toBe(false);
    });

    test("должен эмитить clear событие", () => {
      wrapper.vm.clear();
      expect(wrapper.emitted("clear")).toBeTruthy();
    });

    test("должен эмитить validation событие с isValid=false", () => {
      wrapper.vm.clear();

      expect(wrapper.emitted("validation")).toBeTruthy();
      const event = wrapper.emitted("validation")[0][0];
      expect(event.isValid).toBe(false);
      expect(event.value).toBe("");
    });
  });

  describe("resetValidation", () => {
    test("должен сбрасывать только состояние валидации", () => {
      wrapper.vm.inputState.value = "test";
      wrapper.vm.inputState.isValid = true;
      wrapper.vm.inputState.errorMessage = "Ошибка";
      wrapper.vm.inputState.isTouched = true;
      wrapper.vm.inputState.isDirty = true;

      wrapper.vm.resetValidation();

      expect(wrapper.vm.inputState.value).toBe("test"); // значение сохраняется
      expect(wrapper.vm.inputState.isValid).toBe(false);
      expect(wrapper.vm.inputState.errorMessage).toBe("");
      expect(wrapper.vm.inputState.isTouched).toBe(false);
      expect(wrapper.vm.inputState.isDirty).toBe(false);
    });
  });

  describe("setError", () => {
    test("должен устанавливать ошибку вручную", () => {
      wrapper.vm.setError("Ручная ошибка");

      expect(wrapper.vm.inputState.isValid).toBe(false);
      expect(wrapper.vm.inputState.errorMessage).toBe("Ручная ошибка");
      expect(wrapper.vm.inputState.isTouched).toBe(true);
    });
  });

  describe("эмиты", () => {
    test("должен эмитить validation событие при валидации", () => {
      wrapper.setProps({ validationType: "inn" });
      wrapper.vm.validate("7707083893");

      expect(wrapper.emitted("validation")).toBeTruthy();
      const event = wrapper.emitted("validation")[0][0];
      expect(event.isValid).toBe(true);
      expect(event.value).toBe("7707083893");
      expect(event.field).toBeDefined();
    });

    test("должен эмитить valid событие для валидного значения", () => {
      wrapper.setProps({ validationType: "inn" });
      wrapper.vm.validate("7707083893");

      expect(wrapper.emitted("valid")).toBeTruthy();
      expect(wrapper.emitted("valid")[0][0]).toBe("7707083893");
    });

    test("должен эмитить invalid событие для невалидного значения", () => {
      wrapper.setProps({ validationType: "inn" });
      wrapper.vm.validate("123");

      expect(wrapper.emitted("invalid")).toBeTruthy();
      expect(wrapper.emitted("invalid")[0][0]).toBe("123");
    });
  });
});
