export function Input({ type = 'text', placeholder, value, onChange, required = false, className = '' }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    />
  );
}