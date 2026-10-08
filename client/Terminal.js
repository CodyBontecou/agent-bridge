import { Text as NativeText, Pressable, Platform, StyleSheet } from 'react-native';
import { isLoaded } from 'expo-font';
/** @param {import('react-native').TextProps} props */
export function Text({ style, ...props }) {
  return (
    <NativeText
      {...props}
      style={[styles.text, isLoaded('Terminal') ? styles.mono : styles.fallback, style]}
    />
  );
}
/** @param {{title:string, onPress:()=>void, disabled?:boolean}} props */
export function Button({ title, onPress, disabled = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.command}>{`> ${title.toUpperCase()}`}</Text>
    </Pressable>
  );
}
/** @param {{value:boolean, onValueChange:(value:boolean)=>void, disabled?:boolean, accessibilityLabel:string}} props */
export function Switch({ value, onValueChange, disabled = false, accessibilityLabel }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={[styles.toggle, disabled && styles.disabled]}
    >
      <Text>{value ? '[X] ON' : '[ ] OFF'}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  text: { color: '#000000', fontSize: 17, lineHeight: 25 },
  mono: { fontFamily: 'Terminal' },
  fallback: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  button: {
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  command: { fontSize: 15, lineHeight: 24 },
  pressed: { borderWidth: 2, paddingHorizontal: 11, paddingVertical: 7 },
  disabled: { opacity: 0.4 },
  toggle: { minHeight: 44, minWidth: 88, justifyContent: 'center', alignItems: 'flex-end' },
});
