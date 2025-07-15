import React, { useEffect, useState } from 'react';
import { TextInput } from 'react-native-paper';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const [input, setInput] = useState(value);

  useEffect(() => {
    setInput(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(input);
    }, 400);
    return () => clearTimeout(handler);
  }, [input, onChange]);

  return (
    <TextInput
      label="Search rooms"
      value={input}
      onChangeText={setInput}
      style={{ margin: 12 }}
      mode="outlined"
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="search"
      clearButtonMode="while-editing"
    />
  );
} 