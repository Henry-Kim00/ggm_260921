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
  { seller: "minji_seed", title: "아이패드 프로 11인치 팝니다", category: "디지털기기", price: 650000, status: "판매중", color: [90, 110, 150], description: "작년에 구매해서 상태 아주 좋아요. 케이스, 펜슬 같이 드려요." },
  { seller: "minji_seed", title: "다이슨 무선 청소기 V8", category: "생활가전", price: 120000, status: "예약중", color: [120, 170, 210], description: "사용감 있지만 흡입력 그대로예요. 필터 새로 교체했습니다." },
  { seller: "minji_seed", title: "안 쓰는 전자레인지 나눔", category: "생활가전", price: 0, isFree: true, status: "거래완료", color: [140, 190, 220], description: "이사 가면서 나눔합니다. 작동 잘 돼요." },
  { seller: "jiho_seed", title: "3인용 패브릭 소파", category: "가구/인테리어", price: 80000, status: "판매중", color: [150, 110, 80], description: "이염 없고 깨끗해요. 직거래만 가능합니다." },
  { seller: "jiho_seed", title: "겨울 패딩 남성 L", category: "옷/패션잡화", price: 35000, status: "판매중", color: [200, 130, 160], description: "두어 번 입고 세탁 후 보관했어요." },
  { seller: "jiho_seed", title: "캠핑 텐트 4인용", category: "스포츠/레저", price: 90000, status: "판매중", color: [110, 170, 120], description: "작년 여름에 두 번 사용했어요. 방수 잘 됩니다." },
  { seller: "seoyeon_seed", title: "샤넬 립스틱 새제품", category: "뷰티/미용", price: 25000, status: "판매중", color: [190, 150, 200], description: "선물 받았는데 색이 안 맞아서 팔아요. 미개봉입니다." },
  { seller: "seoyeon_seed", title: "요가매트 나눔합니다", category: "스포츠/레저", price: 0, isFree: true, status: "판매중", color: [130, 190, 150], description: "몇 번 쓰고 안 써서 나눔해요. 상태 좋아요." },
  { seller: "doyoon_seed", title: "해리포터 전권 세트", category: "도서/음반/티켓", price: 30000, status: "거래완료", color: [80, 100, 140], description: "전권 다 있어요. 밑줄이나 낙서 없습니다." },
  { seller: "doyoon_seed", title: "강아지 하우스 대형", category: "반려동물", price: 40000, status: "판매중", color: [220, 190, 120], description: "중형견까지 사용 가능해요. 세탁 완료했습니다." },
  { seller: "haeun_seed", title: "몬스테라 화분 나눔", category: "식물", price: 0, isFree: true, status: "판매중", color: [70, 130, 90], description: "번식이 잘 돼서 나눔해요. 화분은 별도입니다." },
  { seller: "haeun_seed", title: "닌텐도 스위치 라이트", category: "디지털기기", price: 150000, status: "예약중", color: [100, 120, 160], description: "박스, 충전기 모두 있어요. 게임팩은 별도 판매." },
];

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

// 라이브러리 없이 순수 Node.js(zlib)만 사용해 단색 PNG를 직접 인코딩한다.
function solidColorPng(size, [r, g, b]) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB

  const rowSize = size * 3;
  const raw = Buffer.alloc((rowSize + 1) * size);
  for (let y = 0; y < size; y++) {
    const rowStart = y * (rowSize + 1);
    raw[rowStart] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const px = rowStart + 1 + x * 3;
      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
    }
  }
  const idat = zlib.deflateSync(raw);

  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

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
    const png = solidColorPng(400, post.color);

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
