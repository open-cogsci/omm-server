import { emailRule, notEmpty, maxLength } from './validationrules'

describe('Validation rules', () => {
  test('Incorrect emails should be detected', () => {
    const cases = [
      ['a@a.com', true],
      ['a@a', false],
      ['aa', false],
      ['aaa', false]
    ]
    for (const aCase of cases) {
      expect(emailRule(aCase[0])).toBe(aCase[1])
    }
  })

  test('Empty variables should be detected', () => {
    const cases = [
      ['', false],
      ['a', true],
      [0, true]
    ]
    for (const aCase of cases) {
      expect(notEmpty(aCase[0])).toBe(aCase[1])
    }
  })

  test('Variable value lengths longer than allowed should be flagged', () => {
    const cases = [
      ['test', 5, true],
      ['test', 3, false],
      [['t', 'e', 's', 't'], 5, true],
      [['t', 'e', 's', 't'], 3, false]
    ]
    for (const aCase of cases) {
      expect(maxLength(aCase[0], aCase[1])).toBe(aCase[2])
    }
  })
})
