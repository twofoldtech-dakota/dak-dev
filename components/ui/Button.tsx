import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const buttonStyles = {
  base: 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed',

  variants: {
    primary: 'bg-text text-background border-4 border-text hover:bg-background hover:text-text shadow-[4px_4px_0_0_#f5f5f5] hover:shadow-[6px_6px_0_0_#00ff88] focus:ring-accent',
    secondary: 'bg-surface text-text border-4 border-text hover:bg-text hover:text-background shadow-[4px_4px_0_0_#f5f5f5] hover:shadow-[6px_6px_0_0_#00ff88] focus:ring-accent',
    ghost: 'bg-transparent text-text border-2 border-text hover:bg-text hover:text-background focus:ring-accent',
    accent: 'bg-transparent text-accent border-4 border-accent hover:bg-accent hover:text-background shadow-[4px_4px_0_0_#00ff88] hover:shadow-[6px_6px_0_0_#00ff88] focus:ring-accent',
  },

  sizes: {
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-3',
  },
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconPosition = 'left',
  className = '',
  disabled = false,
  type = 'button',
  ...props
}: ButtonProps) {
  const classNames = [
    buttonStyles.base,
    buttonStyles.variants[variant],
    buttonStyles.sizes[size],
    className,
  ].join(' ');

  return (
    <motion.button
      type={type}
      className={classNames}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </motion.button>
  );
}
