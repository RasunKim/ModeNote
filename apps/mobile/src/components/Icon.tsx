import { Image } from 'expo-image';
import { View } from 'react-native';

// 피그마에서 내보낸 아이콘 벡터. 아이콘 박스 안에서 벡터가 차지하는 자리(inset)와
// 선 두께만큼 바깥으로 번지는 여백(bleed)을 피그마 값 그대로 둔다. [top, right, bottom, left] 비율.
// rect는 박스 안 벡터 이미지의 [left, top, width, height](px)를 직접 준 경우.
type Spec = { src: number; size: number; inset?: number[]; bleed?: number[]; rect?: number[] };
const all = (v: number) => [v, v, v, v];
const tb = (y: number, x: number) => [y, x, y, x];

const icons = {
  note: { src: require('../../assets/figma/note.svg'), size: 24, rect: [4.01, 4.19, 15.98, 16.615] },
  pin: { src: require('../../assets/figma/pin-16.svg'), size: 16, inset: tb(0.0833, 0.2083), bleed: tb(-0.0675, -0.0964) },
  plus: { src: require('../../assets/figma/plus-14.svg'), size: 14, inset: all(0.2083), bleed: all(-0.1102) },
  back: { src: require('../../assets/figma/chevron-left-gray.svg'), size: 26, inset: tb(0.25, 0.375), bleed: tb(-0.0692, -0.1385) },
  checkboxDone: { src: require('../../assets/figma/checkbox-done.svg'), size: 24, rect: [-0.9, -0.9, 25.8, 25.8] },
  more: { src: require('../../assets/figma/more.svg'), size: 24, inset: tb(0.4583, 0.1667), bleed: tb(-0.45, -0.0562) },
  toolTodo: { src: require('../../assets/figma/check-square-white.svg'), size: 16, inset: all(0.125), bleed: all(-0.075) },
  toolDate: { src: require('../../assets/figma/calendar-white.svg'), size: 16, inset: tb(0.0833, 0.125), bleed: tb(-0.0675, -0.075) },
  toolHeading: { src: require('../../assets/figma/heading-white.svg'), size: 16, inset: tb(0.1667, 0.25), bleed: tb(-0.0844, -0.1125) },
  toolList: { src: require('../../assets/figma/list-white.svg'), size: 16, inset: [0.25, 0.1667, 0.25, 0.1875], bleed: tb(-0.1125, -0.0871) },
  toolDismiss: { src: require('../../assets/figma/chevron-down-22.svg'), size: 22, inset: tb(0.375, 0.25), bleed: tb(-0.1636, -0.0818) },
  caretDown: { src: require('../../assets/figma/caret-down-white.svg'), size: 16, rect: [0, 0, 16, 16] },
  fab: { src: require('../../assets/figma/fab-orange.svg'), size: 40, rect: [0, 0, 40, 40] },
  send: { src: require('../../assets/figma/send-orange.svg'), size: 40, rect: [0, 0, 40, 40] },
  trash: { src: require('../../assets/figma/delete-button.svg'), size: 24, rect: [0, 0, 24, 24] },
} satisfies Record<string, Spec>;

export type IconName = keyof typeof icons;

function frame({ size, inset, bleed, rect }: Spec) {
  if (rect) return { left: rect[0], top: rect[1], width: rect[2], height: rect[3] };
  const [t, r, b, l] = inset!;
  const [bt, br, bb, bl] = bleed!;
  const gw = size * (1 - l - r);
  const gh = size * (1 - t - b);
  return { left: size * l + gw * bl, top: size * t + gh * bt, width: gw * (1 - bl - br), height: gh * (1 - bt - bb) };
}

// color를 주면 벡터 색을 바꾼다 (피그마 인스턴스의 색 덮어쓰기와 같은 역할)
export function Icon({ name, color }: { name: IconName; color?: string }) {
  const spec: Spec = icons[name];
  return (
    <View style={{ width: spec.size, height: spec.size }}>
      <Image source={spec.src} tintColor={color} contentFit="fill" style={{ position: 'absolute', ...frame(spec) }} />
    </View>
  );
}
