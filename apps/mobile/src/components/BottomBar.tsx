// 피그마 01 하단(QuickBar)과 03 입력창(Composer): 어두운 바닥 위의 모드 전환 · + · 새로운 할 일
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { colors, type, type Persona } from '@/theme/tokens';

export const BAR_ROW_H = 72;

export function BottomBar({
  persona,
  onPersona,
  onAdd,
}: {
  persona: Persona;
  onPersona: (p: Persona) => void;
  onAdd: () => void;
}) {
  return (
    <View style={s.row}>
      <View style={s.segment}>
        {(['WORK', 'HOME'] as Persona[]).map((p) => {
          const on = p === persona;
          return (
            <Pressable
              key={p}
              onPress={() => onPersona(p)}
              style={[s.pill, on ? { backgroundColor: colors.bgSurface } : { opacity: 0.4 }]}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
            >
              <Text style={[type.button, { color: on ? colors.textInk : colors.onCanvas }]}>{p}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable onPress={onAdd} hitSlop={8} accessibilityLabel="새로운 할 일">
        <Icon name="fab" />
      </Pressable>
    </View>
  );
}

// 03 빠른 추가: 키보드 바로 위에 붙는 입력창
export function Composer({
  persona,
  value,
  onChange,
  onPersona,
  onSend,
}: {
  persona: Persona;
  value: string;
  onChange: (v: string) => void;
  onPersona: () => void;
  onSend: () => void;
}) {
  return (
    <View style={s.composer}>
      <View style={s.field}>
        <TextInput
          autoFocus
          value={value}
          onChangeText={onChange}
          multiline
          placeholder="@work 견적서 요청 내일 3시"
          placeholderTextColor={colors.onCanvasPlaceholder}
          selectionColor={colors.accent}
          style={[type.input, s.input]}
        />
        <Pressable onPress={onPersona} style={s.picker} hitSlop={8} accessibilityLabel="모드 바꾸기">
          <Text style={[type.button, { color: colors.onCanvas }]}>{persona}</Text>
          <Icon name="caretDown" />
        </Pressable>
      </View>
      <Pressable onPress={onSend} hitSlop={8} accessibilityLabel="보내기">
        <Icon name="send" />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  row: { height: BAR_ROW_H, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  segment: { flexDirection: 'row', alignItems: 'center' },
  pill: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 40 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingTop: 10, paddingBottom: 12, paddingHorizontal: 12 },
  field: { flex: 1, height: 145, borderRadius: 24, backgroundColor: colors.inputFill },
  input: { position: 'absolute', left: 16, right: 16, top: 16, bottom: 44, padding: 0, margin: 0, color: colors.onCanvas },
  picker: { position: 'absolute', left: 19, top: 114, flexDirection: 'row', alignItems: 'center' },
});
