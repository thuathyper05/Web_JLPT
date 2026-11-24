// Dữ liệu chủ đề lộ trình và từ điển chiết tự mẹo nhớ Kanji
// ZERO ARROWS RULE: Tuyệt đối không dùng ký tự mũi tên trong toàn bộ file

export const KANJI_TOPICS = [
  {
    id: 'numbers',
    name: 'Số đếm và Đơn vị',
    enName: 'Numbers and Units',
    desc: 'Các chữ số cơ bản từ một đến mười vạn, tiền tệ và phân chia số lượng.',
    iconName: 'Hash',
    chars: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万', '円', '半', '何']
  },
  {
    id: 'time',
    name: 'Thời gian và Lịch pháp',
    enName: 'Time and Calendar',
    desc: 'Các ngày trong tuần, tháng năm, giờ phút, buổi sáng tối và mùa màng.',
    iconName: 'Calendar',
    chars: ['日', '月', '火', '水', '木', '金', '土', '年', '時', '分', '今', '先', '毎', '週', '間', '朝', '昼', '夕', '夜', '昨', '曜', '末', '期', '春', '夏', '秋', '冬']
  },
  {
    id: 'people',
    name: 'Con người và Cơ thể',
    enName: 'People and Body',
    desc: 'Con người, gia đình, giới tính, các bộ phận cơ thể và tấm lòng.',
    iconName: 'Users',
    chars: ['人', '男', '女', '子', '父', '母', '友', '私', '目', '耳', '口', '手', '足', '心', '体', '頭', '兄', '弟', '姉', '妹', '夫', '妻', '主', '親', '族', '者']
  },
  {
    id: 'nature',
    name: 'Thiên nhiên và Không gian',
    enName: 'Nature and Directions',
    desc: 'Núi sông, trời đất, cỏ cây, thời tiết và bốn phương hướng.',
    iconName: 'Compass',
    chars: ['山', '川', '田', '天', '気', '雨', '空', '花', '魚', '犬', '上', '下', '中', '左', '右', '前', '後', '北', '南', '東', '西', '海', '風', '雪', '晴', '曇', '波', '光', '地', '図']
  },
  {
    id: 'actions',
    name: 'Hành động và Di chuyển',
    enName: 'Actions and Daily Life',
    desc: 'Các động từ sinh hoạt: đi lại, ăn uống, nhìn nghe, học đọc viết.',
    iconName: 'Activity',
    chars: ['行', '来', '帰', '食', '飲', '見', '聞', '読', '書', '話', '買', '物', '休', '会', '言', '立', '待', '入', '出', '止', '歩', '走', '乗', '降', '動', '運', '転', '作', '使', '知', '考', '開', '閉', '始', '終']
  },
  {
    id: 'places',
    name: 'Trường học và Địa điểm',
    enName: 'School and Society',
    desc: 'Trường học, văn phòng, nhà ga, cửa hiệu, bệnh viện và đường sá.',
    iconName: 'Building',
    chars: ['大', '小', '高', '校', '学', '生', '先', '店', '駅', '社', '車', '電', '道', '名', '本', '国', '京', '都', '府', '県', '市', '町', '村', '所', '銀', '院', '堂', '館', '室', '門', '家', '場', '民']
  },
  {
    id: 'qualities',
    name: 'Tính chất và Trạng thái',
    enName: 'Adjectives and States',
    desc: 'Màu sắc, kích thước, mới cũ, nhiều ít, mức độ và cảm giác.',
    iconName: 'Sparkles',
    chars: ['白', '赤', '青', '黒', '色', '長', '多', '少', '新', '古', '高', '低', '安', '近', '遠', '早', '明', '暗', '広', '重', '軽', '熱', '病', '痛', '強', '弱', '同', '別', '難', '易', '忙', '静']
  }
];

// Bộ từ điển chiết tự và mẹo nhớ trực quan chuẩn sư phạm
export const KANJI_MNEMONICS = {
  '一': {
    radicals: [{ char: '一', name: 'Nhất', meaning: 'Một nét ngang' }],
    origin: 'Chữ Chỉ sự: Một nét ngang duy nhất tượng trưng cho số một khởi đầu vạn vật.',
    mnemonic: 'Chỉ cần một ngón tay đưa ngang là số Một (一).',
    strokeOrderTip: 'Vẽ một nét ngang dứt khoát từ trái sang phải, hơi chếch nhẹ lên trên rồi dừng nét.'
  },
  '二': {
    radicals: [{ char: '二', name: 'Nhị', meaning: 'Hai nét ngang' }],
    origin: 'Chữ Chỉ sự: Hai nét ngang tượng trưng cho trời ở trên và đất ở dưới.',
    mnemonic: 'Hai nét ngang song song thể hiện số Hai (二), nét dưới dài hơn nét trên.',
    strokeOrderTip: 'Viết nét ngang trên ngắn hơn, nét ngang dưới dài hơn để giữ thăng bằng.'
  },
  '三': {
    radicals: [{ char: '一', name: 'Nhất', meaning: 'Ba nét ngang chồng lên nhau' }],
    origin: 'Chữ Chỉ sự: Ba nét ngang biểu thị Tam tài: Thiên (Trời), Địa (Đất), Nhân (Người).',
    mnemonic: 'Ba nét ngang xếp lớp là số Ba (三), nét giữa ngắn nhất, nét đáy dài nhất.',
    strokeOrderTip: 'Nét 1 vừa phải, nét 2 ngắn nhất, nét 3 dài nhất làm bệ đỡ vững chãi.'
  },
  '四': {
    radicals: [
      { char: '囗', name: 'Vi', meaning: 'Khung bao quanh bên ngoài' },
      { char: '儿', name: 'Nhi', meaning: 'Đôi chân rủ xuống' }
    ],
    origin: 'Chữ Hội ý: Khung bao bọc có bốn góc tường chắn gió.',
    mnemonic: 'Một căn phòng kín (囗) có bốn góc tường và bốn cạnh là số Bốn (四).',
    strokeOrderTip: 'Viết sổ dọc trái, góc ngang gập phải, vẽ hai nét bên trong rồi mới đóng đáy.'
  },
  '五': {
    radicals: [{ char: '二', name: 'Nhị', meaning: 'Trời đất' }],
    origin: 'Chữ Chỉ sự: Biểu thị ngũ hành giao thoa giữa trời và đất.',
    mnemonic: 'Năm ngón tay đan chéo giao thoa giữa trời và đất thành số Năm (五).',
    strokeOrderTip: 'Nét ngang trên, sổ dọc hơi nghiêng, nét gập ngang xuống, nét ngang đáy dài.'
  },
  '六': {
    radicals: [
      { char: '亠', name: 'Đầu', meaning: 'Mũ che ở trên' },
      { char: '八', name: 'Bát', meaning: 'Tách ra hai bên' }
    ],
    origin: 'Chữ Tượng hình: Ngôi nhà lều có mái nhọn và hai chân trụ.',
    mnemonic: 'Một người đội nón đứng dạng chân như một ngôi lều số Sáu (六).',
    strokeOrderTip: 'Chấm trên đỉnh, nét ngang vừa phải, sau đó phẩy trái và chấm phải đối xứng.'
  },
  '七': {
    radicals: [{ char: '一', name: 'Nhất', meaning: 'Nét ngang cắt dọc' }],
    origin: 'Chữ Chỉ sự: Một đường cắt qua đường ngang biểu thị sự cắt đôi.',
    mnemonic: 'Số Bảy giống như lưỡi dao cắt ngang dứt khoát thành số Bảy (七).',
    strokeOrderTip: 'Nét ngang trước hơi dốc lên, nét sổ cong móc sang phải sau cùng.'
  },
  '八': {
    radicals: [{ char: '八', name: 'Bát', meaning: 'Hai nét mở rộng' }],
    origin: 'Chữ Tượng hình: Hai nét phân nhánh mở rộng xuống đáy tượng trưng cho sự phát triển.',
    mnemonic: 'Đỉnh núi Phú Sĩ mở rộng chân núi về hai phía là số Tám (八) phát tài.',
    strokeOrderTip: 'Nét phẩy trái ngắn hơn và không chạm vào nét mác phải dài hơn.'
  },
  '九': {
    radicals: [{ char: '乙', name: 'Ất', meaning: 'Cánh tay gập' }],
    origin: 'Chữ Tượng hình: Hình dáng cánh tay co gập cong queo.',
    mnemonic: 'Số Chín (九) giống như một võ sĩ đang gập cánh tay phô diễn sức mạnh dũng mãnh.',
    strokeOrderTip: 'Phẩy cong từ trên xuống trái trước, nét ngang gập cong móc viết sau.'
  },
  '十': {
    radicals: [{ char: '十', name: 'Thập', meaning: 'Chữ thập toàn vẹn' }],
    origin: 'Chữ Chỉ sự: Một nét ngang và một nét dọc giao nhau tượng trưng cho bốn phương tám hướng hội tụ.',
    mnemonic: 'Dấu chữ thập trọn vẹn hoàn mỹ đại diện cho số Mười (十) tròn trĩnh.',
    strokeOrderTip: 'Ngang trước sổ sau, nét sổ dọc thẳng tắp cắt chính giữa nét ngang.'
  },
  '百': {
    radicals: [
      { char: '一', name: 'Nhất', meaning: 'Số một' },
      { char: '白', name: 'Bạch', meaning: 'Màu trắng, sáng rõ' }
    ],
    origin: 'Chữ Hội ý: Một trăm là con số tròn trĩnh lớn lao.',
    mnemonic: 'Thêm một nét trên đầu chữ Bạch (白) màu trắng là thành một Trăm (百).',
    strokeOrderTip: 'Nét ngang trên cùng, nét phẩy ngắn bên trái, sau đó viết khung chữ nhật bên dưới.'
  },
  '千': {
    radicals: [
      { char: '亻', name: 'Nhân', meaning: 'Người' },
      { char: '十', name: 'Thập', meaning: 'Số mười' }
    ],
    origin: 'Chữ Hội ý: Rất nhiều người cùng tiến bước tạo thành hàng ngàn.',
    mnemonic: 'Một ngàn (千) người mang trên vai dấu thập tiến về phía trước.',
    strokeOrderTip: 'Nét phẩy ngắn trên đầu từ phải qua trái, nét ngang, sau đó nét sổ dọc xuyên tâm.'
  },
  '万': {
    radicals: [{ char: '一', name: 'Nhất', meaning: 'Một nét ngang lớn' }],
    origin: 'Chữ Tượng hình: Biểu tượng bọ cạp với số lượng bầy đàn cực lớn tới hàng vạn.',
    mnemonic: 'Một đường ngang che chở cho hàng Vạn (万) muôn sinh linh.',
    strokeOrderTip: 'Nét ngang trên cùng, nét gập móc bên dưới, sau đó nét phẩy xéo sang trái.'
  },
  '円': {
    radicals: [{ char: '冂', name: 'Quynh', meaning: 'Khung bao ngoài' }],
    origin: 'Chữ Tượng hình: Đồng xu tròn trịa có lỗ ở giữa.',
    mnemonic: 'Đồng tiền Yên (円) tròn trịa nằm trong chiếc ví vuông vức an toàn.',
    strokeOrderTip: 'Sổ dọc trái, ngang gập móc phải, hai nét ngang và dọc bên trong.'
  },
  '日': {
    radicals: [{ char: '日', name: 'Nhật', meaning: 'Mặt trời, ngày' }],
    origin: 'Chữ Tượng hình: Vẽ hình mặt trời tròn với một điểm sáng ở chính giữa.',
    mnemonic: 'Mặt trời chiếu sáng tỏa ra năng lượng mỗi ngày (日).',
    strokeOrderTip: 'Sổ dọc trái, nét ngang gập xuống bên phải, nét ngang giữa, rồi đóng đáy.'
  },
  '月': {
    radicals: [{ char: '月', name: 'Nguyệt', meaning: 'Mặt trăng, tháng' }],
    origin: 'Chữ Tượng hình: Vầng trăng khuyết lấp lánh trên bầu trời đêm.',
    mnemonic: 'Vầng trăng khuyết có hai dải mây vắt ngang là chữ Nguyệt (月).',
    strokeOrderTip: 'Phẩy dài bên trái cong xuống, ngang gập móc bên phải, hai nét ngang bên trong.'
  },
  '火': {
    radicals: [{ char: '火', name: 'Hỏa', meaning: 'Ngọn lửa bốc cháy' }],
    origin: 'Chữ Tượng hình: Đốm lửa bập bùng với tàn lửa bay sang hai bên.',
    mnemonic: 'Ngọn lửa (火) đỏ rực cháy bập bùng bốc lên từ đống củi khô.',
    strokeOrderTip: 'Hai chấm hai bên trước, sau đó phẩy trái và mác phải xòe rộng.'
  },
  '水': {
    radicals: [{ char: '水', name: 'Thủy', meaning: 'Nước chảy' }],
    origin: 'Chữ Tượng hình: Dòng nước cuồn cuộn chảy xiết ở giữa và bọt sóng hai bên.',
    mnemonic: 'Dòng nước (水) mát lành tuôn chảy từ khe núi đá ra sông lớn.',
    strokeOrderTip: 'Sổ móc câu chính giữa trước, nét gập bên trái, sau đó phẩy và mác bên phải.'
  },
  '木': {
    radicals: [{ char: '木', name: 'Mộc', meaning: 'Cái cây, gỗ' }],
    origin: 'Chữ Tượng hình: Thân cây đứng thẳng, cành lá xòe ngang và rễ cắm sâu vào lòng đất.',
    mnemonic: 'Một thân cây (木) vững chãi tỏa cành lá đón nắng ấm.',
    strokeOrderTip: 'Nét ngang trước, sổ dọc thẳng tắp, sau đó phẩy trái và mác phải xòe đều.'
  },
  '金': {
    radicals: [
      { char: '人', name: 'Nhân', meaning: 'Mái che' },
      { char: '土', name: 'Thổ', meaning: 'Đất cát chôn giấu' }
    ],
    origin: 'Chữ Hội ý: Kim loại quý báu và vàng được chôn giấu sâu trong lòng đất mẹ.',
    mnemonic: 'Vàng kim (金) lấp lánh là kho báu quý giá ẩn sâu dưới lòng đất mẹ.',
    strokeOrderTip: 'Nét nhân trên đầu mở rộng, hai nét ngang, nét sổ và hai hạt vàng hai bên, đóng đáy.'
  },
  '土': {
    radicals: [{ char: '土', name: 'Thổ', meaning: 'Đất đai' }],
    origin: 'Chữ Tượng hình: Chồi non nhú lên từ mặt đất phì nhiêu.',
    mnemonic: 'Đất mẹ Thổ (土) nuôi dưỡng mầm non vươn lên thành cây xanh.',
    strokeOrderTip: 'Nét ngang trên ngắn, nét sổ dọc thẳng, nét ngang đáy dài đỡ lấy toàn bộ.'
  },
  '年': {
    radicals: [{ char: '干', name: 'Can', meaning: 'Bó lúa chín' }],
    origin: 'Chữ Tượng hình: Bó lúa chín trĩu hạt được thu hoạch sau một năm dài.',
    mnemonic: 'Mỗi năm (年) trôi qua là một mùa gặt bội thu đón Tết sum vầy.',
    strokeOrderTip: 'Phẩy ngắn trên, ngang, sổ ngắn, ngang, sổ dọc xuyên qua và ngang dài đóng đáy.'
  },
  '時': {
    radicals: [
      { char: '日', name: 'Nhật', meaning: 'Mặt trời' },
      { char: '寺', name: 'Tự', meaning: 'Chùa chiền' }
    ],
    origin: 'Chữ Hội ý: Thời xưa người ta nhìn bóng mặt trời soi trên mái chùa để biết giờ giấc.',
    mnemonic: 'Mặt trời (日) chiếu bóng qua cổng chùa (寺) báo hiệu Thời gian và Giờ (時).',
    strokeOrderTip: 'Viết bộ Nhật bên trái thon gọn, sau đó viết chữ Tự bên phải cân đối.'
  },
  '分': {
    radicals: [
      { char: '八', name: 'Bát', meaning: 'Chia tách sang hai bên' },
      { char: '刀', name: 'Đao', meaning: 'Con dao cắt' }
    ],
    origin: 'Chữ Hội ý: Dùng con dao bổ đôi đồ vật ra làm nhiều phần.',
    mnemonic: 'Dùng con dao (刀) chia tách (八) miếng bánh thành từng Phút và từng Phần (分).',
    strokeOrderTip: 'Viết bộ Bát bên trên phẩy mác mở rộng, bộ Đao bên dưới gọn gàng.'
  },
  '半': {
    radicals: [
      { char: '八', name: 'Bát', meaning: 'Chia đều hai bên' },
      { char: '十', name: 'Thập', meaning: 'Đường phân chia chính giữa' }
    ],
    origin: 'Chữ Chỉ sự: Bổ đôi một con bò hoặc sự vật ra làm hai nửa bằng nhau.',
    mnemonic: 'Một nét thẳng chia đều sang hai bên thành một Nửa (半).',
    strokeOrderTip: 'Hai chấm phẩy trên đầu, nét ngang ngắn, nét ngang dài, nét sổ dọc xuyên tâm.'
  },
  '人': {
    radicals: [{ char: '人', name: 'Nhân', meaning: 'Con người' }],
    origin: 'Chữ Tượng hình: Người đứng nghiêng đưa hai chân bước đi vững chãi.',
    mnemonic: 'Hai nét tựa vào nhau biểu thị Con người (人) luôn cần nâng đỡ sẻ chia.',
    strokeOrderTip: 'Phẩy cong từ trên xuống trái trước, nét mác nghiêng sang phải tiếp giáp ở lưng.'
  },
  '男': {
    radicals: [
      { char: '田', name: 'Điền', meaning: 'Ruộng đồng' },
      { char: '力', name: 'Lực', meaning: 'Sức mạnh, cơ bắp' }
    ],
    origin: 'Chữ Hội ý: Người dùng sức lực cày cấy trên ruộng đồng là người đàn ông.',
    mnemonic: 'Người dùng sức Lực (力) lao động trên cánh Đồng (田) là người Đàn ông (男).',
    strokeOrderTip: 'Viết chữ Điền vuông vức bên trên, viết chữ Lực khỏe khoắn bên dưới.'
  },
  '女': {
    radicals: [{ char: '女', name: 'Nữ', meaning: 'Phụ nữ' }],
    origin: 'Chữ Tượng hình: Người phụ nữ ngồi khép nép duyên dáng đan tay trước ngực.',
    mnemonic: 'Dáng ngồi đoan trang dịu dàng của người Phụ nữ (女).',
    strokeOrderTip: 'Nét phẩy gập sang phải trước, nét phẩy xéo trái, sau đó nét ngang cắt ngang eo.'
  },
  '子': {
    radicals: [{ char: '子', name: 'Tử', meaning: 'Đứa trẻ, con cái' }],
    origin: 'Chữ Tượng hình: Đứa bé sơ sinh giơ hai tay nhỏ nhắn múa mừng.',
    mnemonic: 'Đứa Con (子) nhỏ bé giơ đôi tay ngây thơ đòi mẹ ôm vào lòng.',
    strokeOrderTip: 'Nét ngang gập móc, nét cong móc xuống dưới, nét ngang cắt ngang ngực.'
  },
  '父': {
    radicals: [{ char: '父', name: 'Phụ', meaning: 'Người cha' }],
    origin: 'Chữ Tượng hình: Bàn tay người cha cầm cây trượng dẫn dắt gia đình.',
    mnemonic: 'Người Cha (父) nghiêm nghị cầm thước dạy dỗ con cái nên người.',
    strokeOrderTip: 'Hai nét phẩy và chấm ngắn phía trên, sau đó nét phẩy dài trái và mác phải xòe.'
  },
  '母': {
    radicals: [{ char: '母', name: 'Mẫu', meaning: 'Người mẹ' }],
    origin: 'Chữ Tượng hình: Người mẹ ôm con vào lòng cho bú dòng sữa ngọt ngào.',
    mnemonic: 'Người Mẹ (母) có hai giọt sữa ngọt ngào nuôi con khôn lớn từng ngày.',
    strokeOrderTip: 'Sổ dọc trái, góc gập, nét gập trong, hai chấm sữa và nét ngang dài cắt qua.'
  },
  '友': {
    radicals: [
      { char: '又', name: 'Hựu', meaning: 'Bàn tay' }
    ],
    origin: 'Chữ Hội ý: Hai bàn tay nắm chặt lấy nhau thể hiện tình bạn bè bền chặt.',
    mnemonic: 'Hai bàn tay nắm chặt lấy nhau không rời chính là Bạn bè (友) tri kỷ.',
    strokeOrderTip: 'Nét ngang trước, nét phẩy dài trái, nét ngang gập và nét mác sang phải.'
  },
  '山': {
    radicals: [{ char: '山', name: 'Sơn', meaning: 'Ngọn núi' }],
    origin: 'Chữ Tượng hình: Ba đỉnh núi nhấp nhô nối tiếp nhau sừng sững giữa trời.',
    mnemonic: 'Ba đỉnh Núi (山) trùng điệp nhấp nhô xanh ngát giữa mây ngàn.',
    strokeOrderTip: 'Sổ dọc giữa cao nhất trước, sổ dọc trái gập ngang sang phải, sổ dọc phải sau cùng.'
  },
  '川': {
    radicals: [{ char: '川', name: 'Xuyên', meaning: 'Dòng sông' }],
    origin: 'Chữ Tượng hình: Ba dòng nước lượn sóng uốn khúc chảy song song.',
    mnemonic: 'Ba làn nước mềm mại uốn lượn tạo thành Dòng sông (川) hiền hòa.',
    strokeOrderTip: 'Phẩy dọc trái hơi cong, sổ dọc giữa ngắn hơn, sổ dọc phải dài và thẳng nhất.'
  },
  '田': {
    radicals: [{ char: '田', name: 'Điền', meaning: 'Ruộng lúa' }],
    origin: 'Chữ Tượng hình: Cánh đồng lúa chia bờ thành bốn ô vuông màu mỡ.',
    mnemonic: 'Thửa Ruộng (田) phì nhiêu màu mỡ chia thành bốn ô dẫn nước tưới tiêu.',
    strokeOrderTip: 'Sổ dọc trái, ngang gập xuống phải, nét sổ giữa, nét ngang giữa rồi đóng đáy.'
  },
  '天': {
    radicals: [
      { char: '一', name: 'Nhất', meaning: 'Tầng trời' },
      { char: '大', name: 'Đại', meaning: 'Người to lớn' }
    ],
    origin: 'Chữ Hội ý: Trên đỉnh đầu người to lớn chính là bầu trời bao la vô tận.',
    mnemonic: 'Phía trên đầu con người (大) rộng lớn chính là Bầu trời (天) cao vòi vọi.',
    strokeOrderTip: 'Nét ngang trên ngắn hơn, nét ngang dưới dài hơn, phẩy trái và mác phải xòe rộng.'
  },
  '気': {
    radicals: [
      { char: '气', name: 'Khí', meaning: 'Hơi mây' },
      { char: 'メ', name: 'Mễ biến thể', meaning: 'Hạt gạo tỏa năng lượng' }
    ],
    origin: 'Chữ Hội ý: Hơi nước bốc lên từ nồi cơm đang sôi biểu thị sinh khí và năng lượng.',
    mnemonic: 'Khí sắc (気) tràn đầy năng lượng như hơi ấm bốc lên từ vạn vật tươi mới.',
    strokeOrderTip: 'Phẩy ngắn trên, hai nét ngang, nét cong móc bao ngoài rồi hai nét chéo bên trong.'
  },
  '雨': {
    radicals: [
      { char: '一', name: 'Nhất', meaning: 'Bầu trời' },
      { char: '冂', name: 'Quynh', meaning: 'Đám mây xám' }
    ],
    origin: 'Chữ Tượng hình: Đám mây giăng kín bầu trời buông những hạt mưa rơi.',
    mnemonic: 'Từ đám mây trên trời rớt xuống bốn hạt Nước Mưa (雨) rào rạt.',
    strokeOrderTip: 'Ngang trên, sổ ngắn giữa, khung bao ngoài, bốn chấm hạt mưa đối xứng hai bên.'
  },
  '休': {
    radicals: [
      { char: '亻', name: 'Nhân đứng', meaning: 'Con người' },
      { char: '木', name: 'Mộc', meaning: 'Cái cây bóng mát' }
    ],
    origin: 'Chữ Hội ý: Người làm mệt mỏi đứng tựa lưng vào gốc cây để nghỉ ngơi.',
    mnemonic: 'Con Người (亻) tựa lưng vào gốc Cây (木) râm mát để Nghỉ ngơi (休).',
    strokeOrderTip: 'Viết bộ Nhân đứng bên trái thon gọn, sau đó viết chữ Mộc bên phải.'
  },
  '食': {
    radicals: [
      { char: '人', name: 'Nhân', meaning: 'Người' },
      { char: '良', name: 'Lương', meaning: 'Đồ ăn tốt lành' }
    ],
    origin: 'Chữ Tượng hình: Chiếc bát có nắp đậy chứa đồ ăn thơm ngon dâng lên.',
    mnemonic: 'Con người tụ họp bên mâm cơm lành canh ngọt để Thưởng thức và Ăn (食).',
    strokeOrderTip: 'Bộ Nhân trên đầu xòe rộng, nét ngang gập bên dưới và các nét cấu thành thân bát.'
  },
  '飲': {
    radicals: [
      { char: '飠', name: 'Thực', meaning: 'Thức ăn nước uống' },
      { char: '欠', name: 'Khiếm', meaning: 'Người há to miệng' }
    ],
    origin: 'Chữ Hội ý: Người há to miệng để uống dòng nước mát.',
    mnemonic: 'Một người há to miệng (欠) bên cạnh bình đồ uống (飠) để Uống (飲) cạn ly.',
    strokeOrderTip: 'Viết bộ Thực bên trái thu nhỏ, sau đó viết chữ Khiếm bên phải nhịp nhàng.'
  },
  '見': {
    radicals: [
      { char: '目', name: 'Mục', meaning: 'Đôi mắt' },
      { char: '儿', name: 'Nhi', meaning: 'Đôi chân bước đi' }
    ],
    origin: 'Chữ Hội ý: Đôi mắt to lớn đặt trên đôi chân đi lại để quan sát thế giới.',
    mnemonic: 'Đôi Mắt (目) trên đôi Chân (儿) mở to để Ngắm nhìn và Thấy (見).',
    strokeOrderTip: 'Viết chữ Mục phía trên thon dài, sau đó viết hai nét chân uốn cong phía dưới.'
  },
  '聞': {
    radicals: [
      { char: '門', name: 'Môn', meaning: 'Cánh cửa' },
      { char: '耳', name: 'Nhĩ', meaning: 'Cái tai' }
    ],
    origin: 'Chữ Hội ý: Ghé tai sát vào khe cửa để lắng nghe ngóng tin tức.',
    mnemonic: 'Ghé cái Tai (耳) sát vào khe Cửa (門) để Lắng nghe và Nghe thấy (聞).',
    strokeOrderTip: 'Viết khung chữ Môn bên ngoài trước, sau đó đặt chữ Nhĩ ngay ngắn bên trong.'
  },
  '読': {
    radicals: [
      { char: '言', name: 'Ngôn', meaning: 'Lời nói, ngôn ngữ' },
      { char: '売', name: 'Mại', meaning: 'Bán buôn, truyền đạt' }
    ],
    origin: 'Chữ Hình thanh: Dùng lời nói phát âm các ký tự được ghi trên sách vở.',
    mnemonic: 'Dùng Lời nói (言) xướng lên từng dòng sách quý để Đọc sách (読).',
    strokeOrderTip: 'Viết bộ Ngôn bên trái gọn gàng, viết chữ Mại bên phải thẳng hàng.'
  },
  '書': {
    radicals: [
      { char: '聿', name: 'Duật', meaning: 'Tay cầm cây bút lông' },
      { char: '日', name: 'Nhật', meaning: 'Mặt trời chiếu sáng, trang giấy' }
    ],
    origin: 'Chữ Hội ý: Bàn tay cầm cây bút lông ghi chép chữ nghĩa lên trang giấy sáng.',
    mnemonic: 'Bàn tay cầm bút nắn nót từng nét mực dưới ánh mặt trời để Viết (書).',
    strokeOrderTip: 'Viết các nét ngang và sổ của cây bút bên trên, đóng lại bằng chữ Nhật bên dưới.'
  },
  '話': {
    radicals: [
      { char: '言', name: 'Ngôn', meaning: 'Lời nói' },
      { char: '舌', name: 'Thiệt', meaning: 'Cái lưỡi' }
    ],
    origin: 'Chữ Hội ý: Dùng cái lưỡi linh hoạt phát ra lời nói tâm tình.',
    mnemonic: 'Cái Lưỡi (舌) phát ra Lời nói (言) chân thành để Trò chuyện và Đàm thoại (話).',
    strokeOrderTip: 'Bộ Ngôn bên trái viết trước, chữ Thiệt bên phải viết sau.'
  },
  '安': {
    radicals: [
      { char: '宀', name: 'Miên', meaning: 'Mái nhà che chở' },
      { char: '女', name: 'Nữ', meaning: 'Người phụ nữ' }
    ],
    origin: 'Chữ Hội ý: Người phụ nữ yên ổn dưới mái ấm gia đình.',
    mnemonic: 'Người Phụ nữ (女) được ấm êm dưới Mái nhà (宀) thì gia đình Bình an và Yên tâm (安).',
    strokeOrderTip: 'Chấm trên nóc nhà, phẩy trái, gập phải móc nhẹ, sau đó viết chữ Nữ bên dưới.'
  },
  '学': {
    radicals: [
      { char: '冖', name: 'Mịch', meaning: 'Mái trường' },
      { char: '子', name: 'Tử', meaning: 'Đứa trẻ' }
    ],
    origin: 'Chữ Hội ý: Đứa trẻ ngồi chăm chú học tập dưới mái trường thân thương.',
    mnemonic: 'Đứa Trẻ (子) chăm chỉ ngồi dưới Mái trường tích lũy tri thức để Học tập (学).',
    strokeOrderTip: 'Ba chấm trên đầu đối xứng, nét bao mịch ngang gập, chữ Tử bên dưới.'
  },
  '校': {
    radicals: [
      { char: '木', name: 'Mộc', meaning: 'Cột gỗ' },
      { char: '交', name: 'Giao', meaning: 'Giao lưu kết bạn' }
    ],
    origin: 'Chữ Hội ý: Ngôi nhà dựng bằng cột gỗ nơi mọi người đến giao lưu học hỏi.',
    mnemonic: 'Ngôi nhà gỗ (木) nơi bạn bè Giao lưu (交) học tập chính là Trường học (校).',
    strokeOrderTip: 'Bộ Mộc bên trái thon gọn, chữ Giao bên phải cân đối.'
  },
  '先': {
    radicals: [
      { char: '儿', name: 'Nhi', meaning: 'Đôi chân bước đi' }
    ],
    origin: 'Chữ Hội ý: Đôi chân bước đi trước dẫn đường cho người phía sau.',
    mnemonic: 'Người đi Trước (先) dẫn đường chỉ lối cho lớp người đi sau thành công.',
    strokeOrderTip: 'Phẩy ngắn trên, nét ngang ngắn, nét sổ dọc, nét ngang dài, phẩy cong và móc cong.'
  },
  '生': {
    radicals: [{ char: '生', name: 'Sinh', meaning: 'Chồi non mọc lên' }],
    origin: 'Chữ Tượng hình: Mầm cây xanh tươi tốt đâm chồi nảy lộc từ lòng đất.',
    mnemonic: 'Chồi non Sinh sôi (生) nảy lộc mang lại sức sống mãnh liệt cho vạn vật.',
    strokeOrderTip: 'Phẩy xéo trên trái, hai nét ngang song song, nét sổ xuyên qua và nét ngang đáy dài.'
  }
};

// Hàm lấy thông tin mẹo nhớ chiết tự linh hoạt cho bất kỳ Kanji nào
export function getKanjiMnemonicInfo(kanjiChar, hanViet = '', meaning = '') {
  if (KANJI_MNEMONICS[kanjiChar]) {
    return KANJI_MNEMONICS[kanjiChar];
  }

  // Nếu chưa có trong từ điển mẫu, sinh mẹo nhớ thông minh dựa trên nghĩa và Hán Việt
  return {
    radicals: [
      { char: kanjiChar, name: hanViet || 'Hán tự', meaning: meaning || 'Chữ Hán' }
    ],
    origin: 'Chữ Hán chuẩn theo hệ thống chữ tượng hình Đông Á.',
    mnemonic: `Hán tự [${kanjiChar}] có âm Hán Việt là [${hanViet}], mang ý nghĩa "${meaning}". Hãy liên tưởng chữ với hình ảnh thực tế để ghi nhớ sâu sắc!`,
    strokeOrderTip: 'Quy tắc bút thuận: Từ trên xuống dưới, từ trái qua phải, ngang trước sổ sau, bao ngoài trước đóng đáy sau.'
  };
}

// Bảng màu gradient sang trọng cho từng chủ đề (100% Tailwind CSS)
export const TOPIC_STYLES = {
  numbers: {
    bgLight: 'bg-rose-50/70',
    border: 'border-rose-200',
    text: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-800',
    progress: 'bg-rose-500'
  },
  time: {
    bgLight: 'bg-amber-50/70',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800',
    progress: 'bg-amber-500'
  },
  people: {
    bgLight: 'bg-emerald-50/70',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800',
    progress: 'bg-emerald-500'
  },
  nature: {
    bgLight: 'bg-sky-50/70',
    border: 'border-sky-200',
    text: 'text-sky-700',
    badge: 'bg-sky-100 text-sky-800',
    progress: 'bg-sky-500'
  },
  actions: {
    bgLight: 'bg-violet-50/70',
    border: 'border-violet-200',
    text: 'text-violet-700',
    badge: 'bg-violet-100 text-violet-800',
    progress: 'bg-violet-500'
  },
  places: {
    bgLight: 'bg-pink-50/70',
    border: 'border-pink-200',
    text: 'text-pink-700',
    badge: 'bg-pink-100 text-pink-800',
    progress: 'bg-pink-500'
  },
  qualities: {
    bgLight: 'bg-indigo-50/70',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    badge: 'bg-indigo-100 text-indigo-800',
    progress: 'bg-indigo-500'
  }
};
