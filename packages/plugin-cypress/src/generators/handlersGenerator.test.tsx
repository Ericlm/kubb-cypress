import { createMockedPluginManager, matchFiles } from '@kubb/core/mocks'

import path from 'node:path'
import type { Plugin } from '@kubb/core'
import type { HttpMethod } from '@kubb/oas'
import { parse } from '@kubb/oas'
import { OperationGenerator } from '@kubb/plugin-oas'
import type { PluginCypress } from '../types.ts'
import { handlersGenerator } from './handlersGenerator.tsx'

describe('handlersGenerator operations', async () => {
  const testData = [
    {
      name: 'findByTags',
      input: '../../mocks/petStore.yaml',
      path: '/pet/findByTags',
      method: 'get',
      options: {},
    },
  ] as const satisfies Array<{
    input: string
    name: string
    path: string
    method: HttpMethod
    options: Partial<PluginCypress['resolvedOptions']>
  }>

  test.each(testData)('$name', async (props) => {
    const oas = await parse(path.resolve(__dirname, props.input))

    const options: PluginCypress['resolvedOptions'] = {
      output: {
        path: '.',
      },
      parser: 'data',
      baseURL: undefined,
      group: undefined,
      ...props.options,
    }
    const plugin = { options } as Plugin<PluginCypress>
    const instance = new OperationGenerator(options, {
      oas,
      include: undefined,
      pluginManager: createMockedPluginManager(props.name),
      plugin,
      contentType: undefined,
      override: undefined,
      mode: 'split',
      exclude: [],
    })
    await instance.build(handlersGenerator)

    const operations = Object.values(instance.operationsByMethod).map((item) => Object.values(item).map((item) => item.operation))

    const files = await handlersGenerator.operations?.({
      operations: operations.flat().filter(Boolean),
      operationsByMethod: instance.operationsByMethod,
      options,
      instance,
    })

    await matchFiles(files)
  })
})
