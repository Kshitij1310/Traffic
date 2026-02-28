import { cn } from '../lib/utils';

const buttonVariants = {
  primary: 'bg-teal-600 text-white hover:bg-teal-700',
  secondary: 'bg-amber-500 text-white hover:bg-amber-600',
  outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
  ghost: 'text-slate-700 hover:bg-slate-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
};

const Button = ({ className, variant = 'primary', ...props }) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
        buttonVariants[variant],
        className
      )}
      {...props}
    />
  );
};

export default Button;
