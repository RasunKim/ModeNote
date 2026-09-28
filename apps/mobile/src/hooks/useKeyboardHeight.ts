import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

// 키보드가 올라오면 그 높이를 돌려준다 (입력창 · 도구 막대를 키보드 바로 위에 붙이기 위해)
export function useKeyboardHeight() {
  const [h, setH] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillShow', (e) => setH(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardWillHide', () => setH(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return h;
}
