const AlertBar = ({ type = 'info', title, message, visible }) => {
  if (!visible) return null;

  const styles = {
    info: 'bg-blue-50 border-blue-500 text-blue-800',
    success: 'bg-green-50 border-green-500 text-green-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    error: 'bg-red-50 border-red-500 text-red-800',
  };

  const icons = {
    info: 'i',
    success: 'ok',
    warning: '!',
    error: 'x',
  };

  return (
    <div className={`mb-6 p-4 rounded-lg border-l-4 ${styles[type]}`}>
      <div className="flex items-center">
        <span className="text-xl mr-3">{icons[type]}</span>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default AlertBar;
