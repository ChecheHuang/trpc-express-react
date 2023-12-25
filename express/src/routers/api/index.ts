import { getUser } from '../../lib/jwt'
import { upload } from '../../lib/upload'
import { Router } from 'express'

const apiRouter = Router()

apiRouter.post('/uploads', upload.single('file'), async (req, res, next) => {
  try {
    const { id: userId } = await getUser(req)

    if (req.file === undefined) return res.status(401).json('上傳失敗')
    res.send('新增成功')
  } catch (error) {
    return res.status(401).json(error)
  }
})

export default apiRouter
