import prismadb from '../src/lib/prismadb'
import chalk from 'chalk'

const log = (data: any) => {
  console.log(chalk.greenBright(JSON.stringify(data, null, 2)))
}

const main = async () => {
  log('test')
}

main()
