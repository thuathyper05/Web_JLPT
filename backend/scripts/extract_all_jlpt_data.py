import sys
import os
import json
import math
import openpyxl

sys.stdout.reconfigure(encoding='utf-8')

JLPT_DIR = 'd:/HocTap/JLPT'
BACKEND_DATA_DIR = 'd:/HocTap/Web_JLPT/backend/data'
os.makedirs(BACKEND_DATA_DIR, exist_ok=True)

# ── 1. DEFINE TOPICS & TITLES ──
N5_TITLES = {
    1: "Chào hỏi, giới thiệu bản thân, quốc tịch, nghề nghiệp",
    2: "Đồ vật quanh ta, sở hữu đồ vật",
    3: "Địa điểm, vị trí, giá tiền",
    4: "Thời gian, ngày trong tuần, động từ chỉ hành động thường ngày",
    5: "Phương tiện đi lại, địa điểm đến, đi với ai",
    6: "Ăn uống, hành động tác động lên tân ngữ (Trợ từ を)",
    7: "Công cụ, phương tiện (Trợ từ で), cho và nhận (あげます, もらいます)",
    8: "Tính từ đuôi い và tính từ đuôi な",
    9: "Sở thích, khả năng, lý do (から)",
    10: "Sự tồn tại của người và vật (います, あります)",
    11: "Số đếm, lượng từ, thời gian",
    12: "So sánh hơn, so sánh nhất, thì quá khứ của tính từ/danh từ",
    13: "Mong muốn (欲しい, たい), mục đích hành động (に行きます)",
    14: "Động từ thể て, yêu cầu lịch sự (てください), hành động đang diễn ra",
    15: "Xin phép (てもいいですか), điều cấm chỉ (てはいけません)",
    16: "Nối chuỗi hành động (て, から), miêu tả thuộc tính",
    17: "Động từ thể ない, yêu cầu không làm gì (ないでください)",
    18: "Động từ thể từ điển (辞書形), khả năng, sở thích",
    19: "Động từ thể た, kinh nghiệm (たことがあります), liệt kê hành động (たり...たり)",
    20: "Thể thông thường (Thể ngắn / 普通形)",
    21: "Bày tỏ ý kiến (と思います), trích dẫn gián tiếp (と言いました)",
    22: "Mệnh đề bổ ngữ cho danh từ (Định ngữ)",
    23: "Khi... (とき), điều kiện hiển nhiên (と)",
    24: "Hành động cho và nhận nâng cao (くれます, てあげます, てもらいます)",
    25: "Câu điều kiện たら, giả định tương lai"
}

N4_TITLES = {
    26: "Giải thích lý do (～んです), nhờ vả lịch sự, xin lời khuyên",
    27: "Động từ thể khả năng (可能形), nhìn thấy, nghe thấy, hoàn thành",
    28: "Hành động đồng thời (～ながら), thói quen, liệt kê nguyên nhân (～し)",
    29: "Tự động từ & tha động từ, trạng thái kết quả, hoàn thành/hối tiếc",
    30: "Trạng thái có chủ đích (～てあります), chuẩn bị trước (～ておきます)",
    31: "Động từ thể ý chí (意向形), dự định (～つもり / ～予定)",
    32: "Lời khuyên nên làm gì (～ほうがいい), phỏng đoán (～でしょう / ～かも)",
    33: "Thể mệnh lệnh (命令形) & cấm đoán (禁止形), biển báo, truyền đạt",
    34: "Làm việc theo hướng dẫn (～とおりに), làm sau khi, trạng thái",
    35: "Động từ thể điều kiện (条件形: ～ば), lời khuyên hoàn cảnh (～なら)",
    36: "Cố gắng để (～ように), trở nên có thể, duy trì thói quen",
    37: "Động từ thể bị động (受身形: ～られます), bị làm phiền, phát minh",
    38: "Danh từ hóa động từ (Vる＋のは/のが/のを), sở thích, kỹ năng",
    39: "Nguyên nhân, lý do khách quan (～て / ～で / ～ので)",
    40: "Câu hỏi lồng trong câu (～か / ～かどうか), thử làm việc gì (～てみる)",
    41: "Cho và nhận hành động theo thứ bậc (やる / いただく / くださる)",
    42: "Mục đích hành động (～ために), dùng cho mục đích (～のに)",
    43: "Dự đoán biến đổi sắp xảy ra, vẻ bề ngoài (～そうです), đi rồi về",
    44: "Quá mức (～すぎます), dễ/khó làm (～やすい/～にくい), biến đổi",
    45: "Trong trường hợp (～場合は), mặc dù... thế mà... (～のに)",
    46: "Thời điểm diễn ra (～ところ), vừa mới xong (～ばかり), chắc chắn",
    47: "Nghe nói là (～そうです), hình như là (～ようです)",
    48: "Động từ thể sai khiến (使役形: ～させます), bắt làm, cho phép làm",
    49: "Kính ngữ (敬語 - 尊敬語): Tôn kính ngữ, các động từ tôn kính đặc biệt",
    50: "Khiêm nhường ngữ (謙譲語 - 丁寧語): Khiêm tốn về bản thân, đối tác"
}

N3_TOPICS = {
    1: "Gia đình, Quan hệ con người & Bạn bè (人間関係・家族・友人)",
    2: "Nhà ở, Nơi chốn & Đời sống hàng ngày (暮らし・住まい)",
    3: "Đồ gia dụng, Thiết bị & Nấu nướng (家電・料理・家事)",
    4: "Ăn uống, Thực phẩm & Nhà hàng (食事・外食・食材)",
    5: "Mua sắm, Tiền tệ & Giá cả (買い物・お金・価格)",
    6: "Thời trang, Trang phục & Diện mạo (服装・ファッション・外見)",
    7: "Sức khỏe, Thể chất & Cơ thể người (身体・健康・体調)",
    8: "Y tế, Bệnh tật & Thuốc men (医療・病気・病院)",
    9: "Giao thông, Phương tiện & Đi lại (交通・乗り物・移動)",
    10: "Du lịch, Khách sạn & Điểm đến (旅行・宿泊・観光)",
    11: "Thời tiết, Khí hậu & Bốn mùa (天気・気候・季節)",
    12: "Thiên nhiên, Động vật & Thực vật (自然・動植物・生物)",
    13: "Môi trường, Tái chế & Xã hội (環境・リサイクル・社会)",
    14: "Trường học, Giáo dục & Thi cử (学校・教育・試験)",
    15: "Nghề nghiệp, Xin việc & Phỏng vấn (就職・面接・仕事)",
    16: "Công sở, Đồng nghiệp & Văn phòng (会社・職場・同僚)",
    17: "Kinh doanh, Thương mại & Khách hàng (ビジネス・取引・顧客)",
    18: "Bưu điện, Ngân hàng & Thủ tục (郵便・銀行・手続き)",
    19: "Công nghệ, Internet & Thiết bị số (IT・ネット・デジタル)",
    20: "Thể thao, Sở thích & Giải trí (スポーツ・趣味・娯楽)",
    21: "Nghệ thuật, Văn hóa & Lễ hội (芸術・文化・行事)",
    22: "Tâm trạng, Cảm xúc & Tính cách (感情・気分・性格)",
    23: "Hành vi, Thói quen & Thái độ (行動・習慣・態度)",
    24: "Thời gian, Không gian & Trạng thái (時間・空間・様子)",
    25: "Phó từ, Liên từ & Quán dụng ngữ N3 (副詞・接続詞・慣用句)"
}

N2_TOPICS = {
    1: "Kinh tế, Thị trường & Tiền tệ (経済・市場・金融)",
    2: "Doanh nghiệp, Đầu tư & Tài chính (企業・投資・財務)",
    3: "Thương mại, Xuất nhập khẩu & Hợp đồng (貿易・輸出入・契約)",
    4: "Chính trị, Nhà nước & Thể chế (政治・国家・体制)",
    5: "Pháp luật, Tư pháp & Trật tự (法律・司法・秩序)",
    6: "Xã hội, Dân số & Phúc lợi (社会・人口・福祉)",
    7: "Lao động, Việc làm & Tuyển dụng (労働・雇用・採用)",
    8: "Đàm phán, Giao dịch & Thương vụ (交渉・取引・商談)",
    9: "Khoa học kỹ thuật & Nghiên cứu (科学技術・研究・開発)",
    10: "Công nghệ thông tin & Bảo mật (IT・情報・セキュリティ)",
    11: "Môi trường sinh thái & Biến đổi khí hậu (環境・生態系・気候変動)",
    12: "Năng lượng, Tài nguyên & Khí thải (エネルギー・資源・脱炭素)",
    13: "Y tế, Phòng dịch & Sức khỏe cộng đồng (医療・防疫・公衆衛生)",
    14: "Tâm lý học, Nhận thức & Tư duy (心理・認識・思考)",
    15: "Cảm xúc vi tế & Giằng xé nội tâm (感情・葛藤・情緒)",
    16: "Giáo dục, Đào tạo & Học thuật (教育・育成・学術)",
    17: "Báo chí, Truyền thông & Dư luận (報道・メディア・世論)",
    18: "Nghệ thuật, Văn hóa & Di sản (芸術・文化・遺産)",
    19: "Đô thị, Quy hoạch & Hạ tầng (都市・計画・インフラ)",
    20: "Thiên tai, Khẩn cấp & An toàn (災害・緊急・安全)",
    21: "Mối quan hệ, Giao tiếp & Đối nhân xử thế (人間関係・対人・マナー)",
    22: "Biến chuyển, Xu hướng & Thời đại (変化・傾向・トレンド)",
    23: "Nhận định, Đánh giá & Lập luận (評価・見解・論理)",
    24: "Phó từ chỉ mức độ & Trạng thái N2 (副詞・程度・状態)",
    25: "Thành ngữ 4 chữ & Quán dụng ngữ N2 (四字熟語・慣用句)"
}

N1_TOPICS = {
    1: "Chính trị đối ngoại & Bang giao quốc tế (外交・国際協調)",
    2: "Thể chế, Hiến pháp & Quyền lực nhà nước (憲法・統治・権力)",
    3: "Kinh tế vĩ mô & Chính sách tài khóa (マクロ経済・財政政策)",
    4: "Tài chính tiền tệ & Thị trường vốn (金融・為替・資本市場)",
    5: "Tư pháp, Tố tụng & Tranh chấp pháp lý (司法・訴訟・法廷)",
    6: "Quyền công dân, Nhân quyền & Đạo lý (人権・市民権・正義)",
    7: "Triết học, Nhận thức luận & Hiện sinh (哲学・認識論・実存)",
    8: "Logic học, Biện chứng & Nghịch lý (論理学・弁証法・パラドックス)",
    9: "Khoa học tiên tiến, Lượng tử & Vũ trụ (先端科学・量子・宇宙)",
    10: "Công nghệ sinh học & Đạo đức sinh học (バイオ・生命倫理)",
    11: "Mạng máy tính & Không gian số ảo (サイバー空間・デジタル主権)",
    12: "Biến đổi khí hậu & Phát triển bền vững (地球規模課題・持続可能性)",
    13: "Xã hội học, Cơ cấu giai cấp & Dân số (社会学・格差・人口動態)",
    14: "Lao động, Tự động hóa & Thị trường việc làm (労働市場・自動化・雇用)",
    15: "An sinh xã hội & Y tế cộng đồng chuyên sâu (社会保障・高度医療)",
    16: "Tâm lý học hành vi & Vô thức (行動心理・無意識・精神)",
    17: "Cảm xúc phức hợp & Nhân cách con người (複雑な情動・人格)",
    18: "Ngôn ngữ học, Ngữ nghĩa & Ký hiệu học (言語学・意味論・記号)",
    19: "Văn học, Thi ca & Phê bình nghệ thuật (文学・詩歌・芸術批評)",
    20: "Lịch sử, Di tích & Nền văn minh cổ đại (歴史・文明・史跡)",
    21: "Tôn giáo, Tín ngưỡng & Phong tục tập quán (宗教・信仰・習俗)",
    22: "Giao tiếp bác học & Ngoại giao công chúng (格調高い表現・対外発信)",
    23: "Tranh luận, Diễn thuyết & Hùng biện (討論・演説・修辞)",
    24: "Biến chuyển vĩ mô & Bất ổn toàn cầu (激動・構造変化・地政学)",
    25: "Phẩm hạnh, Khí chất & Đạo đức cá nhân (品格・気概・倫理)",
    26: "Trạng thái, Cảnh tượng & Mô tả tinh tế (精緻な描写・様相)",
    27: "Hành vi cưỡng bức & Tác động xã hội (抑圧・推進・影響力)",
    28: "Từ ngữ cổ điển, Văn phong bác học (雅語・古典的表現)",
    29: "Phó từ & Quán ngữ biểu cảm đỉnh cao N1 (高度な副詞・慣用表現)",
    30: "Thành ngữ 4 chữ (Yojijukugo) N1 toàn tập (四字熟語マスター)"
}

# ── 2. PROCESS LESSONS ──
lessons_list = []

# N5 Lessons
for num in range(1, 26):
    lessons_list.append({
        "level": "N5",
        "lesson_number": num,
        "title": N5_TITLES.get(num, f"Bài {num}"),
        "description": f"Giáo trình Minna no Nihongo I - Bài {num}: {N5_TITLES.get(num, '')}"
    })

# N4 Lessons
for num in range(26, 51):
    lessons_list.append({
        "level": "N4",
        "lesson_number": num,
        "title": N4_TITLES.get(num, f"Bài {num}"),
        "description": f"Giáo trình Minna no Nihongo II - Bài {num}: {N4_TITLES.get(num, '')}"
    })

# N3 Lessons
for num in range(1, 26):
    lessons_list.append({
        "level": "N3",
        "lesson_number": num,
        "title": N3_TOPICS.get(num, f"Bài {num}"),
        "description": f"Giáo trình Soumatome & Shinkanzen Master N3 - Bài {num:02d}: {N3_TOPICS.get(num, '')}"
    })

# N2 Lessons
for num in range(1, 26):
    lessons_list.append({
        "level": "N2",
        "lesson_number": num,
        "title": N2_TOPICS.get(num, f"Bài {num}"),
        "description": f"Giáo trình Soumatome & Shinkanzen Master N2 - Bài {num:02d}: {N2_TOPICS.get(num, '')}"
    })

# N1 Lessons
for num in range(1, 31):
    lessons_list.append({
        "level": "N1",
        "lesson_number": num,
        "title": N1_TOPICS.get(num, f"Bài {num}"),
        "description": f"Giáo trình Thượng Cấp Bác Học N1 - Bài {num:02d}: {N1_TOPICS.get(num, '')}"
    })

print(f"Constructed {len(lessons_list)} lessons across N5-N1.")

# ── 3. PROCESS VOCABULARIES ──
vocab_list = []
vocab_id = 1

# N5 Vocabularies
with open(f"{JLPT_DIR}/n5_full_lessons.json", "r", encoding="utf-8") as f:
    n5_data = json.load(f)
for l_key, words in n5_data.items():
    l_num = int(l_key)
    for idx, w in enumerate(words, 1):
        vocab_list.append({
            "id": vocab_id,
            "level": "N5",
            "lesson_number": l_num,
            "order_num": idx,
            "kanji": w.get("kanji") or "",
            "kana": w.get("kana") or w.get("clean_kana") or "",
            "clean_kana": w.get("clean_kana") or w.get("kana") or "",
            "romaji": w.get("romaji") or "",
            "vietnamese": w.get("vietnamese") or w.get("clean_vietnamese") or "",
            "clean_vietnamese": w.get("clean_vietnamese") or w.get("vietnamese") or "",
            "example_jp": w.get("example_jp") or "",
            "example_vi": w.get("example_vi") or "",
            "usage_note": w.get("usage_note") or ""
        })
        vocab_id += 1

# N4 Vocabularies
with open(f"{JLPT_DIR}/n4_full_lessons.json", "r", encoding="utf-8") as f:
    n4_data = json.load(f)
for l_key, words in n4_data.items():
    l_num = int(l_key)
    for idx, w in enumerate(words, 1):
        kana = w.get("kana") or w.get("full_kana") or ""
        vocab_list.append({
            "id": vocab_id,
            "level": "N4",
            "lesson_number": l_num,
            "order_num": idx,
            "kanji": w.get("kanji") or "",
            "kana": kana,
            "clean_kana": kana,
            "romaji": w.get("romaji") or "",
            "vietnamese": w.get("vietnamese") or "",
            "clean_vietnamese": w.get("vietnamese") or "",
            "example_jp": "",
            "example_vi": "",
            "usage_note": ""
        })
        vocab_id += 1

# Helper for N3, N2, N1 chunking
def add_chunked_vocabs(level, json_file, topics_dict):
    global vocab_id
    with open(f"{JLPT_DIR}/{json_file}", "r", encoding="utf-8") as f:
        words = json.load(f)
    num_lessons = len(topics_dict)
    chunk_size = math.ceil(len(words) / num_lessons)
    for n in range(1, num_lessons + 1):
        start_idx = (n - 1) * chunk_size
        end_idx = min(start_idx + chunk_size, len(words))
        chunk = words[start_idx:end_idx]
        for idx, w in enumerate(chunk, 1):
            kana = w.get("kana") or ""
            vocab_list.append({
                "id": vocab_id,
                "level": level,
                "lesson_number": n,
                "order_num": idx,
                "kanji": w.get("kanji") or "",
                "kana": kana,
                "clean_kana": kana,
                "romaji": w.get("romaji") or "",
                "vietnamese": w.get("vietnamese") or "",
                "clean_vietnamese": w.get("vietnamese") or "",
                "example_jp": "",
                "example_vi": "",
                "usage_note": ", ".join(w.get("pos", [])) if w.get("pos") else ""
            })
            vocab_id += 1

add_chunked_vocabs("N3", "processed_n3.json", N3_TOPICS)
add_chunked_vocabs("N2", "processed_n2.json", N2_TOPICS)
add_chunked_vocabs("N1", "processed_n1.json", N1_TOPICS)

print(f"Constructed {len(vocab_list)} vocabularies across N5-N1.")

# ── 4. PROCESS KANJI ──
kanji_list = []
kanji_id = 1
seen_kanji = set()

for lvl in ["N5", "N4", "N3", "N2", "N1"]:
    excel_path = f"{JLPT_DIR}/Kanji_{lvl}_Day_Du.xlsx"
    wb = openpyxl.load_workbook(excel_path, data_only=True)
    l_counter = 1
    for sheet_name in wb.sheetnames:
        if "Mục Lục" in sheet_name:
            continue
        ws = wb[sheet_name]
        for r in range(7, ws.max_row + 1):
            char = ws.cell(row=r, column=2).value
            if not char or not str(char).strip():
                continue
            char = str(char).strip()
            
            han_viet = str(ws.cell(row=r, column=3).value or "").strip()
            onyomi = str(ws.cell(row=r, column=4).value or "").strip()
            kunyomi = str(ws.cell(row=r, column=5).value or "").strip()
            meaning = str(ws.cell(row=r, column=6).value or "").strip()
            ex_str = str(ws.cell(row=r, column=7).value or "").strip()
            
            # Parse examples
            examples = []
            if ex_str and ex_str != "–":
                parts = [p.strip() for p in ex_str.split(",") if p.strip()]
                for p in parts:
                    examples.append({"word": p, "reading": "", "meaning": ""})
            
            kanji_list.append({
                "id": kanji_id,
                "level": lvl,
                "lesson_number": l_counter,
                "kanji": char,
                "han_viet": han_viet,
                "onyomi": onyomi,
                "kunyomi": kunyomi,
                "meaning": meaning,
                "stroke_count": 0,
                "examples": examples
            })
            kanji_id += 1
        l_counter += 1

print(f"Constructed {len(kanji_list)} kanji across N5-N1.")

# ── 5. PROCESS GRAMMAR ──
grammar_list = []
grammar_id = 1

for lvl in ["N5", "N4", "N3", "N2", "N1"]:
    excel_path = f"{JLPT_DIR}/Ngu_Phap_{lvl}_Minna_No_Nihongo.xlsx" if lvl in ["N5", "N4"] else f"{JLPT_DIR}/Ngu_Phap_{lvl}_Day_Du.xlsx"
    wb = openpyxl.load_workbook(excel_path, data_only=True)
    
    l_idx = 1
    for sheet_name in wb.sheetnames:
        if "Mục Lục" in sheet_name:
            continue
        ws = wb[sheet_name]
        
        # Determine lesson_number
        lesson_num = l_idx
        if lvl == "N4":
            # Sheet names in N4 are usually "Bài 26", etc.
            try:
                lesson_num = int("".join(filter(str.isdigit, sheet_name)))
            except:
                lesson_num = 25 + l_idx
        
        # Read header row 6 to determine columns
        headers = [ws.cell(row=6, column=c).value for c in range(1, 10)]
        is_n3 = (lvl == "N3")
        
        for r in range(7, ws.max_row + 1):
            title = ws.cell(row=r, column=2).value
            if not title or not str(title).strip():
                continue
            title = str(title).strip()
            structure = str(ws.cell(row=r, column=3).value or "").strip()
            meaning = str(ws.cell(row=r, column=4).value or "").strip()
            
            ex_ja = ""
            ex_vi = ""
            answer = ""
            
            if is_n3:
                ex_ja = str(ws.cell(row=r, column=5).value or "").strip()
                ex_vi = str(ws.cell(row=r, column=6).value or "").strip()
                answer = str(ws.cell(row=r, column=9).value or "").strip()
            else:
                ex_ja = str(ws.cell(row=r, column=5).value or "").strip()
                answer = str(ws.cell(row=r, column=6).value or "").strip()
            
            examples = []
            if ex_ja:
                examples.append({
                    "jp": ex_ja,
                    "vi": ex_vi or meaning,
                    "answer": answer
                })
            
            order_num = r - 6
            grammar_list.append({
                "id": grammar_id,
                "level": lvl,
                "lesson_number": lesson_num,
                "order_num": order_num,
                "title": title,
                "structure": structure,
                "meaning": meaning,
                "usage_notes": f"Đáp án bài tập điền khuyết: {answer}" if answer else "",
                "examples": examples
            })
            grammar_id += 1
        l_idx += 1

print(f"Constructed {len(grammar_list)} grammar points across N5-N1.")

# ── 6. PROCESS PARTICLES & EXERCISES ──
sys.path.insert(0, JLPT_DIR)
import data_tro_tu

particles_theory = []
part_id = 1
for sheet_name, items in data_tro_tu.tro_tu_theory_sheets.items():
    lvl = "N5"
    if "N4" in sheet_name:
        lvl = "N4"
    elif "N3" in sheet_name:
        lvl = "N3"
    elif "N2" in sheet_name or "N1" in sheet_name:
        lvl = "N2"
        
    for item in items:
        particles_theory.append({
            "id": part_id,
            "level": lvl,
            "particle": item.get("particle", ""),
            "role": item.get("role", ""),
            "meaning": item.get("meaning", ""),
            "example": item.get("example", ""),
            "translation": item.get("translation", ""),
            "notes": item.get("notes", "")
        })
        part_id += 1

print(f"Constructed {len(particles_theory)} particle theory items.")

particle_exercises = []
ex_id = 1
for sheet_name, exercises in data_tro_tu.tro_tu_practice_sheets.items():
    is_upper = "N3-N1" in sheet_name
    for idx, ex in enumerate(exercises):
        lvl = "N3" if is_upper else "N5"
        if not is_upper and idx >= 15:
            lvl = "N4"
        elif is_upper and idx >= 15:
            lvl = "N2"
        
        choices_raw = ex.get("choices", "")
        options = [c.strip() for c in choices_raw.split("/") if c.strip()]
        
        particle_exercises.append({
            "id": ex_id,
            "level": lvl,
            "question": ex.get("question", ""),
            "options": options,
            "answer": ex.get("answer", ""),
            "explanation": ex.get("meaning", "")
        })
        ex_id += 1

print(f"Constructed {len(particle_exercises)} particle exercises.")

# ── 7. WRITE TO BACKEND DATA DIRECTORY ──
with open(f"{BACKEND_DATA_DIR}/all_lessons.json", "w", encoding="utf-8") as f:
    json.dump(lessons_list, f, ensure_ascii=False, indent=2)

with open(f"{BACKEND_DATA_DIR}/all_vocabularies.json", "w", encoding="utf-8") as f:
    json.dump(vocab_list, f, ensure_ascii=False, indent=2)

with open(f"{BACKEND_DATA_DIR}/all_kanji.json", "w", encoding="utf-8") as f:
    json.dump(kanji_list, f, ensure_ascii=False, indent=2)

with open(f"{BACKEND_DATA_DIR}/all_grammar.json", "w", encoding="utf-8") as f:
    json.dump(grammar_list, f, ensure_ascii=False, indent=2)

with open(f"{BACKEND_DATA_DIR}/all_particles.json", "w", encoding="utf-8") as f:
    json.dump(particles_theory, f, ensure_ascii=False, indent=2)

with open(f"{BACKEND_DATA_DIR}/all_particle_exercises.json", "w", encoding="utf-8") as f:
    json.dump(particle_exercises, f, ensure_ascii=False, indent=2)

print("\nSUCCESS: All datasets extracted and saved to backend/data/ perfectly!")
