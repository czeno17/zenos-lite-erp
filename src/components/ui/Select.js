export function Select({ value, onChange, children, className = '' }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    >
      {children}
    </select>
  );
}