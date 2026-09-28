import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { Persona } from '@/theme/tokens';

// 모드(WORK/HOME) → 폴더 → 노트 · 할 일. 목록에는 노트와 따로 적은 할 일이 함께 나온다.
export type Due = { date: string; time?: string }; // date: YYYY-MM-DD, time: HH:mm
export type Block =
  | { id: string; type: 'text'; text: string }
  | { id: string; type: 'todo'; text: string; done: boolean; due?: Due };
export type Item = {
  id: string;
  persona: Persona;
  kind: 'note' | 'todo';
  title: string;
  preview?: string; // 노트 미리보기, 할 일은 짧은 메모
  folder?: string;
  pinned?: boolean;
  done?: boolean; // kind === 'todo'
  due?: Due; // kind === 'todo'
  createdAt: string;
  updatedAt: string;
  blocks: Block[];
};

export const FOLDERS: Record<Persona, string[]> = {
  WORK: ['디자인팀', 'AI TF'],
  HOME: ['이사', '장보기'],
};

// ---------- 날짜 ----------
const pad = (n: number) => String(n).padStart(2, '0');
export const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const dotDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
};
export function editedLabel(iso: string) {
  const d = new Date(iso);
  const h = d.getHours();
  const time = `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${pad(d.getMinutes())}`;
  const sameDay = d.toDateString() === new Date().toDateString();
  return `${sameDay ? '오늘' : `${d.getMonth() + 1}월 ${d.getDate()}일`} ${time}`;
}

// 근무 시간(평일 09–18시)에는 WORK, 그 외에는 HOME
export function personaByClock(now = new Date()): Persona {
  const weekday = now.getDay() >= 1 && now.getDay() <= 5;
  const h = now.getHours();
  return weekday && h >= 9 && h < 18 ? 'WORK' : 'HOME';
}

// "@work 견적서 요청 내일 3시" → 모드 · 날짜 · 내용
export function parseQuickText(raw: string) {
  const tag = raw.match(/@(work|home|회사|집)/i)?.[1].toLowerCase();
  const persona: Persona | undefined = tag === 'work' || tag === '회사' ? 'WORK' : tag === 'home' || tag === '집' ? 'HOME' : undefined;
  const m = raw.match(/(오늘|내일|모레)(?:\s*(오전|오후)?\s*(\d{1,2})시(?:\s*(\d{1,2})분)?)?/);
  let due: Due | undefined;
  if (m) {
    const offset = { 오늘: 0, 내일: 1, 모레: 2 }[m[1] as '오늘' | '내일' | '모레'];
    due = { date: toKey(addDays(new Date(), offset)) };
    if (m[3]) {
      let h = Number(m[3]);
      if (m[2] === '오후' && h < 12) h += 12;
      if (!m[2] && h >= 1 && h <= 7) h += 12; // "3시"는 오후 3시로 읽는다
      due.time = `${pad(h)}:${pad(Number(m[4] ?? 0))}`;
    }
  }
  const text = raw.replace(/@(work|home|회사|집)/gi, '').replace(m?.[0] ?? '', '').replace(/\s+/g, ' ').trim();
  return { text, due, persona };
}

// ---------- 예시 데이터 (피그마 화면과 같은 내용) ----------
let seq = 0;
const uid = () => `b${++seq}`;
const t = (text: string): Block => ({ id: uid(), type: 'text', text });
const todo = (text: string, done = false): Block => ({ id: uid(), type: 'todo', text, done });
const at = (iso: string) => new Date(iso).toISOString();

function seed(): Item[] {
  const meeting = '9/14(월) 그래픽파트 전달 사항 슬랙 디엠 전달하고 공지사항으로';
  return [
    { id: 'weekly', persona: 'WORK', kind: 'note', title: '주간회의', preview: meeting, folder: '디자인팀', pinned: true, createdAt: at('2026-09-12T09:00'), updatedAt: at('2026-09-12T09:00'), blocks: [t(meeting)] },
    { id: 'resource', persona: 'WORK', kind: 'note', title: '리소스 추출 가이드', preview: meeting, folder: '디자인팀', createdAt: at('2026-09-12T10:00'), updatedAt: at('2026-09-12T10:00'), blocks: [t(meeting)] },
    { id: 'card', persona: 'WORK', kind: 'todo', title: '법인카드 결제 기안 올리기', preview: '영수증', done: false, createdAt: at('2026-09-12T11:00'), updatedAt: at('2026-09-12T11:00'), blocks: [] },
    { id: 'launch', persona: 'WORK', kind: 'note', title: '신규 런칭', preview: '드로어에 있는 메뉴들 정돈하고 아이콘들 R값 변경하는 건 전사적으로', folder: 'AI TF', createdAt: at('2026-09-12T12:00'), updatedAt: at('2026-09-12T12:00'), blocks: [t('드로어에 있는 메뉴들 정돈하고 아이콘들 R값 변경하는 건 전사적으로')] },
    {
      id: 'a-quote', persona: 'WORK', kind: 'note', title: 'A사 견적 미팅', preview: '단가 5% 조정 요청, 납기 11월 둘째 주 희망', folder: '디자인팀',
      createdAt: at('2026-09-12T13:00'), updatedAt: new Date().toISOString(),
      blocks: [
        t('9/28 10시, 구매팀 박과장 외 2명.'),
        t('단가는 작년 대비 5% 조정 요청. 납기 11월 둘째 주 희망. 샘플 2종 추가 요청.'),
        todo('회의록 공유', true),
        todo('견적서 수정본 회신'),
        todo('납기 가능 여부 생산팀 확인'),
      ],
    },
    { id: 'moving', persona: 'HOME', kind: 'note', title: '주말 이사 준비', preview: '토요일 오전 9시 트럭 도착. 냉장고는 전날 비우기.', folder: '이사', pinned: true, createdAt: at('2026-09-20T20:00'), updatedAt: at('2026-09-20T20:00'), blocks: [t('토요일 오전 9시 트럭 도착. 냉장고는 전날 비우기.'), todo('관리사무소 엘리베이터 예약'), todo('인터넷 이전 신청')] },
    { id: 'internet', persona: 'HOME', kind: 'todo', title: '인터넷 이전 신청', preview: '통신사 고객센터', folder: '이사', done: false, createdAt: at('2026-09-21T21:00'), updatedAt: at('2026-09-21T21:00'), blocks: [] },
    { id: 'groceries', persona: 'HOME', kind: 'note', title: '장보기', preview: '우유, 계란, 세제, 키친타월', folder: '장보기', createdAt: at('2026-09-22T19:00'), updatedAt: at('2026-09-22T19:00'), blocks: [todo('우유, 계란, 세제'), todo('키친타월')] },
  ];
}

// ---------- 상태 ----------
type Store = {
  persona: Persona;
  setPersona: (p: Persona) => void;
  items: Item[];
  toggleDone: (itemId: string) => void;
  toggleBlock: (itemId: string, blockId: string) => void;
  updateBlock: (itemId: string, blockId: string, text: string) => void;
  renameItem: (itemId: string, title: string) => void;
  addTodoBlock: (itemId: string, text: string) => void;
  quickAdd: (raw: string, fallback: Persona, folder?: string) => Persona | null;
  deleteItem: (itemId: string) => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<Persona>(() => personaByClock());
  const [items, setItems] = useState<Item[]>(seed);

  const store = useMemo<Store>(() => {
    const touch = (id: string, fn: (n: Item) => Item) =>
      setItems((all) => all.map((n) => (n.id === id ? { ...fn(n), updatedAt: new Date().toISOString() } : n)));
    return {
      persona, setPersona, items,
      toggleDone: (id) => touch(id, (n) => ({ ...n, done: !n.done })),
      toggleBlock: (id, blockId) =>
        touch(id, (n) => ({ ...n, blocks: n.blocks.map((b) => (b.id === blockId && b.type === 'todo' ? { ...b, done: !b.done } : b)) })),
      updateBlock: (id, blockId, text) => touch(id, (n) => ({ ...n, blocks: n.blocks.map((b) => (b.id === blockId ? { ...b, text } : b)) })),
      renameItem: (id, title) => touch(id, (n) => ({ ...n, title })),
      addTodoBlock: (id, text) => {
        if (text.trim()) touch(id, (n) => ({ ...n, blocks: [...n.blocks, todo(text.trim())] }));
      },
      quickAdd: (raw, fallback, folder) => {
        const parsed = parseQuickText(raw);
        if (!parsed.text) return null;
        const target = parsed.persona ?? fallback;
        const now = new Date().toISOString();
        setItems((all) => [
          { id: `q${Date.now()}`, persona: target, kind: 'todo', title: parsed.text, done: false, due: parsed.due, folder, createdAt: now, updatedAt: now, blocks: [] },
          ...all,
        ]);
        return target;
      },
      deleteItem: (id) => setItems((all) => all.filter((n) => n.id !== id)),
    };
  }, [persona, items]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}

export function todoProgress(n: Item) {
  const todos = n.blocks.filter((b) => b.type === 'todo');
  return `할 일 ${todos.filter((b) => b.type === 'todo' && b.done).length}/${todos.length}`;
}
