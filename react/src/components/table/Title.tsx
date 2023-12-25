import ChangeSizeRadio from '@/components/ChangeSizeRadio'
import PrevButton from '@/components/buttons/PrevButton'

interface TitleProps {
  title: string
}

const Title = ({ title }: TitleProps) => {
  return (
    <>
      <div className=" flex items-center justify-between">
        <h1 className="text-3xl">{title}</h1>
        <div className="flex gap-2">
          <PrevButton />
          <ChangeSizeRadio />
        </div>
      </div>
    </>
  )
}

export default Title
