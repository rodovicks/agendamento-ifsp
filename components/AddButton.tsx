import { forwardRef } from 'react';
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export const AddButton = forwardRef<typeof TouchableOpacity, { onPress?: () => void }>(
  ({ onPress }, ref) => {
    return (
      <TouchableOpacity onPress={onPress} style={{ marginRight: 15 }}>
        <Feather name="plus" size={24} color="#1f2937" />
      </TouchableOpacity>
    );
  }
);

AddButton.displayName = 'AddButton';
