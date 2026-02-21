// Функция для генерации тестовых ИНН с правильным КЧ
function generateTestINN() {
  // Генерируем первые 10 цифр случайно
  let base = '';
  for (let i = 0; i < 10; i++) {
    base += Math.floor(Math.random() * 10);
  }
  
  // Рассчитываем КЧ1
  const coefficients1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
  let sum1 = 0;
  for (let i = 0; i < 10; i++) {
    sum1 += coefficients1[i] * parseInt(base[i], 10);
  }
  const kch1 = (sum1 % 11) % 10;
  
  // Рассчитываем КЧ2
  const coefficients2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
  let sum2 = 0;
  for (let i = 0; i < 11; i++) {
    const digit = i < 10 ? parseInt(base[i], 10) : kch1;
    sum2 += coefficients2[i] * digit;
  }
  const kch2 = (sum2 % 11) % 10;
  
  return base + kch1 + kch2;
}

// Генерируем валидные ИНН для тестов
const validIndividualINNs = [
  generateTestINN(),
  generateTestINN(),
  generateTestINN(),
];