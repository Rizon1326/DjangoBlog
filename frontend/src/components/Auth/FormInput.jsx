// /src/components/Auth/FormInput.jsx
import React from "react";

const FormInput = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  maxLength,
  rightElement,
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        {rightElement}
      </div>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder={placeholder}
        maxLength={maxLength}
      />
    </div>
  );
};

export default FormInput;