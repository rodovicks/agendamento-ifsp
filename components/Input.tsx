import React, { forwardRef } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

type InputProps = {
  label?: string;
  error?: string;
} & TextInputProps;

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, className, ...textInputProps }, ref) => {
    return (
      <View className="mb-4">
        {label && <Text className="mb-2 text-base font-medium text-gray-700">{label}</Text>}
        <TextInput
          ref={ref}
          {...textInputProps}
          className={`rounded-lg border border-gray-300 bg-white px-4 py-3 text-base ${
            error ? 'border-red-500' : 'focus:border-indigo-500'
          } ${className}`}
          placeholderTextColor="#9CA3AF"
        />
        {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';
