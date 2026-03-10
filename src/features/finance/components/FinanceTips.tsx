import { useState } from 'react'

interface TipArticle {
  title: string
  content: string
  source?: string
  sourceUrl?: string
  tags: string[]
  image?: string
}

const TIPS: TipArticle[] = [
  // === สถานการณ์โลก มี.ค. 2569 ===
  {
    title: 'Trade War 2026 - ภาษีนำเข้า Trump ป่วนเศรษฐกิจโลก',
    content:
      'ศาลสูงสหรัฐตัดสิน 6-3 ว่า IEEPA ไม่ให้อำนาจประธานาธิบดีเก็บภาษีนำเข้า ' +
      'Trump ตอบโต้ด้วยการประกาศภาษีนำเข้า 10% ทั่วโลกตาม Section 122\n\n' +
      'ผลกระทบ:\n' +
      '- ภาษี 20% ทั่วโลก + 50% จีน (รวม 60%) จะลด GDP สหรัฐ 1.3%\n' +
      '- ครัวเรือนอเมริกันจ่ายภาษีเพิ่ม ~$700/ปี\n' +
      '- เงินเฟ้อพุ่ง กำลังซื้อลด กำไรบริษัทหด\n' +
      '- GDP โลกยังโต 3.3% แต่มีความเสี่ยงขาลง\n\n' +
      'สำหรับไทย: ส่งออกกระทบหนัก เพราะพึ่งพาตลาดสหรัฐสูง ' +
      'สินค้าอิเล็กทรอนิกส์ อาหาร และยานยนต์อาจโดนภาษีเพิ่ม',
    source: 'Tax Foundation',
    sourceUrl: 'https://taxfoundation.org/research/all/federal/trump-tariffs-trade-war/',
    tags: ['สถานการณ์โลก', 'Trade War'],
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop',
  },
  {
    title: 'SET Index ดิ่ง! Circuit Breaker ครั้งแรกรอบหลายปี',
    content:
      'วันที่ 4 มี.ค. 2569 SET50 ร่วง 8% แตะ ~900 จุด ถูกพักการซื้อขาย 30 นาที\n' +
      'SET Index ปิดลบ 5.6% วันเดียว มากสุดตั้งแต่ มี.ค. 2563 (COVID)\n\n' +
      'สาเหตุ: ความขัดแย้งตะวันออกกลางลุกลาม + Risk-off ทั่วเอเชีย\n' +
      'ล่าสุด (10 มี.ค.): SET กลับมาที่ 1,405.76 จุด (+1.65%) มูลค่าซื้อขาย 68.21 พันล้านบาท\n\n' +
      'ภาพรวม: ย้อนหลัง 1 ปี SET ยังบวก 23.25% แต่เดือนนี้ลบ 3.36%\n' +
      'โอกาส: ตลาดตกหนัก = โอกาสซื้อสำหรับนักลงทุนระยะยาว',
    source: 'Bloomberg',
    sourceUrl: 'https://www.bloomberg.com/news/articles/2026-03-04/thailand-s-stock-index-drops-8-to-trigger-trading-halt-mmbljzy2',
    tags: ['สถานการณ์โลก', 'หุ้นไทย'],
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=200&fit=crop',
  },
  {
    title: 'ทองคำทำนิวไฮ 2026 - แตะ $5,180/ออนซ์',
    content:
      'ราคาทองคำพุ่งขึ้นต่อเนื่อง:\n' +
      '- ม.ค. 2026: เฉลี่ย $4,733/ออนซ์ (+8.65% จากปลายปี 2025)\n' +
      '- มี.ค. 2026: ทดสอบ $5,050 ก่อนดีดกลับ $5,180/ออนซ์\n' +
      '- ปี 2025 ทอง new high กว่า 50 ครั้ง ผลตอบแทน 60%+\n\n' +
      'คาดการณ์:\n' +
      '- Morgan Stanley: เฉลี่ย $4,600/ออนซ์\n' +
      '- Bank of America: อาจแตะ $5,000+ หาก Fed ลดดอกเบี้ย\n\n' +
      'ปัจจัยหนุน: ภูมิรัฐศาสตร์ไม่แน่นอน + ธนาคารกลางทั่วโลกซื้อทอง + ดอลลาร์อ่อน\n' +
      'สำหรับคนไทย: ทองคำแท่ง/กองทุนทองเป็น safe haven ที่ดี',
    source: 'SET Investnow',
    sourceUrl: 'https://www.setinvestnow.com/th/knowledge/article/769-investhow-investment-outlook-ylg-2026',
    tags: ['สถานการณ์โลก', 'ทองคำ'],
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=200&fit=crop',
  },
  {
    title: 'Bitcoin ผันผวน $60K-$73K - ยังไม่ถึง Moon?',
    content:
      'ราคา Bitcoin มี.ค. 2026:\n' +
      '- 4 มี.ค.: พุ่งแตะ $73,000 (สูงสุดในรอบเดือน) จาก ETF inflows\n' +
      '- 10 มี.ค.: อยู่ที่ $70,828 (+$1,437 จากเมื่อวาน)\n' +
      '- กรอบสะสม: $60,000-$72,000 (high-density zone)\n' +
      '- Market Cap: ~$1.33 ล้านล้านดอลลาร์\n\n' +
      'เทียบ 1 ปีก่อน: ยังติดลบ ~$7,700\n' +
      'Ethereum: Market Cap ~$233 พันล้านดอลลาร์\n\n' +
      'ข้อควรระวัง: คริปโตยังผันผวนสูง ไม่เหมาะเป็นที่พึ่งหลัก\n' +
      'กฎ: ลงทุนเฉพาะเงินที่พร้อมสูญเสีย ไม่เกิน 5-10% ของพอร์ต',
    source: 'Fortune',
    sourceUrl: 'https://fortune.com/article/price-of-bitcoin-03-10-2026/',
    tags: ['สถานการณ์โลก', 'คริปโต'],
    image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=200&fit=crop',
  },
  {
    title: 'เศรษฐกิจไทย 2026 - โตต่ำสุดรอบ 30 ปี',
    content:
      'GDP ไทยคาดโต 1.5-1.8% เท่านั้น (World Bank ล่าสุด 1.8%)\n' +
      'ต่ำสุดรอบ 30 ปี ไม่นับปีวิกฤต\n\n' +
      'ปัจจัยลบ:\n' +
      '- หนี้ครัวเรือนสูงกดการบริโภค\n' +
      '- ภาษีนำเข้าสหรัฐกระทบส่งออก\n' +
      '- การลงทุนเอกชนอ่อนแรง\n' +
      '- ความไม่แน่นอนทางการเมือง\n\n' +
      'นโยบายเงิน:\n' +
      '- ธปท. ลดดอกเบี้ยเหลือ 1.25% (ปลาย 2025)\n' +
      '- คาด ลดต่อเหลือ 1.0% ใน H1/2026\n' +
      '- แต่ลดดอกเบี้ยอย่างเดียวไม่พอ SME/ครัวเรือนยังเข้าถึงสินเชื่อยาก\n\n' +
      'ค่าเงินบาท: อ่อนค่าต่อเนื่อง 31.50-31.85 บาท/ดอลลาร์\n' +
      'คาดปลายปี: 33.00-34.00 บาท/ดอลลาร์',
    source: 'Nation Thailand',
    sourceUrl: 'https://www.nationthailand.com/business/economy/40060602',
    tags: ['สถานการณ์โลก', 'เศรษฐกิจไทย'],
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop',
  },
  {
    title: 'Tech Layoffs 2026 - AI กำลังแทนที่คน',
    content:
      'สถิติ Layoffs 2026 (ณ มี.ค.):\n' +
      '- 45,724 คน ถูกเลิกจ้าง จาก 81 บริษัท\n' +
      '- เฉลี่ย 663 คน/วัน\n' +
      '- กว่า 9,200 คน เกิดจาก AI/Automation โดยตรง\n' +
      '- คาดทั้งปี: 264,730 คน (มากกว่าปี 2025 ที่ 245,000)\n\n' +
      'บริษัทใหญ่ที่ Layoff:\n' +
      '- Amazon: ลด 16,000 ตำแหน่ง (~10% corporate)\n' +
      '- Meta: ลด 1,500 คน (Reality Labs/Metaverse)\n\n' +
      'แนวโน้ม: บริษัทปรับโครงสร้างรอบ AI มากขึ้น\n' +
      'คำแนะนำ: Developer ต้อง upskill AI/ML integration\n' +
      'ทักษะ hot: Prompt Engineering, AI Agent, LLM APIs\n' +
      'ทักษะ safe: System Design, Cloud, DevOps, Security',
    source: 'TechNode Global',
    sourceUrl: 'https://technode.global/2026/03/09/2026-tech-layoffs-reach-45000-in-march-more-than-9200-due-to-ai-and-automation-rationalfx/',
    tags: ['สถานการณ์โลก', 'อาชีพ'],
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=200&fit=crop',
  },
  {
    title: 'วิกฤตหนี้โลก 2026 - G7 เข้าสู่ "กับดักหนี้"',
    content:
      '6 ใน 7 ประเทศ G7 กำลังมุ่งสู่กับดักหนี้:\n' +
      '- สหรัฐ: หนี้สาธารณะ 125% ของ GDP\n' +
      '- ญี่ปุ่น: สูงสุดที่ 230% ของ GDP\n' +
      '- ยุโรป: ECB ส่งสัญญาณลดดอกเบี้ย 25bps\n\n' +
      'ผลกระทบต่อคนธรรมดา:\n' +
      '- ดอกเบี้ยสูงนาน = ภาระหนี้บ้าน/รถ ไม่ลดง่าย\n' +
      '- เงินเฟ้อกัดกร่อนกำลังซื้อ\n' +
      '- เศรษฐกิจ K-shaped: คนรวยรวยต่อ คนจนลำบากขึ้น\n\n' +
      'สำหรับไทย: ต้นทุนกู้ยืมทั่วโลกยังสูง ส่งผลต่อ FDI และค่าเงิน\n' +
      'กฎ: อย่ามีหนี้ที่ดอกเบี้ยลอยตัว ถ้ามี ให้ refinance เป็นดอกเบี้ยคงที่',
    source: 'Bangkok Biz News',
    sourceUrl: 'https://www.bangkokbiznews.com/world/economics/1214562',
    tags: ['สถานการณ์โลก', 'หนี้'],
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&h=200&fit=crop',
  },

  // === แผนลดหนี้ ===
  {
    title: 'Avalanche Method - จ่ายดอกเบี้ยแพงสุดก่อน',
    content:
      'เรียงหนี้จากดอกเบี้ยสูงสุดไปต่ำสุด จ่ายขั้นต่ำทุกใบ แล้วโปะส่วนเกินไปที่ใบดอกเบี้ยแพงสุด ' +
      'พอหมดก็เอาเงินก้อนนั้นไปโปะใบถัดไป ประหยัดดอกเบี้ยรวมได้มากที่สุด ' +
      'เหมาะกับคนมีวินัย ไม่ต้องการ quick win แต่อยากจ่ายน้อยที่สุดในระยะยาว',
    source: 'Krungsri The Coach',
    sourceUrl: 'https://www.krungsri.com/th/krungsri-the-coach/loan/borrowing/pay-off-credit-card-debt',
    tags: ['ลดหนี้', 'บัตรเครดิต'],
  },
  {
    title: 'Snowball Method - จ่ายก้อนเล็กให้หมดก่อน',
    content:
      'เรียงหนี้จากยอดน้อยสุดไปมากสุด โปะก้อนเล็กให้หมดก่อน ได้แรงบันดาลใจจากการเห็นหนี้หายทีละก้อน ' +
      'จากนั้นเอาเงินที่เคยจ่ายก้อนเล็กไปรวมโปะก้อนถัดไป เหมือนก้อนหิมะกลิ้งใหญ่ขึ้นเรื่อยๆ ' +
      'เหมาะกับคนที่ต้องการกำลังใจ เห็นผลเร็ว',
    source: 'KTC Article',
    sourceUrl: 'https://www.ktc.co.th/article/knowledge/credit-card/debt-repayment-tips',
    tags: ['ลดหนี้', 'บัตรเครดิต'],
  },
  {
    title: 'หยุดจ่ายขั้นต่ำ! - กับดักดอกเบี้ยทบต้น',
    content:
      'จ่ายขั้นต่ำ 5-10% ต่อเดือน ดอกเบี้ย 16-25% ต่อปี = หนี้ไม่มีวันหมด ' +
      'ถ้ามีหนี้บัตร 50,000 บาท จ่ายขั้นต่ำ 5% ใช้เวลากว่า 7 ปี และจ่ายดอกเบี้ยรวมเกือบเท่าเงินต้น ' +
      'ควรจ่ายอย่างน้อย 2-3 เท่าของขั้นต่ำ หรือมากที่สุดเท่าที่ไหว',
    source: 'TTB Fin Tips',
    sourceUrl: 'https://www.ttbbank.com/th/fin-tips/detail/how-to-pay-off-creditcard-debt',
    tags: ['ลดหนี้', 'บัตรเครดิต'],
  },
  {
    title: 'รวมหนี้บัตรเครดิตเป็นก้อนเดียว (Debt Consolidation)',
    content:
      'ถ้ามีหนี้บัตรหลายใบ ดอกเบี้ยแพง อาจพิจารณาขอสินเชื่อรวมหนี้ (Debt Consolidation) ' +
      'จากธนาคาร ดอกเบี้ยจะถูกลงเหลือ 10-15% แทนที่จะ 20-25% และได้จ่ายเป็นงวดชัดเจน ' +
      'แต่ต้องระวัง ห้ามกลับไปรูดบัตรเพิ่มอีก ไม่งั้นหนี้จะเพิ่มเป็นสองเท่า',
    source: 'กรุงศรี เฟิร์สช้อยส์',
    sourceUrl: 'https://www.firstchoice.co.th/lifestyle/debt-consolidation',
    tags: ['ลดหนี้', 'บัตรเครดิต'],
  },
  {
    title: 'คลินิกแก้หนี้ ธปท. - ทางเลือกสุดท้ายที่ดีกว่าหนีหนี้',
    content:
      'สำหรับคนที่หนี้เกิน 120 วัน ไม่เกิน 2 ล้านบาท สมัครได้ที่ debtclinicbysam.com ' +
      'ได้รีสตรัคเจอร์หนี้ ผ่อนนานถึง 10 ปี ดอกเบี้ย 3-5% ต่อปี ' +
      'ถ้าจ่ายครบ ยกดอกเบี้ยค้างจ่ายและค่าปรับทั้งหมด ' +
      'โครงการ "คุณสู้ เราช่วย" ครอบคลุม 2.1 ล้านบัญชี หนี้รวม 8.9 แสนล้านบาท',
    source: 'คลินิกแก้หนี้ by SAM',
    sourceUrl: 'https://www.debtclinicbysam.com/',
    tags: ['ลดหนี้', 'ธปท.'],
  },

  // === แผนการเงิน 38,500 ===
  {
    title: 'สูตร 50/30/20 สำหรับเงินเดือน 38,500 บาท',
    content:
      '50% = 19,250 บาท (ค่าใช้จ่ายจำเป็น: ค่าบ้าน อาหาร เดินทาง สาธารณูปโภค)\n' +
      '30% = 11,550 บาท (ไลฟ์สไตล์: ของใช้ ท่องเที่ยว บันเทิง)\n' +
      '20% = 7,700 บาท (ออม + ลงทุน + โปะหนี้)\n\n' +
      'ถ้ามีหนี้ ให้ปรับเป็น 50/20/30 โดยเอา 30% ไปจ่ายหนี้ = 11,550 บาท/เดือน ' +
      'จะปิดหนี้ 50,000 ได้ใน ~5 เดือน (รวมดอกเบี้ย)',
    source: 'Finnomena',
    sourceUrl: 'https://www.finnomena.com/finspace/salary-50-30-20/',
    tags: ['แผนการเงิน', 'งบประมาณ'],
  },
  {
    title: 'Zero-Based Budgeting - ทุกบาทต้องมีที่ไป',
    content:
      'จัดสรรเงินทุกบาททุกสตางค์ให้มีหน้าที่ ไม่เหลือ "เงินเฉยๆ" ในบัญชี\n' +
      'เงินเดือน 38,500 :\n' +
      '- ค่าบ้าน/ผ่อน: 10,000-12,000\n' +
      '- อาหาร: 5,000-6,000\n' +
      '- เดินทาง: 2,000-3,000\n' +
      '- สาธารณูปโภค: 2,000\n' +
      '- โปะหนี้: 8,000-10,000\n' +
      '- ออม/ฉุกเฉิน: 3,000-5,000\n' +
      '- อื่นๆ: ที่เหลือ\n\n' +
      'ข้อดี: เห็นภาพชัดว่าเงินหายไปไหน ลดรายจ่ายรั่วไหลได้ดี',
    source: 'SET Investnow',
    sourceUrl: 'https://www.setinvestnow.com/th/knowledge/article/626-tsi-wealth-planning-tips-2025',
    tags: ['แผนการเงิน', 'งบประมาณ'],
  },

  // === ข่าว Developer / รายได้ ===
  {
    title: 'เงินเดือน Developer ไทย 2026 - ควรอยู่ตรงไหน?',
    content:
      'ข้อมูลจาก Jobsdb & Glassdoor (มี.ค. 2026):\n' +
      '- Web Developer: 24,000-32,000 บาท\n' +
      '- Programmer: 28,000-38,000 บาท\n' +
      '- Frontend Developer: 32,000-62,000 บาท\n' +
      '- .NET Developer: 39,000-63,000 บาท\n' +
      '- Senior Software Developer: ~92,000 บาท (กทม.)\n\n' +
      'ที่ 38,500 อยู่ช่วงกลางของ Programmer เข้าใกล้ Frontend ล่าง ' +
      'ถ้า upskill React/TypeScript ให้แน่น มีโอกาสขยับเป็น 45,000-60,000+ ได้ภายใน 1-2 ปี',
    source: 'Jobsdb Thailand',
    sourceUrl: 'https://th.jobsdb.com/career-advice/role/developer/salary',
    tags: ['อาชีพ', 'เงินเดือน'],
  },
  {
    title: 'ปี 2026 คนไทยได้ขึ้นเงินเดือนเฉลี่ย 5.2%',
    content:
      'จากสำรวจพบ 20 จาก 23 ตำแหน่ง IT ได้ปรับขึ้น 5-29% ' +
      'สายงานที่ค่าจ้างพุ่งแรงสุด: AI/ML, Cloud, Cybersecurity ' +
      'สาย Developer ปรับขึ้น ~5-10% ถ้าเปลี่ยนงานอาจได้ 15-30% ขึ้น\n\n' +
      'ข้อแนะนำ: อัปเดท resume ทุก 6 เดือน แม้ไม่ได้หางาน ' +
      'ดู salary benchmark เทียบกับตลาดเพื่อเจรจาเงินเดือนได้อย่างมั่นใจ',
    source: 'Bangkok Biz News',
    sourceUrl: 'https://www.bangkokbiznews.com/lifestyle/1215223',
    tags: ['อาชีพ', 'เงินเดือน'],
  },
  {
    title: 'Full Stack Developer 2026 - ทักษะที่ต้องมี',
    content:
      'Core: JavaScript/TypeScript, React, Node.js, SQL, Git\n' +
      'Trending: Cloud (AWS/GCP), Docker, Kubernetes, CI/CD\n' +
      'Hot: AI/ML integration, LLM APIs, Prompt Engineering\n\n' +
      'Full Stack ที่มี Cloud + AI skills เงินเดือนเริ่มต้น 50,000-80,000 บาท ' +
      'Remote ต่างประเทศ: $3,000-5,000/เดือน (~100,000-175,000 บาท)',
    source: 'BorntoDev',
    sourceUrl: 'https://www.borntodev.com/2026/03/02/full-stack-developer-2026/',
    tags: ['อาชีพ', 'ทักษะ'],
  },
  {
    title: 'Freelance Developer ไทย - รายได้เสริม 2-4 เท่า',
    content:
      'ตลาด Freelance IT ไทยโต 94% ในช่วง 2020-2025 รายได้เฉลี่ยเพิ่ม 58%\n' +
      'Hourly Rate:\n' +
      '- Junior: 500-800 บาท/ชม.\n' +
      '- Mid: 800-1,500 บาท/ชม.\n' +
      '- Senior: 1,500-2,500+ บาท/ชม.\n\n' +
      'แพลตฟอร์ม: Arc.dev, Toptal, Upwork, Fiverr\n' +
      'ทำ 10-15 ชม./สัปดาห์ นอกเวลางาน = รายได้เสริม 8,000-22,500 บาท/เดือน ' +
      'ถ้าเอาไปโปะหนี้จะปิดหนี้ได้เร็วขึ้น 2-3 เท่า',
    source: 'Arc.dev',
    sourceUrl: 'https://arc.dev/salaries/software-engineers-in-thailand',
    tags: ['อาชีพ', 'รายได้เสริม'],
  },
  {
    title: 'Remote Work ต่างประเทศ - ทางลัดปลดหนี้',
    content:
      'Developer ไทยทำ Remote ให้บริษัท US/EU/AU เงินเดือนเฉลี่ย $70,691/ปี (~200,000 บาท/เดือน)\n' +
      'แม้เป็น part-time contract ก็ได้ $20-40/ชม. (~700-1,400 บาท)\n\n' +
      'ข้อดี: ไม่ต้องย้ายถิ่น cost of living ต่ำ เก็บเงินได้เยอะ\n' +
      'ข้อเสีย: timezone ต่างกัน อาจต้องทำงานดึก ต้องสื่อสารภาษาอังกฤษได้ดี\n\n' +
      'แพลตฟอร์ม: Arc.dev, Turing, Andela, LinkedIn Remote',
    source: 'Second Talent',
    sourceUrl: 'https://www.secondtalent.com/developer-rate-card/thailand/',
    tags: ['อาชีพ', 'Remote'],
  },

  // === เทคนิคเพิ่มเติม ===
  {
    title: '10 เทคนิคโปะหนี้ให้หมดไว',
    content:
      '1. จ่ายมากกว่าขั้นต่ำเสมอ\n' +
      '2. โปะหนี้ดอกแพงก่อน (Avalanche)\n' +
      '3. ตัดรายจ่ายที่ไม่จำเป็น subscription ที่ไม่ใช้\n' +
      '4. ขายของที่ไม่ใช้ เอาเงินไปโปะ\n' +
      '5. หารายได้เสริม (freelance, สอน, ขายของ)\n' +
      '6. เจรจาลดดอกเบี้ยกับธนาคาร\n' +
      '7. ใช้โบนัส/เงินพิเศษ โปะหนี้ทั้งหมด\n' +
      '8. ตั้งจ่ายอัตโนมัติ ป้องกันลืม/จ่ายช้า\n' +
      '9. หยุดใช้บัตรเครดิต ใช้เดบิตหรือเงินสดแทน\n' +
      '10. ติดตามความก้าวหน้าทุกสัปดาห์ (ใช้แอปนี้!)',
    source: 'Thaicredit Nano',
    sourceUrl: 'https://microfinance.thaicreditbank.com/article/10Tips-Debt-quickly',
    tags: ['ลดหนี้', 'เทคนิค'],
  },
  {
    title: 'กฎ 72 - คำนวณเวลาหนี้เพิ่มเท่าตัว',
    content:
      'กฎ 72: เอา 72 หารด้วยอัตราดอกเบี้ย = จำนวนปีที่หนี้เพิ่มเป็นสองเท่า\n' +
      'บัตรเครดิต 20% : 72/20 = 3.6 ปี หนี้เพิ่มเท่าตัว!\n' +
      'สินเชื่อส่วนบุคคล 15% : 72/15 = 4.8 ปี\n' +
      'เงินฝากออมทรัพย์ 0.5% : 72/0.5 = 144 ปี เงินถึงจะเพิ่มเท่าตัว\n\n' +
      'สรุป: ดอกเบี้ยหนี้โตเร็วกว่าดอกเบี้ยออมหลายสิบเท่า ต้องปิดหนี้ก่อนออม',
    tags: ['ลดหนี้', 'ความรู้'],
  },
  {
    title: 'Salary Guide 2026 - อ่านก่อนเจรจาเงินเดือน',
    content:
      'แหล่งข้อมูลเงินเดือน IT ที่น่าเชื่อถือ:\n' +
      '- Adecco Thailand Salary Guide 2026\n' +
      '- Robert Walters Salary Survey 2026\n' +
      '- Manpower Thailand Salary Guide 2026\n' +
      '- Jobsdb Salary Report\n\n' +
      'เทคนิคเจรจา: เสนอ range ไม่ใช่ตัวเลขเดียว เช่น 42,000-48,000 ' +
      'อ้างอิง market rate จาก salary guide ธนาคารมักจ่ายดี IT consulting ก็เงินเยอะ',
    source: 'Adecco Thailand',
    sourceUrl: 'https://www.adecco.com/th-th/insights/download-adecco-thailand-salary-guide-2026',
    tags: ['อาชีพ', 'เงินเดือน'],
  },
  {
    title: 'ลำดับความสำคัญทางการเงิน (Priority Pyramid)',
    content:
      'ลำดับที่ต้องทำก่อน-หลัง:\n' +
      '1. เงินฉุกเฉิน 3-6 เดือน (ขั้นต่ำ 1 เดือน = 38,500)\n' +
      '2. ปิดหนี้ดอกเบี้ยสูง (บัตรเครดิต > 15%)\n' +
      '3. ประกันสุขภาพ/ชีวิตขั้นพื้นฐาน\n' +
      '4. ปิดหนี้ดอกเบี้ยกลาง (สินเชื่อส่วนบุคคล 8-15%)\n' +
      '5. ออม/ลงทุนระยะยาว (กองทุน SSF/RMF ลดหย่อนภาษี)\n' +
      '6. ลงทุนเพิ่ม (หุ้น กองทุน คริปโต)\n\n' +
      'ห้ามข้ามลำดับ! ปิดหนี้ก่อนลงทุนเสมอ เพราะดอกเบี้ยหนี้ > ผลตอบแทนการลงทุน',
    tags: ['แผนการเงิน', 'ลำดับ'],
  },
]

const ALL_TAGS = [...new Set(TIPS.flatMap(t => t.tags))]
const tipIndexMap = new Map(TIPS.map((t, i) => [t, i]))

export function FinanceTips() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  const filtered = selectedTag ? TIPS.filter(t => t.tags.includes(selectedTag)) : TIPS

  return (
    <div className="fn-section fn-tips-section">
      <div className="fn-section-header">
        <h3>Financial Tips & World Update</h3>
        <span className="fn-section-total">{filtered.length} บทความ</span>
      </div>

      <div className="fn-tips-date">
        อัปเดต: 11 มี.ค. 2569 | เงินเดือน: 38,500 บาท
      </div>

      <div className="fn-tips-tags">
        <button
          className={`fn-tip-tag ${!selectedTag ? 'active' : ''}`}
          onClick={() => setSelectedTag(null)}
        >
          ทั้งหมด
        </button>
        {ALL_TAGS.map(tag => (
          <button
            key={tag}
            className={`fn-tip-tag ${selectedTag === tag ? 'active' : ''}`}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="fn-tips-list">
        {filtered.map((tip) => {
          const idx = tipIndexMap.get(tip)!
          const isOpen = expandedIdx === idx
          return (
            <div key={idx} className={`fn-tip-card ${isOpen ? 'open' : ''}`}>
              <div className="fn-tip-header" onClick={() => setExpandedIdx(isOpen ? null : idx)}>
                <span className="fn-tip-num">{idx + 1}</span>
                <span className="fn-tip-title">{tip.title}</span>
                <span className="fn-tip-arrow">{isOpen ? '\u25B2' : '\u25BC'}</span>
              </div>
              {isOpen && (
                <div className="fn-tip-body">
                  {tip.image && (
                    <div className="fn-tip-image">
                      <img src={tip.image} alt={tip.title} loading="lazy" />
                    </div>
                  )}
                  <pre className="fn-tip-content">{tip.content}</pre>
                  {tip.source && (
                    <div className="fn-tip-source">
                      {tip.sourceUrl ? (
                        <a href={tip.sourceUrl} target="_blank" rel="noopener noreferrer">
                          {tip.source}
                        </a>
                      ) : (
                        tip.source
                      )}
                    </div>
                  )}
                  <div className="fn-tip-tags-inline">
                    {tip.tags.map(tag => (
                      <span key={tag} className="fn-tip-tag-badge">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
