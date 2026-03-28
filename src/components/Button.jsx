import React from 'react';

const Button = React.forwardRef(({ children, variant = 'primary', icon: Icon, className = '', ...props }, ref) => {
  const baseClass = `w-full py-3.5 rounded-[12px] font-semibold text-[1rem] transition-all duration-200 flex items-center justify-center ${props.disabled ? '' : 'active:scale-[0.98]'}`;
  
  let variantClass = "bg-[#4A90E2] text-white hover:bg-[#357ABD] shadow-[0_4px_14px_0_rgba(74,144,226,0.39)]"; // primary
  
  if (props.disabled) {
    variantClass = "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none";
  } else if (variant === 'secondary') {
    variantClass = "bg-gray-100 text-gray-600 hover:bg-gray-200";
  } else if (variant === 'danger') {
    variantClass = "bg-red-500 text-white hover:bg-red-600 shadow-sm";
  } else if (variant === 'text') {
    variantClass = "bg-transparent text-gray-500 hover:text-gray-800 shadow-none py-2 font-medium text-[0.9rem]";
  }

  return (
    <button ref={ref} className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {Icon && <Icon size={20} className="mr-2.5" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default React.memo(Button);