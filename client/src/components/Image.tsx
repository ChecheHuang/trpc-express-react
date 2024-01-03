import { Image as AntdImage } from 'antd'
import lazyImg from '@/assets/images/lazy.png'
import placeholderImg from '@/assets/images/placeholder.jpg'
interface ImageProps {
  width?: number
  src: string
}
const Image: React.FC<ImageProps> = ({ src, width = 30 }) => {
  return (
    <AntdImage
      width={width}
      src={src}
      fallback={placeholderImg}
      placeholder={<AntdImage preview={false} src={lazyImg} width={30} />}
    />
  )
}

export default Image
