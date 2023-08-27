import fs from 'fs'
import { glob } from 'glob'
import { defineBuildConfig } from 'unbuild'

const SRC_PATH = 'src'
const OUTPUT_PATH = 'dist'

const SOLID_COMPONENT_LIB_PATH = 'solid-component-lib'

export default defineBuildConfig({
  hooks: {
    async "build:done"(ctx) {
        const libTsFiles = [
          ...await glob(`${SRC_PATH}/${SOLID_COMPONENT_LIB_PATH}/**/*.ts`),
          ...await glob(`${SRC_PATH}/${SOLID_COMPONENT_LIB_PATH}/**/*.tsx`),
        ]

        for (const libTsFile of libTsFiles) {
          const outputLibFile = libTsFile.replace(new RegExp(`^${SRC_PATH}/`), `${OUTPUT_PATH}/`)

          if (!fs.existsSync(outputLibFile)) {
            fs.mkdirSync(outputLibFile.replace(/\/[^/]+$/, ''), { recursive: true })
            fs.openSync(outputLibFile, 'w')
          }

          fs.writeFileSync(
            libTsFile.replace(new RegExp(`^${SRC_PATH}/`), `${OUTPUT_PATH}/`),
            `// @ts-nocheck\n${fs.readFileSync(libTsFile)}`,
          )
        }
    },
  },
})
