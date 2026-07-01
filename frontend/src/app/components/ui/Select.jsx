export default function Select({
  label,
  children,
  ...props
}) {
  return (
    <div className="space-y-2">

      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <select
        {...props}
        className="
          w-full
          rounded-xl
          border
          border-gray-300
          px-4
          py-3
          outline-none
          focus:ring-2
          focus:ring-green-600
        "
      >
        {children}
      </select>

    </div>
  );
}