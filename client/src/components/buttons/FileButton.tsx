import ExtendedButton, {
  ExtendedButtonProps,
} from '@/components/buttons/ExtendedButton'

type FileButtonProps = Override<
  ExtendedButtonProps,
  {
    onClick: (e: React.ChangeEvent<HTMLInputElement>) => void
  }
>

const FileButton = ({ onClick, children, ...rest }: FileButtonProps) => {
  return (
    <ExtendedButton {...rest}>
      <input onChange={onClick} id="upload" type="file" className=" hidden" />
      <label className=" inline-block cursor-pointer" htmlFor="upload">
        {children}
      </label>
    </ExtendedButton>
  )
}

export default FileButton
