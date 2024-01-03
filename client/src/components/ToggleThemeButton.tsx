import { useTheme } from '@/store/useTheme'
import { ColorPicker, Button, Popover } from 'antd'
import { useState } from 'react'
import { IoIosPartlySunny, IoMdMoon } from 'react-icons/io'

const ToggleThemeButton = () => {
  const { mode, toggleMode, changeColor, colorPrimary } = useTheme()
  const [color, setColor] = useState(colorPrimary)

  return (
    <>
      <Popover
        content={
          <div className="flex gap-2">
            <Button onClick={toggleMode} type="dashed">
              {mode === 'light' ? <IoIosPartlySunny /> : <IoMdMoon />}
            </Button>
            <ColorPicker
              format="hex"
              value={colorPrimary}
              onChange={(color) => setColor(color.toHexString())}
              onOpenChange={(isOpen) => {
                if (!isOpen) {
                  changeColor(color)
                  localStorage.setItem('colorPrimary', color)
                }
              }}
              // onChange={changeColor}
            />
          </div>
        }
        // trigger="click"
      >
        <Button type="primary">
          {mode === 'light' ? <IoIosPartlySunny /> : <IoMdMoon />}
        </Button>
      </Popover>
    </>
  )
}

export default ToggleThemeButton
