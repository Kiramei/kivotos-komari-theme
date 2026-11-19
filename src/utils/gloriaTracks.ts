// 基沃托斯学生名册：为节点随机分配不重复的学生标签。
export const GLORIA_PRIORITY_TRACKS = [
  '阿罗娜',
  '普拉娜',
  '白子',
  '星野',
  '优香',
  '日奈',
  '亚子',
  '阿露',
  '日富美',
  '爱丽丝',
  '桃井',
  '绿',
  '柚子',
  '未花',
  '渚',
  '圣娅',
  '真纪',
  '响',
  '花子',
  '若藻',
] as const

export const GLORIA_TRACKS = [
  '阿罗娜',
  '普拉娜',
  '白子',
  '星野',
  '优香',
  '日奈',
  '亚子',
  '阿露',
  '日富美',
  '爱丽丝',
  '桃井',
  '绿',
  '柚子',
  '未花',
  '渚',
  '圣娅',
  '真纪',
  '响',
  '花子',
  '若藻',
  '芹香',
  '野宫',
  '绫音',
  '晴奈',
  '泉',
  '明里',
  '顺子',
  '千夏',
  '伊织',
  '千寻',
  '小春',
  '梓',
  '鹤城',
  '花凛',
  '明日奈',
  '朱音',
  '妮露',
  '瞬',
  '妃咲',
  '美咲',
  '日和',
  '亚津子',
  '和纱',
  '萌惠',
  '诺亚',
  '琴里',
  '堇',
  '切里诺',
  '玛丽',
  '歌原',
  '千世',
  '睦月',
  '加代子',
  '春香',
  '美祢',
  '莲见',
  '美游',
  '咲',
  '兔',
  '小雪',
  '麻里',
  '芽瑠',
  '忧',
] as const

let sessionSeed: number | null = null

function getSessionSeed(): number {
  if (sessionSeed !== null)
    return sessionSeed

  const random = new Uint32Array(1)
  globalThis.crypto?.getRandomValues?.(random)
  sessionSeed = random[0] || Date.now()
  return sessionSeed
}

function createRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state += 0x6D2B79F5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function assignUniqueGloriaTracks(nodeIds: string[]): Map<string, string> {
  const sortedNodeIds = [...new Set(nodeIds)].sort((a, b) => a.localeCompare(b))
  const priorityTracks = new Set<string>(GLORIA_PRIORITY_TRACKS)
  const otherTracks = GLORIA_TRACKS.filter(track => !priorityTracks.has(track))
  const random = createRandom(getSessionSeed())

  for (let index = otherTracks.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1))
    const currentTrack = otherTracks[index]!
    otherTracks[index] = otherTracks[target]!
    otherTracks[target] = currentTrack
  }

  const tracks = [...GLORIA_PRIORITY_TRACKS, ...otherTracks]

  return new Map(sortedNodeIds.map((nodeId, index) => [
    nodeId,
    tracks[index % tracks.length]!,
  ]))
}
