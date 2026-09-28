// 피그마 "목록 스와이프 삭제": 왼쪽으로 밀면 행이 74px 밀리고 오른쪽 끝에 빨간 삭제 버튼이 나온다
import { forwardRef, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import ReanimatedSwipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

import { Icon } from '@/components/Icon';
import { colors } from '@/theme/tokens';

export const SWIPE_OPEN = 74;

export const SwipeRow = forwardRef<
  SwipeableMethods,
  { children: ReactNode; onDelete: () => void; onOpen: () => void; onClose: () => void }
>(function SwipeRow({ children, onDelete, onOpen, onClose }, ref) {
  return (
    <ReanimatedSwipeable
      ref={ref}
      friction={1.4}
      rightThreshold={SWIPE_OPEN / 2}
      overshootRight={false}
      onSwipeableWillOpen={onOpen}
      onSwipeableClose={onClose}
      renderRightActions={() => (
        <View style={s.actions}>
          <Pressable onPress={onDelete} style={({ pressed }) => [s.delete, pressed && { opacity: 0.8 }]} accessibilityLabel="삭제">
            <Icon name="trash" />
          </Pressable>
        </View>
      )}
    >
      <View style={s.content}>{children}</View>
    </ReanimatedSwipeable>
  );
});

const s = StyleSheet.create({
  // 행 좌우 여백(16)은 스와이프 안쪽에 둔다: 밀린 내용이 화면 끝에서 잘리도록
  content: { paddingHorizontal: 16, backgroundColor: colors.bgSurface },
  actions: { width: SWIPE_OPEN, paddingRight: 16, alignItems: 'flex-end', justifyContent: 'center' },
  delete: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, backgroundColor: colors.danger },
});
