// 개발용 샘플 데이터 생성 스크립트.
// 실행:   node scripts/seed.mjs
// 정리:   node scripts/seed.mjs --clean
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import zlib from "zlib";

const SUPABASE_URL = "https://rfovcrudtubhumfbwpoy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_qYoGBTu9H2uAmrbxoov_aw_hhBugCr_";
const SELLER_PASSWORD = "seed12345";

const SELLERS = ["minji_seed", "jiho_seed", "seoyeon_seed", "doyoon_seed", "haeun_seed"];

const POSTS = [
  { seller: "minji_seed", title: "아이패드 프로 11인치 팝니다", category: "디지털기기", price: 650000, status: "판매중", description: "작년에 구매해서 상태 아주 좋아요. 케이스, 펜슬 같이 드려요." },
  { seller: "minji_seed", title: "다이슨 무선 청소기 V8", category: "생활가전", price: 120000, status: "예약중", description: "사용감 있지만 흡입력 그대로예요. 필터 새로 교체했습니다." },
  { seller: "minji_seed", title: "안 쓰는 전자레인지 나눔", category: "생활가전", price: 0, isFree: true, status: "거래완료", description: "이사 가면서 나눔합니다. 작동 잘 돼요." },
  { seller: "jiho_seed", title: "3인용 패브릭 소파", category: "가구/인테리어", price: 80000, status: "판매중", description: "이염 없고 깨끗해요. 직거래만 가능합니다." },
  { seller: "jiho_seed", title: "겨울 패딩 남성 L", category: "옷/패션잡화", price: 35000, status: "판매중", description: "두어 번 입고 세탁 후 보관했어요." },
  { seller: "jiho_seed", title: "캠핑 텐트 4인용", category: "스포츠/레저", price: 90000, status: "판매중", description: "작년 여름에 두 번 사용했어요. 방수 잘 됩니다." },
  { seller: "seoyeon_seed", title: "샤넬 립스틱 새제품", category: "뷰티/미용", price: 25000, status: "판매중", description: "선물 받았는데 색이 안 맞아서 팔아요. 미개봉입니다." },
  { seller: "seoyeon_seed", title: "요가매트 나눔합니다", category: "스포츠/레저", price: 0, isFree: true, status: "판매중", description: "몇 번 쓰고 안 써서 나눔해요. 상태 좋아요." },
  { seller: "doyoon_seed", title: "해리포터 전권 세트", category: "도서/음반/티켓", price: 30000, status: "거래완료", description: "전권 다 있어요. 밑줄이나 낙서 없습니다." },
  { seller: "doyoon_seed", title: "강아지 하우스 대형", category: "반려동물", price: 40000, status: "판매중", description: "중형견까지 사용 가능해요. 세탁 완료했습니다." },
  { seller: "haeun_seed", title: "몬스테라 화분 나눔", category: "식물", price: 0, isFree: true, status: "판매중", description: "번식이 잘 돼서 나눔해요. 화분은 별도입니다." },
  { seller: "haeun_seed", title: "닌텐도 스위치 라이트", category: "디지털기기", price: 150000, status: "예약중", description: "박스, 충전기 모두 있어요. 게임팩은 별도 판매." },
];

// ---------- 아주 작은 PNG 인코더 (외부 이미지 라이브러리 없이 Node 내장 zlib만 사용) ----------

function crc32(buf) {
  let crc = ~0;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return ~crc >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(canvas) {
  const { size, buf } = canvas;
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB

  const rowSize = size * 3;
  const raw = Buffer.alloc((rowSize + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (rowSize + 1)] = 0; // filter: none
    buf.copy(raw, y * (rowSize + 1) + 1, y * rowSize, (y + 1) * rowSize);
  }
  const idat = zlib.deflateSync(raw);

  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------- 간단한 픽셀 드로잉 도구 ----------

function makeCanvas(size, bg) {
  const buf = Buffer.alloc(size * size * 3);
  for (let i = 0; i < buf.length; i += 3) {
    buf[i] = bg[0];
    buf[i + 1] = bg[1];
    buf[i + 2] = bg[2];
  }
  return { size, buf, bg };
}

function setPixel(c, x, y, color) {
  if (x < 0 || y < 0 || x >= c.size || y >= c.size) return;
  const i = (y * c.size + x) * 3;
  c.buf[i] = color[0];
  c.buf[i + 1] = color[1];
  c.buf[i + 2] = color[2];
}

function fillRect(c, x0, y0, w, h, color) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) setPixel(c, x, y, color);
  }
}

function fillCircle(c, cx, cy, r, color) {
  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) setPixel(c, x, y, color);
    }
  }
}

function fillTriangle(c, x0, y0, x1, y1, x2, y2, color) {
  const minX = Math.min(x0, x1, x2);
  const maxX = Math.max(x0, x1, x2);
  const minY = Math.min(y0, y1, y2);
  const maxY = Math.max(y0, y1, y2);
  const sign = (ax, ay, bx, by, px, py) => (bx - ax) * (py - ay) - (by - ay) * (px - ax);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const d1 = sign(x0, y0, x1, y1, x, y);
      const d2 = sign(x1, y1, x2, y2, x, y);
      const d3 = sign(x2, y2, x0, y0, x, y);
      const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
      const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
      if (!(hasNeg && hasPos)) setPixel(c, x, y, color);
    }
  }
}

// ---------- 카테고리별 배경색 + 아이콘 ----------

const WHITE = [255, 255, 255];

const CATEGORY_STYLES = {
  디지털기기: { bg: [90, 110, 150], draw: drawDevice },
  생활가전: { bg: [110, 165, 195], draw: drawAppliance },
  "가구/인테리어": { bg: [150, 110, 80], draw: drawSofa },
  "옷/패션잡화": { bg: [205, 130, 160], draw: drawShirt },
  "뷰티/미용": { bg: [190, 150, 200], draw: drawLipstick },
  "스포츠/레저": { bg: [110, 170, 120], draw: drawBall },
  "도서/음반/티켓": { bg: [80, 100, 140], draw: drawBook },
  반려동물: { bg: [220, 175, 90], draw: drawPaw },
  식물: { bg: [70, 130, 90], draw: drawPlant },
  기타: { bg: [140, 140, 145], draw: drawGift },
};

function drawDevice(c) {
  // 태블릿: 몸체 + 카메라 노치
  fillRect(c, 78, 40, 84, 160, WHITE);
  fillCircle(c, 120, 58, 5, c.bg);
}

function drawAppliance(c) {
  // 세탁기: 몸체 + 원형 문 + 상단 노브
  fillRect(c, 60, 40, 120, 160, WHITE);
  fillCircle(c, 120, 135, 42, c.bg);
  fillCircle(c, 120, 135, 34, WHITE);
  fillCircle(c, 78, 58, 6, c.bg);
  fillCircle(c, 98, 58, 6, c.bg);
}

function drawSofa(c) {
  // 소파: 등받이 + 좌석 + 다리
  fillRect(c, 55, 70, 130, 45, WHITE);
  fillRect(c, 55, 105, 130, 55, WHITE);
  fillRect(c, 62, 160, 12, 18, WHITE);
  fillRect(c, 166, 160, 12, 18, WHITE);
}

function drawShirt(c) {
  // 티셔츠: 몸통 + 소매
  fillRect(c, 85, 75, 70, 100, WHITE);
  fillTriangle(c, 85, 75, 55, 75, 85, 115, WHITE);
  fillTriangle(c, 155, 75, 185, 75, 155, 115, WHITE);
  fillRect(c, 100, 60, 40, 20, WHITE);
}

function drawLipstick(c) {
  // 립스틱: 튜브 + 뾰족한 팁
  fillRect(c, 100, 100, 40, 90, WHITE);
  fillTriangle(c, 100, 100, 140, 100, 120, 55, WHITE);
}

function drawBall(c) {
  // 공: 원 + 가운데 무늬
  fillCircle(c, 120, 120, 62, WHITE);
  fillCircle(c, 120, 120, 10, c.bg);
}

function drawBook(c) {
  // 책: 표지 + 책등 구분선
  fillRect(c, 65, 55, 110, 140, WHITE);
  fillRect(c, 118, 55, 4, 140, c.bg);
}

function drawPaw(c) {
  // 발바닥: 손바닥 + 발가락 4개
  fillCircle(c, 120, 145, 38, WHITE);
  fillCircle(c, 80, 95, 18, WHITE);
  fillCircle(c, 115, 75, 18, WHITE);
  fillCircle(c, 150, 78, 18, WHITE);
  fillCircle(c, 175, 105, 16, WHITE);
}

function drawPlant(c) {
  // 화분: 잎 3장 + 화분
  fillTriangle(c, 120, 55, 90, 120, 150, 120, WHITE);
  fillTriangle(c, 90, 75, 60, 130, 120, 130, WHITE);
  fillTriangle(c, 150, 75, 180, 130, 120, 130, WHITE);
  fillRect(c, 90, 130, 60, 55, WHITE);
}

function drawGift(c) {
  // 선물상자: 박스 + 리본 + 리본 매듭
  fillRect(c, 55, 90, 130, 100, WHITE);
  fillRect(c, 110, 90, 20, 100, c.bg);
  fillRect(c, 55, 125, 130, 20, c.bg);
  fillTriangle(c, 120, 90, 95, 60, 120, 75, WHITE);
  fillTriangle(c, 120, 90, 145, 60, 120, 75, WHITE);
}

function categoryImagePng(category, size = 240) {
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES["기타"];
  const canvas = makeCanvas(size, style.bg);
  style.draw(canvas);
  return encodePng(canvas);
}

// ---------- Supabase 시딩 ----------

async function ensureSeller(supabase, username) {
  const email = `${username}@ggm.local`;
  const signIn = await supabase.auth.signInWithPassword({ email, password: SELLER_PASSWORD });
  if (signIn.data.user) return signIn.data.user;

  const signUp = await supabase.auth.signUp({
    email,
    password: SELLER_PASSWORD,
    options: { data: { username } },
  });
  if (signUp.error) throw signUp.error;
  return signUp.data.user;
}

async function seed() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const usersByName = {};

  for (const username of SELLERS) {
    usersByName[username] = await ensureSeller(supabase, username);
    console.log(`판매자 준비 완료: ${username}`);
  }

  for (const post of POSTS) {
    const user = usersByName[post.seller];
    await supabase.auth.signInWithPassword({
      email: `${post.seller}@ggm.local`,
      password: SELLER_PASSWORD,
    });

    const postId = randomUUID();
    const imagePath = `${user.id}/${postId}/0-${randomUUID()}.png`;
    const png = categoryImagePng(post.category);

    const upload = await supabase.storage.from("post-images").upload(imagePath, png, {
      contentType: "image/png",
    });
    if (upload.error) throw upload.error;

    const insert = await supabase.from("ggm_posts").insert({
      id: postId,
      user_id: user.id,
      title: post.title,
      description: post.description,
      category: post.category,
      price: post.isFree ? 0 : post.price,
      is_free: Boolean(post.isFree),
      status: post.status,
      images: [imagePath],
    });
    if (insert.error) throw insert.error;

    console.log(`글 등록 완료: [${post.seller}] ${post.title}`);
  }

  console.log("\n샘플 데이터 생성이 끝났어요. /posts 에서 확인해보세요.");
}

async function clean() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  for (const username of SELLERS) {
    const email = `${username}@ggm.local`;
    const signIn = await supabase.auth.signInWithPassword({ email, password: SELLER_PASSWORD });
    if (!signIn.data.user) continue;

    const { data: posts } = await supabase.from("ggm_posts").select("id, images").eq("user_id", signIn.data.user.id);
    for (const post of posts ?? []) {
      await supabase.from("ggm_posts").delete().eq("id", post.id);
      if (post.images?.length) {
        await supabase.storage.from("post-images").remove(post.images);
      }
    }
    console.log(`${username}의 샘플 글 정리 완료 (${posts?.length ?? 0}개)`);
  }

  console.log(
    "\n계정 자체(auth.users)는 anon 키로 삭제할 수 없어요. 필요하면 Supabase SQL 에디터에서 다음을 실행하세요:\n" +
      "delete from auth.users where email like '%_seed@ggm.local';",
  );
}

const mode = process.argv.includes("--clean") ? clean : seed;
mode().catch((err) => {
  console.error("실패:", err.message ?? err);
  process.exit(1);
});
