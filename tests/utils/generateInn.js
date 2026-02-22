/**
 * Функция для генерации ИНН с правильным КЧ
 */

export const generateINN = {
  /**
   * Генерация случайного валидного ИНН физического лица (12 цифр)
   */
  generateIndividual() {
    let base = "";
    for (let i = 0; i < 10; i++) {
      base += Math.floor(Math.random() * 10);
    }

    // Расчет КЧ1
    const coefficients1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    let sum1 = 0;
    for (let i = 0; i < 10; i++) {
      sum1 += coefficients1[i] * parseInt(base[i], 10);
    }
    const kch1 = (sum1 % 11) % 10;

    // Расчет КЧ2
    const coefficients2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    let sum2 = 0;
    for (let i = 0; i < 11; i++) {
      const digit = i < 10 ? parseInt(base[i], 10) : kch1;
      sum2 += coefficients2[i] * digit;
    }
    const kch2 = (sum2 % 11) % 10;

    return base + kch1 + kch2;
  },

  /**
   * Генерация случайного валидного ИНН юридического лица (10 цифр)
   */
  generateLegal() {
    let base = "";
    for (let i = 0; i < 9; i++) {
      base += Math.floor(Math.random() * 10);
    }

    const coefficients = [2, 4, 10, 3, 5, 9, 4, 6, 8];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += coefficients[i] * parseInt(base[i], 10);
    }
    const kch = (sum % 11) % 10;

    return base + kch;
  },

  /**
   * Генерация массива валидных ИНН (для тестов)
   * @param {number} count - количество
   * @param {string} type - 'individual' | 'legal' | 'both'
   */
  generateForTests(count = 3, type = "both") {
    const result = [];
    for (let i = 0; i < count; i++) {
      if (type === "individual") {
        result.push(this.generateIndividual());
      } else if (type === "legal") {
        result.push(this.generateLegal());
      } else {
        result.push(
          i % 2 === 0 ? this.generateIndividual() : this.generateLegal(),
        );
      }
    }
    return result;
  },
};
