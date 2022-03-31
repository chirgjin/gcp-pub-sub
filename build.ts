import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

async function build() {
    await fs.promises
        .rm(path.join(__dirname, 'build'), {
            recursive: true,
        })
        .catch(() => null)

    await promisify(exec)(`tsc --build . && tsc-alias`)
}

build()
