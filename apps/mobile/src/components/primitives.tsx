// 피그마 컴포넌트: Todo/Checkbox, Note/ListItem, Note/PinnedCard, List/PinnedLabel, Folder/Chip
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { colors, type } from '@/theme/tokens';

export function Checkbox({ done, onPress }: { done: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={s.iconBox} disabled={!onPress}>
      {done ? <Icon name="checkboxDone" /> : <View style={s.box} />}
    </Pressable>
  );
}

export function ListItem({
  kind,
  title,
  preview,
  date,
  done,
  onToggle,
  onPress,
}: {
  kind: 'note' | 'todo';
  title: string;
  preview?: string;
  date: string;
  done?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
}) {
  return (
    <Pressable style={({ pressed }) => [s.item, pressed && { opacity: 0.6 }]} onPress={onPress}>
      {kind === 'note' ? <Icon name="note" /> : <Checkbox done={!!done} onPress={onToggle} />}
      <View style={s.itemText}>
        <View style={{ gap: 2 }}>
          <Text style={[type.item, { color: colors.textInk }, done && { opacity: 0.4 }]}>{title}</Text>
          {!!preview && (
            <Text style={[type.bodySmall, { color: colors.textMuted }]} numberOfLines={1}>
              {preview}
            </Text>
          )}
        </View>
        <Text style={[type.date, { color: colors.textMuted }]}>{date}</Text>
      </View>
    </Pressable>
  );
}

export function PinnedLabel({ label = '상단 고정' }: { label?: string }) {
  return (
    <View style={s.pinnedLabel}>
      <Icon name="pin" />
      <Text style={[type.section, { color: colors.textFaint }]}>{label}</Text>
    </View>
  );
}

export function PinnedCard(props: Parameters<typeof ListItem>[0]) {
  return (
    <View style={s.pinnedCard}>
      <ListItem {...props} />
    </View>
  );
}

export function FolderChip({
  label,
  state,
  onPress,
}: {
  label: string;
  state: 'selected' | 'default' | 'add';
  onPress?: () => void;
}) {
  const on = state === 'selected';
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, on ? s.chipOn : s.chipOff]}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
    >
      {state === 'add' && <Icon name="plus" />}
      <Text style={[on ? type.chipSelected : type.chip, { color: on ? colors.textInk : colors.textFaint }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  iconBox: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  box: { width: 18, height: 18, borderRadius: 6, borderWidth: 1.5, borderColor: colors.textFaint },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  itemText: { flex: 1, gap: 4 },
  pinnedLabel: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  pinnedCard: { padding: 10, borderRadius: 16, borderWidth: 1, borderColor: colors.borderSubtle },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 100, borderWidth: 1 },
  chipOn: { backgroundColor: colors.bgSelected, borderColor: colors.borderSelected },
  chipOff: { borderColor: colors.borderDefault },
});
