import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import { FC } from 'react'

const styles = {
  base: 'absolute z-10 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full text-neutral-50 focus:outline-hidden transition-all duration-200',
  enabled: 'bg-primary-600 hover:bg-primary-700 cursor-pointer',
  disabled: 'bg-gray-400 cursor-not-allowed opacity-60',
  default: 'size-16 end-2 xl:end-4',
  small: 'size-14 end-2',
}

interface Props {
  className?: string
  fieldStyle: 'default' | 'small'
  disabled?: boolean
}

export const ButtonSubmit: FC<Props> = ({ className, fieldStyle = 'default', disabled = false }) => {
  return (
    <button 
      type="submit" 
      disabled={disabled}
      className={clsx(
        styles.base, 
        styles[fieldStyle], 
        disabled ? styles.disabled : styles.enabled,
        className
      )}
      title={disabled ? 'Completează toate câmpurile pentru a căuta' : 'Caută'}
    >
      <HugeiconsIcon icon={Search01Icon} size={24} />
    </button>
  )
}
