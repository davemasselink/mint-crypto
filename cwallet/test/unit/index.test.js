import { httpImpl } from 'http'

import index from '../../src/index'

jest.mock('http')

describe('Index', () => {
  test('Starts listener', async () => {
    await index
    expect(index).toMatchObject({})
    expect(httpImpl.listen).toBeCalledWith(3000, expect.any(Function))
  })
})
