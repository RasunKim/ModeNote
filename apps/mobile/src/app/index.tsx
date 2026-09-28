// 피그마 01 메인 · 03 빠른 추가: 어두운 바닥 위의 흰 노트 시트 + 하단 모드 전환 / 입력창
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BAR_ROW_H, BottomBar, Composer } from '@/components/BottomBar';
import { FolderChip, ListItem, PinnedCard, PinnedLabel } from '@/components/primitives';
import { SwipeRow } from '@/components/SwipeRow';
import { dotDate, FOLDERS, useStore, type Item } from '@/data/store';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { colors, type Persona } from '@/theme/tokens';

const COMPOSER_H = 10 + 145 + 12;
const SHEET_GAP = 9;

export default function Main() {
  const insets = useSafeAreaInsets();
  const { persona, setPersona, items, toggleDone, quickAdd, deleteItem } = useStore();
  // 링크로 모드 · 입력 · 밀린 행을 지정해 열 수 있다: halfnote:///?persona=HOME&compose=1&swiped=resource
  const params = useLocalSearchParams<{ persona?: string; compose?: string; swiped?: string }>();
  const [folder, setFolder] = useState('전체');
  const [composing, setComposing] = useState(() => !!params.compose);
  const [draft, setDraft] = useState('');
  const keyboard = useKeyboardHeight();
  // 스와이프로 열린 행은 한 번에 하나만
  const rows = useRef(new Map<string, SwipeableMethods>());
  const [openId, setOpenId] = useState<string | null>(null);
  const closeOpenRow = () => {
    if (openId) rows.current.get(openId)?.close();
    setOpenId(null);
  };
  useEffect(() => {
    if (params.persona === 'WORK' || params.persona === 'HOME') setPersona(params.persona);
  }, [params.persona, setPersona]);
  useEffect(() => {
    if (!params.swiped) return;
    const id = setTimeout(() => rows.current.get(params.swiped!)?.openRight(), 400);
    return () => clearTimeout(id);
  }, [params.swiped]);

  const switchPersona = (p: Persona) => {
    closeOpenRow();
    setPersona(p);
    setFolder('전체');
  };
  const closeComposer = () => {
    Keyboard.dismiss();
    setComposing(false);
  };
  const send = () => {
    const to = quickAdd(draft, persona, folder === '전체' ? undefined : folder);
    if (!to) return;
    if (to !== persona) switchPersona(to);
    setDraft('');
    closeComposer();
  };

  const mine = items.filter((i) => i.persona === persona && (folder === '전체' || i.folder === folder));
  const pinned = mine.filter((i) => i.pinned);
  const rest = mine.filter((i) => !i.pinned);
  const bottom = composing ? COMPOSER_H + (keyboard || insets.bottom) : BAR_ROW_H + insets.bottom;
  // 열린 행이 있으면 누르면 먼저 닫는다
  const open = (i: Item) => (openId ? closeOpenRow() : router.push({ pathname: '/note/[id]', params: { id: i.id } }));
  const itemProps = (i: Item) => ({
    kind: i.kind,
    title: i.title,
    preview: i.preview,
    date: dotDate(i.createdAt),
    done: i.done,
    onToggle: () => toggleDone(i.id),
    onPress: () => open(i),
  });

  return (
    <View style={s.screen}>
      {/* 노트 시트 */}
      <View style={[s.sheet, { bottom: bottom + SHEET_GAP }]}>
        <ScrollView contentContainerStyle={{ paddingTop: insets.top + 17, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          {pinned.length > 0 && (
            <View style={s.pinned}>
              <View style={{ paddingLeft: 10 }}>
                <PinnedLabel />
              </View>
              {pinned.map((i) => (
                <PinnedCard key={i.id} {...itemProps(i)} />
              ))}
            </View>
          )}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.folders}>
            {['전체', ...FOLDERS[persona]].map((f) => (
              <FolderChip
                key={f}
                label={f}
                state={f === folder ? 'selected' : 'default'}
                onPress={() => {
                  closeOpenRow();
                  setFolder(f);
                }}
              />
            ))}
            <FolderChip label="폴더추가" state="add" />
          </ScrollView>
          <View style={s.list}>
            {rest.map((i) => (
              <Animated.View key={i.id} exiting={FadeOut.duration(160)} layout={LinearTransition.duration(200)}>
                <SwipeRow
                  ref={(r) => {
                    if (r) rows.current.set(i.id, r);
                    else rows.current.delete(i.id);
                  }}
                  onOpen={() => {
                    if (openId && openId !== i.id) rows.current.get(openId)?.close();
                    setOpenId(i.id);
                  }}
                  onClose={() => setOpenId((cur) => (cur === i.id ? null : cur))}
                  onDelete={() => {
                    setOpenId(null);
                    deleteItem(i.id);
                  }}
                >
                  <ListItem {...itemProps(i)} />
                </SwipeRow>
              </Animated.View>
            ))}
          </View>
        </ScrollView>
        {/* 입력 중에는 시트를 누르면 입력창이 닫힌다 */}
        {composing && <Pressable style={StyleSheet.absoluteFill} onPress={closeComposer} accessibilityLabel="입력 닫기" />}
      </View>

      {/* 하단: 모드 전환 · + / 입력창 */}
      {composing ? (
        <View style={[s.bottom, { bottom: keyboard || insets.bottom }]}>
          <Composer
            persona={persona}
            value={draft}
            onChange={setDraft}
            onPersona={() => switchPersona(persona === 'WORK' ? 'HOME' : 'WORK')}
            onSend={send}
          />
        </View>
      ) : (
        <View style={[s.bottom, { bottom: 0, paddingBottom: insets.bottom }]}>
          <BottomBar persona={persona} onPersona={switchPersona} onAdd={() => setComposing(true)} />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  sheet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: colors.bgSurface,
  },
  pinned: { paddingHorizontal: 10, paddingBottom: 29, gap: 9 },
  folders: { paddingHorizontal: 14, paddingBottom: 17, gap: 8 },
  list: { paddingVertical: 8, gap: 20 },
  bottom: { position: 'absolute', left: 0, right: 0 },
});
