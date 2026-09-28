// Figma "Note App" 변수와 텍스트 스타일(한글은 Pretendard)을 그대로 옮긴 토큰.
import type { TextStyle } from 'react-native';

export const colors = {
  canvas: '#1C2024',
  bgSurface: '#FFFFFF',
  bgSelected: 'rgba(0,0,0,0.1)',
  textInk: '#1C2024',
  textMuted: '#5F666E',
  textFaint: '#8C939A',
  textBack: 'rgba(0,0,0,0.4)',
  borderSubtle: 'rgba(0,0,0,0.1)',
  borderDefault: 'rgba(0,0,0,0.17)',
  borderSelected: 'rgba(0,0,0,0.8)',
  borderStrong: '#000000',
  inputFill: 'rgba(185,191,206,0.22)',
  onCanvas: '#FFFFFF',
  onCanvasFaint: 'rgba(255,255,255,0.4)',
  onCanvasPlaceholder: 'rgba(255,255,255,0.2)',
  accent: '#FF5B14',
  danger: '#FF3C1A',
} as const;

export type Persona = 'WORK' | 'HOME';

export const fonts = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semiBold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
} as const;

// letterSpacing은 Figma의 % 값을 px로 환산 (size × % / 100)
export const type = {
  title: { fontFamily: fonts.bold, fontSize: 23, lineHeight: 34, letterSpacing: -0.23 },
  back: { fontFamily: fonts.semiBold, fontSize: 17, lineHeight: 22 },
  item: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 22 },
  input: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22 },
  chip: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 18, letterSpacing: -0.045 },
  chipSelected: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 18, letterSpacing: -0.045 },
  meta: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 19 },
  section: { fontFamily: fonts.semiBold, fontSize: 14, lineHeight: 19 },
  button: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 17 },
  bodySmall: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19 },
  tool: { fontFamily: fonts.semiBold, fontSize: 12, lineHeight: 16 },
  date: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 19 },
} satisfies Record<string, TextStyle>;
