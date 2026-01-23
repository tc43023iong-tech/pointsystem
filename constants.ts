
import { PointAction } from './types';

export const POKEMON_COUNT = 500;

export const ACTIONS: PointAction[] = [
  // Positive (加分行為)
  { labelEn: "good participation", labelZh: "積極參與", points: 1, type: 'positive' },
  { labelEn: "well focused", labelZh: "專心上課", points: 1, type: 'positive' },
  { labelEn: "diligent learning", labelZh: "認真學習", points: 1, type: 'positive' },
  { labelEn: "quiet eating", labelZh: "安靜吃飯", points: 1, type: 'positive' },
  { labelEn: "participating in exercises", labelZh: "配合做課間操", points: 1, type: 'positive' },
  { labelEn: "respect miss iong!", labelZh: "尊重容老師！", points: 3, type: 'positive' },
  { labelEn: "You made Miss Iong so happy! 😊", labelZh: "你太讓容老師高興了😊！", points: 5, type: 'positive' },
  { labelEn: "You are simply amazing 🥳👍!", labelZh: "你簡直太棒了🥳👍！", points: 10, type: 'positive' },
  
  // Negative (減分行為)
  { labelEn: "bad attitude", labelZh: "態度欠佳", points: -1, type: 'negative' },
  { labelEn: "noisy", labelZh: "過於吵鬧", points: -1, type: 'negative' },
  { labelEn: "leaving seat", labelZh: "離開座位", points: -1, type: 'negative' },
  { labelEn: "not paying attention", labelZh: "不專心", points: -1, type: 'negative' },
  { labelEn: "chatting in class", labelZh: "課上聊天", points: -1, type: 'negative' },
  { labelEn: "disrespectful to miss iong", labelZh: "對容老師無禮", points: -3, type: 'negative' },
  { labelEn: "You disappointed Miss Iong! 😢", labelZh: "你太令容老師失望了😢！", points: -5, type: 'negative' },
  { labelEn: "You have gone too far 😡!", labelZh: "你太過分/離譜了😡！", points: -10, type: 'negative' },
];

export const ACADEMIC_ACTIONS: PointAction[] = [
  { labelEn: "Score 100 or above", labelZh: "100或以上", points: 25, type: 'positive' },
  { labelEn: "Score 90～99", labelZh: "90～99", points: 20, type: 'positive' },
  { labelEn: "Score 80～89", labelZh: "80～89", points: 15, type: 'positive' },
  { labelEn: "Score 70～79", labelZh: "70～79", points: 10, type: 'positive' },
  { labelEn: "Score 60～69", labelZh: "60～69", points: 5, type: 'positive' },
];

const parseClassList = (name: string, list: string): any[] => {
  return list.split('\n').filter(l => l.trim()).map(line => {
    const parts = line.trim().split(/\s+/);
    const rollNo = parseInt(parts[0]);
    const studentName = parts.slice(1).join(' ');
    
    const isCuteSeed = Math.random() > 0.3;
    const pokemonId = isCuteSeed 
      ? Math.floor(Math.random() * 151) + 1 
      : Math.floor(Math.random() * POKEMON_COUNT) + 1;

    return {
      id: `${name}-${rollNo}`,
      rollNo,
      name: studentName,
      points: 0,
      posPoints: 0,
      negPoints: 0,
      pokemonId
    };
  });
};

export const INITIAL_CLASSES = [
  {
    id: '3b-en',
    className: '三乙 英文 (3B English)',
    students: parseClassList('3b-en', `1 陳芷柔\n2 陳沛詩\n3 鄭穎彤\n4 張晉熙\n5 朱善恆\n6 馮子陽\n7 傅玥寧\n8 高宇皓\n9 何梓瑤\n10 何金霏\n11 何冠奇\n12 黃欣彤\n13 黎芷楹\n14 黎子滔\n15 林子洋\n17 雷翊權\n18 李祤軒\n19 梁子泓\n20 梁皓宸\n21 梁依晴\n22 廖巧澄\n23 駱峻霆\n24 伍嘉豪\n25 蕭家軒\n26 譚灝楊\n27 丁子皓\n28 黃芊諭\n29 王美樂\n30 許君豪\n31 周海嵐\n32 朱麗媛`)
  },
  {
    id: '3b-pt',
    className: '三乙 普通話 (3B Mandarin)',
    students: parseClassList('3b-pt', `1 陳芷柔\n2 陳沛詩\n3 鄭穎彤\n4 張晉熙\n5 朱善恆\n6 馮子陽\n7 傅玥寧\n8 高宇皓\n9 何梓瑤\n10 何金霏\n11 何冠奇\n12 黃欣彤\n13 黎芷楹\n14 黎子滔\n15 林子洋\n17 雷翊權\n18 李祤軒\n19 梁子泓\n20 梁皓宸\n21 梁依晴\n22 廖巧澄\n23 駱峻霆\n24 伍嘉豪\n25 蕭家軒\n26 譚灝楊\n27 丁子皓\n28 黃芊諭\n29 王美樂\n30 許君豪\n31 周海嵐\n32 朱麗媛`)
  },
  {
    id: '4b-pt',
    className: '四乙 普通話 (4B Mandarin)',
    students: parseClassList('4b-pt', `1 陳沁儀\n2 陳信豪\n3 周詩蕎\n4 鄭瑩瑩\n5 鄭泓昊\n6 蔣沁妍\n7 甘子賢\n8 關子謙\n9 謝欣晏\n10 黃楚堯\n11 黃翰皓\n12 容毓俊\n13 李可欣\n14 陸皆橋\n15 馬超芸\n16 麥嘉俐\n17 牟智杰\n18 潘思涵\n19 蕭珈睿\n20 黃一進\n21 王美琳\n22 趙梓琳\n23 趙慕辰`)
  },
  {
    id: '4b-en',
    className: '四乙 英文 (4B English)',
    students: parseClassList('4b-en', `1 陳沁儀\n2 陳信豪\n3 周詩蕎\n4 鄭瑩瑩\n5 鄭泓昊\n6 蔣沁妍\n7 甘子賢\n8 關子謙\n9 謝欣晏\n10 黃楚堯\n11 黃翰皓\n12 容毓俊\n13 李可欣\n14 陸皆橋\n15 馬超芸\n16 麥嘉俐\n17 牟智杰\n18 潘思涵\n19 蕭珈睿\n20 黃一進\n21 王美琳\n22 趙梓琳\n23 趙慕辰`)
  },
  {
    id: '4c-pt',
    className: '四丙 普通話 (4C Mandarin)',
    students: parseClassList('4c-pt', `1 曾子朗\n2 鄭翊翔\n3 陳梓晴\n4 許芝霖\n5 康安娜\n6 胡栩豪\n7 黃璐媛\n8 黃詩皓\n9 嚴穎兒\n10 林晉毅\n11 林雅妍\n12 林寶堅\n13 李凱聰\n14 梁語穎\n15 龍紀潼\n16 盧航俊\n17 盧俊俐\n18 莫芷晴\n19 歐陽健豐\n20 邱佳茵\n21 余樂恆\n22 鍾倬民\n23 鍾倬承`)
  },
  {
    id: '4c-civ',
    className: '四丙 公民 (4C Civics)',
    students: parseClassList('4c-civ', `1 曾子朗\n2 鄭翊翔\n3 陳梓晴\n4 許芝霖\n5 康安娜\n6 胡栩豪\n7 黃璐媛\n8 黃詩皓\n9 嚴穎兒\n10 林晉毅\n11 林雅妍\n12 林寶堅\n13 李凱聰\n14 梁語穎\n15 龍紀潼\n16 盧航俊\n17 盧俊俐\n18 莫芷晴\n19 歐陽健豐\n20 邱佳茵\n21 余樂恆\n22 鍾倬民\n23 鍾倬承`)
  },
  {
    id: '5b-pt',
    className: '五乙 普通話 (5B Mandarin)',
    students: parseClassList('5b-pt', `1 歐陽卓軒\n2 陳至濠\n3 謝穎琳\n4 鄭智泓\n5 鄭澳因\n6 陳靜妍\n7 陳浩\n8 霍菁\n9 黃羲辰\n10 郭芷晴\n11 林安娜\n12 劉樂澄\n13 李梓樂\n14 李天恩\n15 梁康妮\n16 梁語翹\n17 梁智中\n18 梁賢正\n19 梁伽藍\n20 梁凱嵐\n21 劉一鳴\n22 盧紫君\n23 呂建羲\n24 馬梓倫\n25 吳子軒\n26 吳梓浩\n27 吳穎詩\n28 彭賢信\n29 施泓軒\n30 蕭昊恩\n31 蘇健羽\n32 田浩成\n33 唐敏裕\n34 黃浩藍`)
  }
];
