
import { API_PREFIX, STUDIES } from './endpoints'

test('Endpoints should be prefixed', () => {
  expect(STUDIES).toContain(API_PREFIX)
})
