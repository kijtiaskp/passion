export type BudgetType = 'need' | 'want'

export interface Subcategory {
  key: string
  label: string
  keywords: string[]
}

export interface Category {
  key: string
  label: string
  budgetType: BudgetType
  subcategories: Subcategory[]
}

export const CATEGORIES: Category[] = [
  {
    key: 'food-and-drink',
    label: 'อาหารและเครื่องดื่ม',
    budgetType: 'need',
    subcategories: [
      { key: 'rice-dish', label: 'ข้าวราดแกง/จานเดียว', keywords: ['ข้าว', 'กะเพรา', 'ขาหมู', 'ผัดซีอิ๊ว', 'ข้าวมันไก่', 'ข้าวหมูแดง', 'ข้าวหมูกรอบ', 'ข้าวไก่', 'ข้าวปลา', 'ข้าวผัด', 'แซ่บ', 'ราดแกง'] },
      { key: 'noodle', label: 'ก๋วยเตี๋ยว/บะหมี่', keywords: ['ก๋วยเตี๋ยว', 'บะหมี่', 'เกี๊ยว', 'เย็นตาโฟ', 'ผัดไทย', 'ราดหน้า', 'มาม่า', 'นู้ดเดิ้ล'] },
      { key: 'seafood', label: 'อาหารทะเล', keywords: ['กุ้ง', 'ปลา', 'ปู', 'หอย', 'ทะเล', 'ซีฟู้ด', 'น้ำปลา'] },
      { key: 'ready-meal', label: 'อาหารสำเร็จรูป/กระป๋อง', keywords: ['กระป๋อง', 'สำเร็จรูป', 'แช่แข็ง', 'ไมโครเวฟ', 'ผัดฉ่า', 'ผัดกระเพรา'] },
      { key: 'snack', label: 'ขนม/ของกินเล่น', keywords: ['สโมกกี้', 'โรลเลอร์', 'เลย์', 'ทาโร่', 'ป๊อปคอร์น', 'มันฝรั่ง', 'ขนม', 'ไบท์', 'ปีโป้', 'โปเตโต้'] },
      { key: 'beverage', label: 'เครื่องดื่ม', keywords: ['น้ำดื่ม', 'โออิชิ', 'เอ็ม-150', 'กระทิงแดง', 'คาราบาว', 'โค้ก', 'เป๊ปซี่', 'สไปรท์', 'น้ำอัดลม', 'ชาคูลส์', 'เชเว่น', 'ซีเล็ค', 'ดัชมิลล์', 'วิตามิลค์', 'นม', 'M-150', 'M150'] },
      { key: 'coffee-tea', label: 'กาแฟ/ชา', keywords: ['กาแฟ', 'ลาเต้', 'อเมริกาโน่', 'คาปูชิโน่', 'ชานม', 'ชาเขียว', 'อเมซอน', 'สตาร์บัคส์', 'คาเฟ่', 'cafe', 'coffee', 'starbucks'] },
      { key: 'restaurant', label: 'ร้านอาหาร/ทานนอก', keywords: ['หมูกระทะ', 'ชาบู', 'บุฟเฟ่ต์', 'ร้านอาหาร', 'suki', 'yakiniku', 'bbq'] },
      { key: 'delivery', label: 'สั่งอาหารออนไลน์', keywords: ['grab food', 'line man', 'robinhood', 'foodpanda', 'ค่าส่ง'] },
      { key: 'bakery', label: 'เบเกอรี่', keywords: ['แซนด์วิช', 'โดนัท', 'ครัวซองต์', 'ขนมปัง', 'เค้ก', 'เบเกอรี่'] },
      { key: 'alcohol', label: 'แอลกอฮอล์', keywords: ['เบียร์', 'เหล้า', 'ไวน์', 'สิงห์', 'ช้าง', 'ลีโอ', 'ไฮเนเก้น', 'beer', 'wine'] },
    ],
  },
  {
    key: 'grocery',
    label: 'ของใช้/วัตถุดิบ',
    budgetType: 'need',
    subcategories: [
      { key: 'fresh-food', label: 'วัตถุดิบสด', keywords: ['ผัก', 'เนื้อ', 'หมู', 'ไก่', 'ไข่', 'ผลไม้', 'ตลาด'] },
      { key: 'dry-goods', label: 'ของแห้ง/เครื่องปรุง', keywords: ['น้ำปลา', 'น้ำมัน', 'ข้าวสาร', 'ซอส', 'เครื่องปรุง', 'น้ำตาล', 'เกลือ'] },
      { key: 'household', label: 'ของใช้ในบ้าน', keywords: ['น้ำยาล้าง', 'ทิชชู่', 'ถุงขยะ', 'กระดาษ', 'ผงซักฟอก', 'ไม้กวาด'] },
      { key: 'personal-care', label: 'ของใช้ส่วนตัว', keywords: ['สบู่', 'ยาสีฟัน', 'แชมพู', 'ครีม', 'โฟมล้างหน้า', 'สกินแคร์'] },
    ],
  },
  {
    key: 'transport',
    label: 'การเดินทาง',
    budgetType: 'need',
    subcategories: [
      { key: 'fuel', label: 'น้ำมัน/พลังงาน', keywords: ['น้ำมัน', 'เติมน้ำมัน', 'ปั๊ม', 'ptt', 'shell', 'bangchak', 'ev', 'ชาร์จ'] },
      { key: 'public-transit', label: 'ขนส่งสาธารณะ', keywords: ['bts', 'mrt', 'รถเมล์', 'เรือ', 'รถไฟ', 'แท็กซี่'] },
      { key: 'ride-hailing', label: 'เรียกรถ', keywords: ['grab', 'bolt', 'indrive'] },
      { key: 'parking-toll', label: 'ที่จอดรถ/ทางด่วน', keywords: ['จอดรถ', 'ทางด่วน', 'มอเตอร์เวย์', 'ที่จอด'] },
      { key: 'maintenance', label: 'ซ่อมบำรุงรถ', keywords: ['เปลี่ยนยาง', 'ล้างรถ', 'เปลี่ยนถ่าย', 'ซ่อมรถ', 'พ.ร.บ.'] },
    ],
  },
  {
    key: 'housing',
    label: 'ที่อยู่อาศัย',
    budgetType: 'need',
    subcategories: [
      { key: 'rent', label: 'ค่าเช่า', keywords: ['ค่าเช่า', 'ค่าห้อง'] },
      { key: 'mortgage', label: 'ผ่อนบ้าน', keywords: ['ผ่อนบ้าน', 'ผ่อนคอนโด'] },
      { key: 'repair', label: 'ซ่อมแซม', keywords: ['ช่างประปา', 'ช่างไฟ', 'ซ่อมแซม', 'ทาสี'] },
      { key: 'furniture', label: 'เฟอร์นิเจอร์', keywords: ['โต๊ะ', 'เก้าอี้', 'หมอน', 'ผ้าม่าน', 'ikea', 'เฟอร์นิเจอร์'] },
    ],
  },
  {
    key: 'utility',
    label: 'สาธารณูปโภค',
    budgetType: 'need',
    subcategories: [
      { key: 'electric', label: 'ค่าไฟ', keywords: ['ค่าไฟ', 'การไฟฟ้า', 'mea', 'pea'] },
      { key: 'water-bill', label: 'ค่าน้ำ', keywords: ['ค่าน้ำ', 'ประปา'] },
      { key: 'internet-phone', label: 'อินเทอร์เน็ต/โทรศัพท์', keywords: ['อินเทอร์เน็ต', 'เน็ต', 'ais', 'true', 'dtac', '3bb', 'ค่าเน็ต', 'ค่ามือถือ'] },
      { key: 'insurance', label: 'ประกัน', keywords: ['ประกัน', 'เบี้ยประกัน', 'aia', 'เมืองไทยประกัน'] },
    ],
  },
  {
    key: 'subscription',
    label: 'สมาชิก/บริการรายเดือน',
    budgetType: 'want',
    subcategories: [
      { key: 'streaming', label: 'สตรีมมิ่ง', keywords: ['spotify', 'netflix', 'youtube premium', 'disney', 'hbo', 'viu'] },
      { key: 'cloud-storage', label: 'คลาวด์', keywords: ['google one', 'icloud', 'dropbox', 'onedrive'] },
      { key: 'software', label: 'ซอฟต์แวร์/AI', keywords: ['claude', 'chatgpt', 'copilot', 'wemod', 'adobe', 'figma', 'notion'] },
      { key: 'shared', label: 'เก็บค่าสมาชิกร่วม', keywords: [] },
      { key: 'membership', label: 'สมาชิกอื่นๆ', keywords: ['youtube member', 'amazon prime', 'line premium', 'canva'] },
    ],
  },
  {
    key: 'health',
    label: 'สุขภาพ',
    budgetType: 'need',
    subcategories: [
      { key: 'medical', label: 'รักษาพยาบาล', keywords: ['ค่าหมอ', 'โรงพยาบาล', 'คลินิก', 'ทำฟัน', 'ค่ายา'] },
      { key: 'pharmacy', label: 'ยา/อาหารเสริม', keywords: ['ค่ายา', 'ยาแก้', 'ยาพารา', 'วิตามิน', 'พาราเซตามอล', 'อาหารเสริม', 'เภสัช', 'ร้านยา'] },
      { key: 'fitness', label: 'ออกกำลังกาย', keywords: ['ฟิตเนส', 'ยิม', 'กีฬา', 'gym', 'fitness'] },
      { key: 'wellness', label: 'สุขภาพทั่วไป', keywords: ['นวด', 'สปา', 'ตรวจสุขภาพ'] },
    ],
  },
  {
    key: 'entertainment',
    label: 'ความบันเทิง',
    budgetType: 'want',
    subcategories: [
      { key: 'movie-event', label: 'หนัง/อีเวนต์', keywords: ['ตั๋วหนัง', 'คอนเสิร์ต', 'major', 'sf cinema', 'เทศกาล'] },
      { key: 'game', label: 'เกม', keywords: ['steam', 'ps store', 'nintendo', 'เติมเกม', 'game'] },
      { key: 'hobby', label: 'งานอดิเรก', keywords: ['กล้อง', 'โมเดล', 'gunpla', 'lego'] },
      { key: 'travel', label: 'ท่องเที่ยว', keywords: ['โรงแรม', 'ตั๋วเครื่องบิน', 'agoda', 'booking', 'airbnb'] },
    ],
  },
  {
    key: 'shopping',
    label: 'ช้อปปิ้ง',
    budgetType: 'want',
    subcategories: [
      { key: 'clothing', label: 'เสื้อผ้า/รองเท้า', keywords: ['เสื้อ', 'กางเกง', 'รองเท้า', 'uniqlo', 'nike', 'adidas'] },
      { key: 'electronics', label: 'อิเล็กทรอนิกส์', keywords: ['สายชาร์จ', 'หูฟัง', 'เคส', 'แบตสำรอง', 'usb'] },
      { key: 'online-shopping', label: 'ช้อปออนไลน์', keywords: ['shopee', 'lazada', 'amazon', 'aliexpress'] },
      { key: 'gift', label: 'ของขวัญ', keywords: ['ของขวัญ', 'ของฝาก', 'วันเกิด'] },
    ],
  },
  {
    key: 'social',
    label: 'สังคม',
    budgetType: 'want',
    subcategories: [
      { key: 'dining-out', label: 'กินเลี้ยง/สังสรรค์', keywords: ['ปาร์ตี้', 'เลี้ยง', 'สังสรรค์', 'ktv'] },
      { key: 'donation', label: 'บริจาค/ทำบุญ', keywords: ['ตักบาตร', 'กฐิน', 'บริจาค', 'ทำบุญ'] },
      { key: 'family', label: 'ให้ครอบครัว', keywords: ['ให้แม่', 'ให้พ่อ', 'ค่าเทอม', 'ครอบครัว'] },
    ],
  },
  {
    key: 'education',
    label: 'การศึกษา',
    budgetType: 'want',
    subcategories: [
      { key: 'course', label: 'คอร์สเรียน', keywords: ['udemy', 'coursera', 'bootcamp', 'คอร์ส'] },
      { key: 'book', label: 'หนังสือ/ตำรา', keywords: ['หนังสือ', 'kindle', 'se-ed', 'ebook'] },
      { key: 'tool', label: 'เครื่องมือทำงาน', keywords: ['โดเมน', 'hosting', 'domain', 'server'] },
    ],
  },
  {
    key: 'miscellaneous',
    label: 'อื่นๆ',
    budgetType: 'want',
    subcategories: [
      { key: 'discount', label: 'ส่วนลด', keywords: ['ส่วนลด', 'ลด', 'คูปอง', 'โปรโมชั่น', 'amb'] },
      { key: 'fee', label: 'ค่าธรรมเนียม', keywords: ['ค่าโอน', 'atm', 'ค่าปรับ', 'ค่าบริการ'] },
      { key: 'pet', label: 'สัตว์เลี้ยง', keywords: ['อาหารแมว', 'อาหารสุนัข', 'หมอสัตว์', 'ทรายแมว'] },
      { key: 'uncategorized', label: 'ไม่จัดหมวด', keywords: [] },
    ],
  },
]

/** Lookup map: subcategory key → category key */
const SUB_TO_CAT: Record<string, string> = {}
for (const cat of CATEGORIES) {
  for (const sub of cat.subcategories) {
    SUB_TO_CAT[sub.key] = cat.key
  }
}

export function getCategoryForSub(subcategory: string): string {
  return SUB_TO_CAT[subcategory] || ''
}

export function getCategory(key: string): Category | undefined {
  return CATEGORIES.find(c => c.key === key)
}

export function getSubcategory(catKey: string, subKey: string): Subcategory | undefined {
  return CATEGORIES.find(c => c.key === catKey)?.subcategories.find(s => s.key === subKey)
}

/** Auto-suggest subcategory from item name (returns { category, subcategory } or null) */
export function suggestCategory(name: string): { category: string; subcategory: string } | null {
  const lower = name.toLowerCase()
  let bestMatch: { category: string; subcategory: string; matchLen: number } | null = null

  for (const cat of CATEGORIES) {
    for (const sub of cat.subcategories) {
      for (const kw of sub.keywords) {
        if (lower.includes(kw.toLowerCase())) {
          if (!bestMatch || kw.length > bestMatch.matchLen) {
            bestMatch = { category: cat.key, subcategory: sub.key, matchLen: kw.length }
          }
        }
      }
    }
  }

  return bestMatch ? { category: bestMatch.category, subcategory: bestMatch.subcategory } : null
}

/** All category labels for display */
export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.key, c.label])
)

/** All subcategory labels for display */
export const SUBCATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.flatMap(c => c.subcategories.map(s => [s.key, s.label]))
)
