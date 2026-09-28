// 피그마 02 노트 편집: 어두운 바닥 위 흰 시트, 키보드 위 어두운 도구 막대
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/Icon';
import { Checkbox } from '@/components/primitives';
import { editedLabel, todoProgress, useStore } from '@/data/store';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { colors, type } from '@/theme/tokens';

const TOOLS: { icon: IconName; label: string }[] = [
  { icon: 'toolTodo', label: '할 일' },
  { icon: 'toolDate', label: '날짜' },
  { icon: 'toolHeading', label: '제목' },
  { icon: 'toolList', label: '목록' },
];
const TOOLBAR_H = 45;

export default function NoteEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { items, toggleBlock, toggleDone, updateBlock, renameItem, addTodoBlock } = useStore();
  const item = items.find((n) => n.id === id);
  const [draft, setDraft] = useState('');
  const newTodo = useRef<TextInput>(null);
  const titleInput = useRef<TextInput>(null);
  const keyboard = useKeyboardHeight();
  const onTool = (label: string) => {
    if (label === '할 일') newTodo.current?.focus();
    if (label === '날짜') setDraft((v) => (v ? `${v} 내일` : '내일'));
  };
  if (!item) return null;
  // 빈 곳을 누르면 노트는 새 할 일 줄, 따로 적은 할 일은 제목에서 키보드가 열린다
  const focusEnd = () => (item.kind === 'note' ? newTodo.current : titleInput.current)?.focus();

  return (
    <View style={s.screen}>
      <View style={[s.sheet, { marginBottom: keyboard ? keyboard + TOOLBAR_H : insets.bottom }]}>
        <View style={[s.nav, { marginTop: insets.top }]}>
          <Pressable style={s.back} onPress={() => router.back()} hitSlop={8}>
            <Icon name="back" />
            <Text style={[type.back, { color: colors.textBack }]}>{item.persona}</Text>
          </Pressable>
          <View style={s.actions}>
            {!!item.folder && (
              <View style={s.folder}>
                <Text style={[type.chip, { color: colors.borderStrong }]}>{item.folder}</Text>
              </View>
            )}
            <Icon name="more" />
          </View>
        </View>

        <ScrollView contentContainerStyle={s.content} keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled">
          <View style={{ gap: 4 }}>
            <TextInput
              ref={titleInput}
              value={item.title}
              onChangeText={(v) => renameItem(item.id, v)}
              style={[type.title, s.input, { color: colors.textInk }]}
            />
            <Text style={[type.meta, { color: colors.textMuted }]}>
              {editedLabel(item.updatedAt)}
              {item.kind === 'note' && item.blocks.some((b) => b.type === 'todo') ? ` · ${todoProgress(item)}` : ''}
            </Text>
          </View>

          {item.kind === 'todo' ? (
            // 따로 적은 할 일: 체크 한 줄과 메모
            <View style={{ gap: 12 }}>
              <View style={s.row}>
                <Checkbox done={!!item.done} onPress={() => toggleDone(item.id)} />
                <Text style={[type.item, { flex: 1, color: colors.textInk }, item.done && { opacity: 0.4 }]}>{item.title}</Text>
              </View>
              {!!item.preview && <Text style={[type.item, { color: colors.textMuted }]}>{item.preview}</Text>}
            </View>
          ) : (
            <>
              {item.blocks.some((b) => b.type === 'text') && (
                <View style={{ gap: 12 }}>
                  {item.blocks.map((b) =>
                    b.type === 'text' ? (
                      <TextInput
                        key={b.id}
                        multiline
                        scrollEnabled={false}
                        value={b.text}
                        onChangeText={(v) => updateBlock(item.id, b.id, v)}
                        style={[type.item, s.input, { color: colors.textInk }]}
                      />
                    ) : null,
                  )}
                </View>
              )}
              <View>
                {item.blocks.map((b) =>
                  b.type === 'todo' ? (
                    <View key={b.id} style={s.row}>
                      <Checkbox done={b.done} onPress={() => toggleBlock(item.id, b.id)} />
                      <TextInput
                        value={b.text}
                        onChangeText={(v) => updateBlock(item.id, b.id, v)}
                        style={[type.item, s.input, { flex: 1, color: colors.textInk }, b.done && { opacity: 0.4 }]}
                      />
                    </View>
                  ) : null,
                )}
                {/* 새 할 일 줄 */}
                <View style={s.row}>
                  <Checkbox done={false} />
                  <TextInput
                    ref={newTodo}
                    value={draft}
                    onChangeText={setDraft}
                    onSubmitEditing={() => {
                      addTodoBlock(item.id, draft);
                      setDraft('');
                    }}
                    submitBehavior="submit"
                    returnKeyType="next"
                    selectionColor={colors.accent}
                    style={[type.item, s.input, { flex: 1, color: colors.textInk }]}
                  />
                </View>
              </View>
            </>
          )}
          <Pressable style={s.filler} onPress={focusEnd} accessibilityLabel="이어서 쓰기" />
        </ScrollView>
      </View>

      {keyboard > 0 && (
        <View style={[s.toolbar, { bottom: keyboard }]}>
          {TOOLS.map(({ icon, label }) => (
            <Pressable key={label} style={s.tool} onPress={() => onTool(label)}>
              <Icon name={icon} />
              <Text style={[type.tool, { color: colors.onCanvas }]}>{label}</Text>
            </Pressable>
          ))}
          <View style={{ flex: 1 }} />
          <Pressable onPress={Keyboard.dismiss} hitSlop={8} accessibilityLabel="키보드 내리기">
            <Icon name="toolDismiss" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  sheet: { flex: 1, overflow: 'hidden', borderRadius: 24, backgroundColor: colors.bgSurface },
  nav: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 8, paddingRight: 16 },
  back: { flexDirection: 'row', alignItems: 'center' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  folder: { height: 32, justifyContent: 'center', paddingHorizontal: 10, borderRadius: 100, borderWidth: 1, borderColor: colors.borderStrong },
  content: { flexGrow: 1, paddingTop: 12, paddingHorizontal: 16, paddingBottom: 40, gap: 24 },
  filler: { flexGrow: 1, minHeight: 120 },
  input: { padding: 0, margin: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 8 },
  toolbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: TOOLBAR_H,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.canvas,
  },
  tool: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 8, paddingRight: 10, paddingVertical: 6, borderRadius: 8 },
});
