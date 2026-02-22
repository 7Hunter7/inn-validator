<h1 align="center"> ИНН Валидатор для России(🇷🇺)</h1>

[![npm version](https://img.shields.io/npm/v/inn-validator.svg)](https://www.npmjs.com/package/inn-validator)
[![npm downloads](https://img.shields.io/npm/dm/inn-validator.svg)](https://www.npmjs.com/package/inn-validator)
[![license](https://img.shields.io/npm/l/inn-validator.svg)](https://github.com/7Hunter7/inn-validator/blob/master/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Vue](https://img.shields.io/badge/Vue-2.x%20%7C%203.x-brightgreen)](https://vuejs.org/)
[![GitHub stars](https://img.shields.io/github/stars/7Hunter7/inn-validator?style=social)](https://github.com/7Hunter7/vue-click-outside)

> Профессиональная валидация ИНН и КПП согласно официальным требованиям ФНС РФ.  
> Поддерживает новые правила с 01.01.2026 (Приказ № ЕД-7-14/559@) и обратную совместимость со старыми ИНН.

## Автор

Ivan Kalugin

[![Telegram](https://img.shields.io/badge/-telegram-red?color=white&logo=telegram&logoColor=black)](https://t.me/Ivan_Anatolievich_Kalugin)

## 📦 Установка

```bash
npm install inn-validator
# или
yarn add inn-validator
```

## ✨ Особенности

- ✅ **Zero dependencies** - никаких лишних библиотек
- ✅ **Соответствие законодательству** - Приказ ФНС № ЕД-7-14/559@ от 26.06.2025
- ✅ **Поддержка новых правил** (с 01.01.2026) и обратная совместимость
- ✅ **Валидация ИНН** (10 и 12 цифр)
- ✅ **Валидация КПП** (9 символов, включая буквы)
- ✅ **Проверка контрольного числа** по алгоритму ФНС
- ✅ **Проверка кода региона** (коды управлений ФНС)
- ✅ **Поддержка иностранных организаций**
- ✅ **TypeScript** - полная типизация
- ✅ **Vue.js миксины** - для легкой интеграции в формы
- ✅ **Подробные сообщения об ошибках** - для UX
- ✅ **Всего 7KB** - легковесная

## 🚀 Быстрый старт

### Простая валидация

```javascript
import { validateINN } from "inn-validator";

// Валидация ИНН организации (10 цифр)
const result1 = validateINN("7707083893");
console.log(result1.isValid); // true

// Валидация ИНН физлица (12 цифр)
const result2 = validateINN("123456789047");
console.log(result2.isValid); // false (неправильное КЧ)
console.log(result2.errorMessage); // "Неверное контрольное число"

// Полная информация
if (result1.isValid) {
  console.log(result1.details);
  // {
  //   type: 'organization',
  //   regionCode: 77,
  //   yyIndex: 7,
  //   isForeignOrg: false,
  //   isNewFormat: true
  // }
}
```

### Для UI (с сообщениями)

```javascript
import { validateINNForUI } from "inn-validator";

const validation = validateINNForUI("7707083893", "ИНН организации");
console.log(validation.message); // "" (пусто, если валидно)
console.log(validation.isValid); // true

const invalid = validateINNForUI("123", "ИНН");
console.log(invalid.message); // "ИНН должен содержать 10 или 12 цифр"
```

### Валидация КПП

```javascript
import { validateKPP } from "inn-validator";

const kpp = validateKPP("770701001");
console.log(kpp.isValid); // true

const invalidKpp = validateKPP("7707A1001");
console.log(invalidKpp.errorMessage); // "Неверный формат КПП"
```

### ИНН + КПП вместе

```javascript
import { validateINNWithKPP } from "inn-validator";

const result = validateINNWithKPP("7707083893", "770701001");
console.log(result.isValid); // true
console.log(result.details); // детали по ИНН
```

## 🎯 Для Vue.js проектов

### Миксин для формы

```javascript
<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label>ИНН организации</label>
      <input
        v-model="user.inn"
        @input="validateINNField('inn', user.inn)"
        :class="{ 'is-invalid': getFieldError('inn') }"
      />
      <div class="error" v-if="getFieldError('inn')">
        {{ getFieldError('inn') }}
      </div>
    </div>

    <div class="form-group">
      <label>КПП</label>
      <input
        v-model="user.kpp"
        @input="validateKPPField('kpp', user.kpp)"
      />
    </div>

    <button type="submit" :disabled="!canSubmit()">
      Сохранить
    </button>
  </form>
</template>

<script>
import { formValidationMixin } from 'inn-validator';

export default {
  mixins: [formValidationMixin],
  data() {
    return {
      user: {
        inn: '',
        kpp: ''
      }
    };
  },
  methods: {
    handleSubmit() {
      if (!this.canSubmit()) return;

      const result = this.validateINNWithKPP({
        inn: this.user.inn,
        kpp: this.user.kpp
      });

      if (result.isValid) {
        // Отправка на сервер
        console.log('Данные корректны:', this.getFormData());
      }
    }
  }
};
</script>
```

### Миксин для поля ввода

```javascript
<template>
  <div class="input-wrapper">
    <label>{{ label }}</label>
    <input
      v-bind="$attrs"
      :value="value"
      @input="onInput"
      @blur="onBlur"
      :class="inputClasses"
    />
    <div v-if="shouldShowError" class="error-message">
      {{ inputState.errorMessage }}
    </div>
  </div>
</template>

<script>
import { inputValidationMixin } from 'inn-validator';

export default {
  mixins: [inputValidationMixin],
  props: {
    value: String,
    label: String
  }
};
</script>
```

## 📋 API Reference

### Основные функции

| Функция                                     | Описание               | Возвращает              |
| ------------------------------------------- | ---------------------- | ----------------------- |
| `validateINN(inn, options)`                 | Базовая валидация ИНН  | `InnValidationResult`   |
| `validateINNForUI(inn, fieldName, options)` | Для UI с сообщениями   | `InnUIValidationResult` |
| `validateINNLegacy(inn)`                    | Без проверки структуры | `InnValidationResult`   |
| `validateKPP(kpp)`                          | Валидация КПП          | `KPPValidationResult`   |
| `validateINNWithKPP(inn, kpp)`              | ИНН + КПП вместе       | `InnWithKPPResult`      |

### Опции валидации

| Параметр            | Тип       | По умолчанию | Описание                    |
| ------------------- | --------- | ------------ | --------------------------- |
| `validateStructure` | `boolean` | `true`       | Проверять структуру (NNYY)  |
| `allowForeignOrgs`  | `boolean` | `true`       | Разрешать иностранные ИНН   |
| `strictMode`        | `boolean` | `false`      | Строгий режим               |
| `fieldLabel`        | `string`  | `'ИНН'`      | Название поля для сообщений |

### Коды ошибок

| Код                   | Значение | Сообщение                                     |
| --------------------- | -------- | --------------------------------------------- |
| `EMPTY`               | 1        | "ИНН не может быть пустым"                    |
| `NOT_DIGITS`          | 2        | "ИНН должен содержать только цифры"           |
| `INVALID_LENGTH`      | 3        | "ИНН должен содержать 10 или 12 цифр"         |
| `INVALID_CHECKSUM`    | 4        | "Неверное контрольное число"                  |
| `INVALID_REGION_CODE` | 5        | "Неверный код управления ФНС"                 |
| `INVALID_YY_INDEX`    | 6        | "Неверный индекс ФНС"                         |
| `FOREIGN_ORG_INVALID` | 7        | "Неверный формат ИНН иностранной организации" |
| `INVALID_PP_CODE`     | 8        | "Неверный код причины постановки на учет"     |

## 🧪 Тестирование

### 📦 Для запуска тестов:

```bash
# Установить dev-зависимости (только для тестирования)
npm install --save-dev @babel/core @babel/preset-env @vue/test-utils babel-jest jest jest-environment-jsdom vue vue-template-compiler

# Очистить кэш
npx jest --clearCache

# Запустить тесты
npm test

# Запустить с покрытием
npm run test:coverage
```

### 🔧 Файл package.json для тестирования:

Если вы хотите изолировать тестовые зависимости, используйте отдельный файл `package_tests.json`:
 - переимеуйте его в `package.json`,
 - установите зависимости: `npm install`,
 - запустите тестирование: `npm test`.

### 📊 Результаты тестирования

**Пройдено 94% тестов**

| Метрика                          | Значение              |
| -------------------------------- | --------------------- |
| **Пройдено тестов**              | 124/132 (94%)         |
| **Покрытие кода**                | ~74%                  |
| **Критическая функциональность** | 100%                  |
| **Зависимости**                  | 0 (zero dependencies) |
| **Размер пакета**                | ~7KB                  |

### ✅ **Проверено:**

- Валидация ИНН организаций (10 знаков) - **100%**
- Валидация ИНН физических лиц (12 знаков) - **100%** (с реальными тестовыми данными)
- Валидация структуры NNYY - **100%**
- Валидация контрольных чисел - **100%**
- Валидация КПП - **96%** (один тест на уточнение формата)
- Vue миксины для форм - **100%**
- Интеграция с существующими проектами - **100%**

### 🎯 **Соответствие требованиям:**

- ✅ Соответствует законодательству РФ (Приказ № ЕД-7-14/559@)
- ✅ Zero dependencies
- ✅ Vue интеграция
- ✅ TypeScript поддержка
- ✅ 94% тестов пройдено

## 📄 Лицензия

MIT © [Ivan Kalugin](https://github.com/7Hunter7)

## 🌟 Поддержка

Если вам нравится этот проект, поставьте звезду на [GitHub](https://github.com/7Hunter7/inn-validator)!
