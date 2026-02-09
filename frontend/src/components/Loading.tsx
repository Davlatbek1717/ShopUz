interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export default function Loading({ size = 'md', text = 'Yuklanmoqda...', fullScreen = false }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50'
    : 'flex items-center justify-center py-8';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className={`spinner ${sizeClasses[size]} mx-auto mb-4`}></div>
        <div className={`text-gray-600 font-medium ${textSizeClasses[size]}`}>
          {text}
        </div>
      </div>
    </div>
  );
}