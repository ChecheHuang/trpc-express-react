import MyCard from '@/components/MyCard'
import ExtendedButton from '@/components/buttons/ExtendedButton'
import Container from '@/components/container/Container'
import { cn } from '@/lib/utils'
import { Steps } from 'antd'
import { memo, useEffect, useMemo, useRef } from 'react'
import { FC, ReactNode, isValidElement, Children } from 'react'

interface StepContainerProps {
  stepClassName?: string
  className?: string
  children: ReactNode
  currentStep?: number
  onPrevious?: (prevStep: number) => void
  onNext?: (nextStep: number) => void
  onChange?: (value: number) => void
  prevButton?: ReactNode
  nextButton?: ReactNode
  isFixButton?: boolean
  isFixButtonAlwaysShow?: boolean
  onComplete?: () => void
}

interface Step {
  title: string
  content: ReactNode
}

const StepContainer: FC<StepContainerProps> & {
  Item: FC<StepContainerItemProps>
} = ({
  children,
  currentStep = 1,
  onPrevious,
  onNext,
  onChange,
  className,
  stepClassName,
  prevButton,
  nextButton,
  onComplete,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }, [currentStep])

  const steps: Step[] = useMemo(() => {
    return Children.toArray(children)
      .flatMap((child) => {
        if (isValidElement(child) && child.type === StepContainer.Item) {
          const { title, children } = child.props
          return { title, content: children }
        }
        return null
      })
      .filter(Boolean) as Step[]
  }, [children])
  const content: ReactNode = useMemo(
    () =>
      Children.toArray(children).filter(
        (child) => isValidElement(child) && child.type !== StepContainer.Item,
      ),
    [children],
  )

  const items = steps.map((value) => ({ title: value.title }))

  return (
    <>
      <div className={cn('h-[2rem] bg-white px-4', stepClassName)}>
        <Steps
          onChange={(value) => {
            if (onChange) onChange(value + 1)
          }}
          size="small"
          current={currentStep - 1}
          items={items}
        />
      </div>
      <Container
        ref={ref}
        className={cn(
          'h-[calc(100vh-6rem)] overflow-y-auto scroll-smooth  scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-dark ',
          className,
        )}
      >
        <MyCard>
          {content}
          {steps[currentStep - 1]?.content}
          <div className="flex justify-center gap-10">
            {prevButton ? (
              prevButton
            ) : (
              <ExtendedButton
                className={cn(
                  currentStep === 1 && 'pointer-events-none opacity-0',
                )}
                onClick={() =>
                  onPrevious &&
                  onPrevious(currentStep === 1 ? 1 : currentStep - 1)
                }
              >
                上一步
              </ExtendedButton>
            )}
            {nextButton ? (
              nextButton
            ) : (
              <ExtendedButton
                className="w-[75px]"
                onClick={() => {
                  onNext &&
                    onNext(
                      currentStep === steps.length
                        ? steps.length
                        : currentStep + 1,
                    )
                  if (currentStep === steps.length) {
                    onComplete && onComplete()
                  }
                }}
                type={currentStep === steps.length ? 'primary' : 'default'}
              >
                {currentStep === steps.length ? '送出' : '下一步'}
              </ExtendedButton>
            )}
          </div>
        </MyCard>
      </Container>
    </>
  )
}

interface StepContainerItemProps {
  title: string
  children: ReactNode
}

const StepContainerItem: FC<StepContainerItemProps> = memo(({ children }) => {
  return <div>{children}</div>
})

StepContainer.Item = StepContainerItem

export default StepContainer
