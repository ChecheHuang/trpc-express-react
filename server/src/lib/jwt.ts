import prismadb from './prismadb'
import { TRPCError } from '@trpc/server'
import { Request } from 'express'
import jwt, { JwtPayload, TokenExpiredError } from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      user?: TokenType
    }
  }
}

// export const TOKEN_EXPIRE_TIME = 3
export const TOKEN_EXPIRE_TIME = 24 * 60 * 60
// export const REFRESH_TOKEN_EXPIRE_TIME = 5
export const REFRESH_TOKEN_EXPIRE_TIME = 7 * 24 * 60 * 60

export type TokenType = {
  id: string
  name: string
}

export const createToken = ({ id, name }: TokenType) => {
  const access = signToken(
    {
      id,
      name,
    },
    TOKEN_EXPIRE_TIME
  )
  const refresh = signToken(
    {
      id,
      name,
    },
    REFRESH_TOKEN_EXPIRE_TIME
  )
  return { access, refresh }
}

export const signToken = (payload: JwtPayload, expiresIn?: string | number): string => {
  const options = expiresIn ? { expiresIn } : {}
  const token = jwt.sign(payload, process.env.TOKEN_SECRET || '', options)
  return token
}

export const verifyToken = (token: string): Promise<JwtPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.TOKEN_SECRET || '', (error, decoded) => {
      if (error) {
        if (error instanceof TokenExpiredError) {
          reject('Token已過期')
        }
        reject('Token 驗證失敗。請重新登入。')
      } else {
        resolve(decoded as JwtPayload)
      }
    })
  })
}

const getTokenFromHeader = (req: Request): string => {
  try {
    const token = req.headers['authorization']?.split(' ')[1] || ''
    // console.log('token', token)
    return token
  } catch (error) {
    return ''
  }
}

export const getUser = async (req: Request) => {
  const token = getTokenFromHeader(req)
  return (await verifyToken(token)) as TokenType
}

export const determineUserIsAllowed = async ({ url, user }: { url: string; user: TokenType }) => {
  const { id } = user
  const roles = await prismadb.rolesOnUsers.findMany({
    where: {
      userId: id,
    },
    select: {
      role: {
        select: {
          rolesOnApis: {
            select: {
              isAllow: true,
              api: {
                select: {
                  id: true,
                  router: true,
                  name: true,
                  swaggerPath: true,
                },
              },
            },
          },
        },
      },
    },
  })
  for (const {
    role: { rolesOnApis },
  } of roles) {
    for (const { api, isAllow } of rolesOnApis) {
      const { router, name, swaggerPath } = api
      const trpcPath = router + '.' + name

      if (url.includes(trpcPath) || url.includes(swaggerPath)) {
        // console.log(url)
        // console.log(trpcPath)
        // console.log(isAllow)
        return isAllow
      }
    }
  }
  return true
}
