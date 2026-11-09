'use strict';
/* 介面語言：English / 中文。程式裡的文字以中文撰寫，選英文時在畫面上即時換成英文。 */
const I18N = (() => {
  let lang = 'zh';
  const D = {
    // 導覽與分頁
    '畫廊': 'Gallery', '拍照': 'Camera', '我的美感': 'My Taste', '主要導覽': 'Main navigation',
    '地點': 'Places', '作品': 'Works', '時間軸': 'Timeline', '足跡': 'Footprints', '足跡地圖': 'Footprints map',
    '我的畫廊': 'My Gallery', '返回': 'Back', '設定': 'Settings', '關閉': 'Close', '取消': 'Cancel', '確定': 'OK', '刪除': 'Delete',
    '修改': 'Edit', '存': 'Save', '存下來': 'Save', '送出': 'Send', '好了': 'Done', '下一步': 'Next', '上一步': 'Back', '開始': 'Start', '開始使用': 'Start',
    '修改名字': 'Edit name', '你的名字': 'Your name', '例如：Ruby': 'e.g. Ruby', '會顯示成「名字的畫廊」': 'Shown as "Name\'s Gallery"',
    // 首頁
    '你的畫廊還是空的': 'Your gallery is empty',
    '在美術館、或在路上看到喜歡的東西，打開相機拍下來就好。今天的畫廊會自己慢慢長出來。': 'When you see something you love, in a museum or on the street, just take a photo. Your gallery will grow on its own.',
    '打開相機': 'Open camera', '匯入以前的照片': 'Import past photos', '只看最喜歡': 'Favorites only', '最喜歡的作品': 'Favorite works',
    '城市散步': 'City walk', '美術館': 'Museum', '回到相機，繼續記錄': 'Back to the camera to keep going',
    '可以先去看別的；關掉 app 也不會遺失，下次打開會接著辨識。': 'Feel free to look around. Nothing is lost if you close the app; it continues next time.',
    '這是舊版在 iPhone 上存檔的問題，新版已經修好。手機相簿裡的原圖都還在，可以重新匯入。': 'This was a saving issue in an earlier version and is now fixed. The originals are still in your Photos, so you can import them again.',
    '清除遺失的照片': 'Remove missing photos', '再試一次': 'Try again', '待辨識': 'Waiting', '辨識中…': 'Recognizing…', '辨識中': 'Recognizing',
    '辨識中的作品': 'Recognizing…', '未命名作品': 'Untitled', '某個地方': 'Somewhere', '待辨識的作品': 'Not recognized yet', '新的作品': 'New work', '作者不明': 'Unknown artist', '複製品': 'Reproduction', 'AI 推測': 'AI guess',
    // 地點頁
    '地點名稱': 'Place name', '名稱不對？修改': 'Wrong name? Edit', '次': 'visits', '件作品': 'works', '張照片': 'photos',
    '紀錄・最近的在上面': 'Visits · newest first',
    '這些是 AI 自動整理的。覺得哪張放錯了，點進作品，按「這張放錯了？」就能調整。': 'AI sorted these for you. If a photo is in the wrong place, open the work and tap "Organize this photo".',
    // 作品頁
    '加入最喜歡': 'Add to favorites', '已加入最喜歡，點一下取消': 'In favorites. Tap to remove', '放大看照片': 'View full screen',
    '整理這張照片': 'Organize this photo', '刪除這張': 'Delete this photo', '這張還沒辨識': 'Not recognized yet', '正在辨識…': 'Recognizing…', '馬上就好。': 'Almost done.',
    '照片已經存好，正在排隊等待辨識。': 'The photo is saved and waiting in line.', '現在辨識': 'Recognize now',
    '複製品・不算進美感 DNA': 'Reproduction · not counted in your taste profile', '路上的小美好': 'Street find',
    '作品名稱或藝術家不對？修改': 'Wrong title or artist? Edit', '作品名稱（中文）': 'Title', '作品原文或英文名稱': 'Original title',
    '藝術家（中文）': 'Artist', '藝術家原文或英文名字': 'Artist (original name)', '年代': 'Date', '媒材': 'Medium',
    '存下來後，可以按「依新資料重寫解說」讓 AI 重新整理。': 'After saving, tap "Rewrite with new info" to let the AI update the notes.',
    '這件是 AI 的推測': 'This is the AI\'s best guess', 'AI 不太確定作品身分。補拍一張說明牌，或直接修改名稱都可以。': 'The AI is not sure what this is. Add a photo of the wall label, or edit the title yourself.',
    '作品解說': 'About this work', '關於它': 'About it', '看完整解說': 'Read more', '收起': 'Show less', '依新資料重寫解說': 'Rewrite with new info', '整理中…': 'Working…', '整理中': 'Working',
    '留心看這裡': 'Look closely', '看看觀賞重點': 'What to look for',
    '用色': 'Color', '線條': 'Line', '構圖': 'Composition', '光線': 'Light', '筆觸': 'Brushwork', '細節': 'Detail', '材質': 'Material', '象徵': 'Symbolism', '歷史背景': 'History', '畫家心境': 'Artist\'s mind',
    '藝術家視覺 DNA': 'Artist\'s visual DNA', '核心': 'Essence', '色彩': 'Color', '特徵': 'Traits', 'AI 歸納・同一位藝術家只產生一次': 'AI summary · made once per artist',
    '我的感想': 'My thoughts', '還沒有留下感想。想起什麼的時候，寫一句或錄一段都好。': 'No thoughts yet. Whenever something comes to mind, write a line or record a few words.',
    '語音感想': 'Voice note', '文字感想': 'Note', '・已修改': ' · edited', '修改感想': 'Edit note', '想留下什麼？': 'What would you like to remember?', '寫一句就好': 'Just a line is enough',
    '錄音中…': 'Recording…', '錄音中': 'Recording', '結束': 'Finish', '補照片': 'Photos', '寫感想': 'Write', '錄音': 'Voice', '轉成文字中…': 'Transcribing…',
    '點右上角的愛心標成「最喜歡」，你的美感 DNA 會更準。': 'Tap the heart to mark favorites. Your taste profile gets more accurate.', '刪除這件作品': 'Delete this work',
    '移到另一件作品（拍到別的作品了）': 'Move to another work', '改照片類型（作品、細節、說明牌⋯）': 'Change photo type (artwork, detail, label…)',
    '獨立成新的一件作品': 'Make it a separate work', '設成這件作品的第一張（代表照片）': 'Use as the first photo of this work', '設成這個地點的封面': 'Use as the cover of this place', '刪除這張照片': 'Delete this photo',
    '這張照片是：': 'This photo is:', '要移到哪一件作品？': 'Move to which work?', '（同一個地點）': '(same place)',
    '這個地點沒有其他作品。可以改用「獨立成新的一件作品」。': 'There are no other works here. Try "Make it a separate work".',
    '上一張': 'Previous', '下一張': 'Next', '照片檔案遺失': 'Photo missing', '可從相簿重新補上': 'Add it again from Photos',
    // 照片類型
    'type:作品': 'Artwork', 'type:細節': 'Detail', 'type:我與作品': 'Me with it', 'type:說明牌': 'Label', 'type:館外照': 'Exterior', 'type:複製品': 'Reproduction',
    // 相機
    '拍下第一張，': 'Take your first photo,', 'AI 會判斷你在哪裡': 'the AI will figure out where you are', '你在': 'You are at',
    '已存成這個地點的封面照片。': 'Saved as the cover of this place.', '完整解說': 'Full notes', '說感想': 'Voice note', '這不對': 'Not right', '繼續看展': 'Keep exploring',
    '第一次見到': 'First time', '再按一次麥克風就結束': 'Tap the mic again to stop', '今天的作品': 'Today\'s works', '從相簿選': 'Choose from Photos', '錄下感想': 'Record a note', '結束錄音': 'Stop recording',
    '拍照後會自動辨識、自動收進今天的畫廊': 'Photos are recognized and added to today\'s gallery automatically', '；麥克風會把感想存到最新的作品': '. The mic saves a note to your latest work',
    '關閉相機': 'Close camera', '（辨識會在背景繼續）': ' (recognition continues)', '改用 iPhone 內建相機拍（畫質較高）': 'Use the iPhone camera instead (higher quality)',
    '照片已經存好，可以繼續拍或關閉相機': 'Saved. Keep shooting or close the camera', '已存好，等待辨識': 'Saved, waiting',
    '沒有相機權限。可以到 iPhone「設定 › Safari › 相機」改成「允許」；或直接按中間的按鈕，用 iPhone 相機拍。': 'No camera access. Allow it in iPhone Settings › Safari › Camera, or tap the middle button to use the iPhone camera.',
    '鏡頭暫時打不開，按中間的按鈕會改用 iPhone 相機拍。': 'The camera could not start. Tap the middle button to use the iPhone camera.',
    '這個瀏覽器無法在 app 裡開鏡頭，按中間的按鈕會改用 iPhone 相機。': 'This browser cannot show the camera here. Tap the middle button to use the iPhone camera.',
    '今天還沒有拍照。': 'No photos yet today.', '回家想補可以補，不補也沒關係，今天的畫廊已經在這裡了。': 'Add more at home if you like. Today\'s gallery is already here.', '回到畫廊': 'Back to gallery',
    '分鐘': 'minutes', '段感想': 'notes',
    // 足跡
    '地圖資料 © OpenStreetMap 貢獻者': 'Map data © OpenStreetMap contributors', '拍照時允許「使用位置」，去過的地方就會出現在地圖上。': 'Allow location when taking photos, and the places you visit will appear on the map.',
    '地圖需要網路才能顯示。': 'The map needs an internet connection.',
    // 我的美感
    '我的美感 DNA': 'My Taste DNA', '上傳照片': 'Upload photo', '從收藏挑': 'Pick from gallery', '選一張「我與作品」當大頭照': 'Pick a "me with it" photo as your picture',
    '照片只存在你的手機裡。': 'Photos stay on your phone.', '請策展人整理我的美感': 'Ask the curator to read my taste', '策展人正在看你的收藏…': 'The curator is looking at your collection…',
    '換一個說法': 'Say it another way', '策展人筆記': 'Curator\'s note', '你的美感輪廓': 'Your taste profile', '覺得哪裡不太像你？告訴策展人': 'Not quite you? Tell the curator',
    '用一句話說說看哪裡不像你': 'In one line, what does not feel like you?', '例如：我其實也很喜歡明亮的畫': 'e.g. I actually love bright paintings',
    '你常收藏的題材': 'Subjects you collect', '你收藏裡最像你的藝術家': 'Artists most like you', '策展人推薦': 'Curator\'s picks', '為什麼推薦：': 'Why: ',
    '你可能也會喜歡，': 'You may also love', '但還沒認識的藝術家': 'artists you have not met yet', '讓你意外的收藏': 'A surprise in your collection',
    '在作品頁點「最喜歡」，策展人會更了解你。': 'Mark favorites on a work page and the curator will know you better.', '存成 3 張圖片分享': 'Share as 3 images', '分享這件作品': 'Share this work',
    '色彩明度': 'Brightness', '色彩溫度': 'Warmth', '形體': 'Form', '情緒': 'Mood', '裝飾性': 'Ornament',
    '人物': 'People', '自然': 'Nature', '神話與宗教': 'Myth & religion', '日常生活': 'Everyday life', '城市': 'City', '建築': 'Architecture', '裝飾與工藝': 'Craft & ornament', '動物': 'Animals',
    // 設定
    '解說用的 AI': 'AI for notes', '選擇 AI': 'Choose AI', '（推薦）': ' (recommended)', '（會開新視窗）': ' (opens a new window)', '貼上你的金鑰': 'Paste your key', '測試並儲存': 'Test and save', '測試中…': 'Testing…',
    '請先貼上金鑰。': 'Please paste your key first.', '成功！金鑰可以使用，已經存好了。': 'It works! Your key is saved.',
    '自動備援': 'Automatic backup', '兩把以上的金鑰都設定好，主要的 AI 忙碌、太慢或連不上時，會自動改用另一個，不用自己切換。': 'With two or more keys set up, My Gallery switches automatically when the main AI is busy, slow or unreachable.',
    '想加備用的 AI：點上面的名稱切換過去，貼上金鑰測試後，再點回你想當主要的那個。': 'To add a backup: tap its name above, paste and test the key, then tap your main AI again.',
    '主要': 'main', '備用': 'backup', '未設定': 'not set', '進階：模型名稱': 'Advanced: model name', '模型（看不懂可以不用改）': 'model (fine to leave as is)',
    '解說長度': 'Note length', '簡短': 'Short', '深入': 'In depth', '備份': 'Backup',
    '照片和資料只存在這支手機的瀏覽器裡。換手機或清除 Safari 資料前，記得先匯出備份。建議每天看完展匯出一次。': 'Your photos and data live only in this phone\'s browser. Export a backup before changing phones or clearing Safari data. Once a day after a visit is a good habit.',
    '匯出備份': 'Export backup', '匯入備份': 'Import backup', '匯出中…': 'Exporting…', '加到主畫面': 'Add to Home Screen',
    'iPhone：用 Safari 打開，按下方的「分享」，選「加入主畫面」。Android：Chrome 選單裡選「安裝應用程式」。': 'iPhone: open in Safari, tap Share, then "Add to Home Screen". Android: in the Chrome menu, choose "Install app".',
    '隱私': 'Privacy', '照片和資料都存在你的手機裡，這個 app 沒有伺服器。只有在辨識照片、轉錄語音、整理美感 DNA 時，才會把需要的內容直接送給你選的 AI。地點名稱會向 OpenStreetMap 查詢。': 'Everything stays on your phone; this app has no server. Only when recognizing photos, transcribing voice notes or reading your taste is the needed content sent directly to the AI you chose. Place names are looked up on OpenStreetMap.',
    '我的色彩・從你拍的照片計算': 'My colors · from your photos', '拍照': 'Camera', '從相簿選照片': 'Choose from Photos', '上傳大頭照': 'Upload profile photo',
    '版本': 'Version', '目前版本': 'Version', '檢查更新': 'Check for updates', '清除這支手機上的所有資料': 'Erase all data on this phone', '語言': 'Language',
    // 提示訊息
    '已儲存。': 'Saved.', '已更新。': 'Updated.', '已刪除。': 'Deleted.', '感想已存下來。': 'Note saved.', '感想已更新。': 'Note updated.', '整理好了。': 'Done.', '已設成封面。': 'Set as cover.',
    '已設成第一張，列表上也會用這張當代表。': 'Now the first photo, and used as the thumbnail.', '排進辨識佇列了。': 'Added to the queue.', '清除好了。': 'Removed.', '匯入完成。': 'Import complete.',
    '正在檢查更新…': 'Checking for updates…', '目前沒有網路，連上網路後再檢查更新。': 'You are offline. Try again when connected.', '正在做分享圖…': 'Making your images…',
    '謝謝你，策展人下次整理時會參考這段話。': 'Thank you. The curator will keep this in mind next time.',
    '照片已補進這件作品，類型可以在「整理這張照片」裡修改。': 'Photos added. You can change their type under "Organize this photo".',
    '收到照片，正在背景辨識。': 'Got it. Recognizing in the background.', '這件作品只有這一張照片了。': 'This is the only photo of this work.',
    '先拍一件作品，感想會存到那件作品裡。': 'Take a photo of a work first; your note will be saved to it.', '這個瀏覽器不支援錄音，可以改用寫的。': 'This browser cannot record. Try writing instead.',
    '需要允許使用麥克風才能錄音。': 'Please allow the microphone to record.', '還沒設定 AI 金鑰，照片都先存起來了。到設定貼上金鑰就會開始辨識。': 'No AI key yet. Your photos are saved; add a key in Settings to start recognizing.',
    '要刪除這則感想嗎？': 'Delete this note?', '要刪除這段語音感想嗎？錄音和文字都會一起刪除。': 'Delete this voice note? The recording and text will both be removed.',
    '要刪除這張照片嗎？手機相簿裡的原圖不受影響。': 'Delete this photo? The original in your Photos is not affected.',
    '這是這件作品唯一的照片，刪除後整件作品也會移除。手機相簿裡的原圖不受影響。': 'This is the only photo of this work, so the work will be removed too. The original in your Photos is not affected.',
    '確定要清除這支手機上的所有作品、照片和設定嗎？這個動作無法復原，建議先匯出備份。': 'Erase all works, photos and settings on this phone? This cannot be undone. Export a backup first.',
    '這不是 My Gallery 的備份檔': 'This is not a My Gallery backup file', '這個瀏覽器無法儲存資料（可能是無痕模式）。請用一般模式的 Safari 或 Chrome 打開。': 'This browser cannot save data (private mode?). Please open it in normal Safari or Chrome.',
    // AI 錯誤訊息（ai.js）
    '還沒有設定 AI 金鑰': 'No AI key yet', '目前沒有網路': 'You are offline', '語音轉文字需要 Gemini 金鑰': 'Voice transcription needs a Gemini key',
    '金鑰好像不正確，請到設定重新貼一次。': 'The key looks wrong. Please paste it again in Settings.', '金鑰無法使用（可能貼錯，或還沒開通）。請到設定檢查。': 'The key does not work (maybe mistyped or not activated). Please check Settings.',
    '找不到這個 AI 模型，可以到設定的「進階」換一個模型名稱。': 'Model not found. You can change it under Settings › Advanced.', 'AI 使用次數暫時用完了（免費額度有上限），稍後會再自動試一次。': 'The AI usage limit is reached for now. It will retry later.',
    'AI 服務暫時忙碌，稍後會再自動試一次。': 'The AI is busy. It will retry later.', 'AI 回應太久，先跳過這張，稍後會再自動試一次。': 'The AI took too long. Skipping for now; it will retry later.',
    '連不上 AI 服務（Load failed）。請確認網路正常；如果一直出現，可以到設定改用其他 AI。': 'Cannot reach the AI service. Check your connection, or switch AI in Settings.',
    'Google 暫時不接受這種新格式的金鑰。請到 AI Studio 再建立一把新的金鑰試試看。': 'Google is not accepting this key format right now. Try creating a new key in AI Studio.',
    'AI 沒有回覆內容': 'The AI did not reply', 'AI 回覆的格式看不懂': 'Could not read the AI reply', '照片先存起來了。': ' Your photo is saved.'
  };
  const P = (n, one, many) => `${n} ${n == 1 ? one : many}`;
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAY = { '日': 'Sun', '一': 'Mon', '二': 'Tue', '三': 'Wed', '四': 'Thu', '五': 'Fri', '六': 'Sat' };
  // 有數字或名稱夾在中間的句子
  const R = [
    [/(\d{4})\.(\d{2})\.(\d{2})（(.)）/g, (m, y, mo, d, w) => `${DAY[w] || ''}, ${MON[+mo - 1]} ${+d}, ${y}`],
    [/正在辨識照片・還有 (\d+) 張/g, (m, n) => `Recognizing photos · ${n} left`],
    [/(辨識中|已存好，等待辨識)・還有 (\d+) 張/g, (m, a, n) => `${a === '辨識中' ? 'Recognizing' : 'Saved, waiting'} · ${n} left`],
    [/有 (\d+) 張照片還沒辨識，照片都已經存好了。/g, (m, n) => `${P(n, 'photo is', 'photos are')} not recognized yet. They are all saved.`],
    [/有 (\d+) 張照片的檔案遺失了/g, (m, n) => `${P(n, 'photo is', 'photos are')} missing`],
    [/收到 (\d+) 張照片，正在背景辨識。可以先去看別的，關掉 app 也不會遺失。/g, (m, n) => `Got ${P(n, 'photo', 'photos')}. Recognizing in the background; feel free to close the app.`],
    [/全部 (\d+) 件・最近的在上面/g, (m, n) => `All ${P(n, 'work', 'works')} · newest first`],
    [/去過 (\d+) 次/g, (m, n) => `visited ${P(n, 'time', 'times')}`],
    [/見過 (\d+) 次/g, (m, n) => `Seen ${P(n, 'time', 'times')}`],
    [/第 (\d+) 次見到/g, (m, n) => `Seen ${n} times`],
    [/AI 歸納・依 (\d+) 件作品・會隨你的收藏慢慢改變/g, (m, n) => `AI summary · based on ${P(n, 'work', 'works')} · changes as you collect`],
    [/再收藏 (\d+) 件作品，就能看到你的美感 DNA/g, (m, n) => `Collect ${P(n, 'more work', 'more works')} to see your taste DNA`],
    [/目前有 (\d+) 件可以分析的作品。多拍幾件喜歡的作品，這一頁會慢慢長出你自己的樣子。/g, (m, n) => `You have ${P(n, 'work', 'works')} to read so far. Collect a few more you love and this page will slowly become yours.`],
    [/收藏增加了（現在 (\d+) 件），重新整理/g, (m, n) => `Your collection grew (${n} now). Refresh`],
    [/依 (\d+) 件作品整理/g, (m, n) => `Based on ${P(n, 'work', 'works')}`],
    [/看第 (\d+) 張：/g, (m, n) => `View photo ${n}: `],
    [/(\d+) \/ (\d+) 張/g, (m, a, b) => `${a} / ${b}`],
    [/已收在一起（(\d+) 張）・/g, (m, n) => `Grouped together (${P(n, 'photo', 'photos')}) · `],
    [/看(.+)的藝術家視覺 DNA/g, (m, a) => `${a}'s visual DNA`],
    [/今天在/g, () => 'Today at '],
    [/今天的畫廊已開始・(\d+) 件/g, (m, n) => `Today's gallery · ${P(n, 'work', 'works')}`],
    [/目前用了約 (\d+) MB・已設為不會被自動清除/g, (m, n) => `About ${n} MB used · protected from automatic clearing`],
    [/目前用了約 (\d+) MB・建議加到主畫面，比較不會被系統清除/g, (m, n) => `About ${n} MB used · add to Home Screen so it is not cleared`],
    [/（語音 (\d+) 秒，之後可以重新轉文字）/g, (m, n) => `(voice note, ${n}s)`], [/（語音 (\d+) 秒）/g, (m, n) => `(voice note, ${n}s)`],
    [/感想已存到《(.+)》/g, (m, t) => `Note saved to "${t}"`], [/已移到《(.+)》。原本那件沒有照片了，已自動移除。/g, (m, t) => `Moved to "${t}". The old work had no photos left and was removed.`],
    [/已移到《(.+)》。/g, (m, t) => `Moved to "${t}".`], [/已改成「(.+)」。/g, (m, t) => `Changed to "${L('type:' + t)}".`],
    [/確定刪除《(.+)》和它的 (\d+) 張照片嗎？（手機相簿裡的原圖不受影響）/g, (m, t, n) => `Delete "${t}" and its ${P(n, 'photo', 'photos')}? The originals in your Photos are not affected.`],
    [/要清除 (\d+) 張遺失檔案的照片嗎？只剩這些照片的作品也會一起移除。手機相簿裡的原圖不受影響。/g, (m, n) => `Remove ${P(n, 'missing photo', 'missing photos')}? Works with only these photos are removed too.`],
    [/要匯入 (\d+) 件作品、(\d+) 張照片嗎？相同的資料會被覆蓋，其他資料會保留。/g, (m, a, b) => `Import ${P(a, 'work', 'works')} and ${P(b, 'photo', 'photos')}? Matching items are replaced; everything else stays.`],
    [/目前在《(.+)》・/g, (m, t) => `Now in "${t}" · `],
    [/(.+) 金鑰（(.+)）/g, (m, a, b) => `${a} key (${b.replace('或', 'or').replace(/開頭/g, '')})`],
    [/匯入失敗：/g, () => 'Import failed: '], [/匯出失敗：/g, () => 'Export failed: '], [/這張照片打不開：/g, () => 'Could not open this photo: '],
    [/（代碼 (\d+)・?/g, (m, n) => `(code ${n} `],
    [/^(.+) 的畫廊$/g, (m, n) => `${n}'s Gallery`], [/^(.+)的美感 DNA$/g, (m, n) => `${n}'s Taste DNA`],
    [/(.+)：(主要|備用|未設定)/g, (m, a, b) => `${a}: ${D[b]}`],
    [/（推薦）/g, () => ' (recommended)'], [/ 模型（看不懂可以不用改）/g, () => ' model (fine to leave as is)'], [/目前版本 /g, () => 'Version '],
    [/(\d+) 座城市・(\d+) 個地點/g, (m, a, b) => `${P(a, 'city', 'cities')} · ${P(b, 'place', 'places')}`],
    [/(\d+) 件作品・(\d+) 個地點/g, (m, a, b) => `${P(a, 'work', 'works')} · ${P(b, 'place', 'places')}`],
    [/(\d+) 件作品/g, (m, n) => P(n, 'work', 'works')], [/(\d+) 張照片/g, (m, n) => P(n, 'photo', 'photos')],
    [/(\d+) 個地點/g, (m, n) => P(n, 'place', 'places')], [/(\d+) 張/g, (m, n) => P(n, 'photo', 'photos')], [/(\d+) 件/g, (m, n) => P(n, 'work', 'works')],
    [/(\d+) 筆/g, (m, n) => P(n, 'note', 'notes')],
    [/文字感想/g, () => 'Note'], [/語音感想/g, () => 'Voice note'], [/街頭/g, () => ' Streets'], [/未命名作品/g, () => 'Untitled'], [/作者不明/g, () => 'Unknown artist'], [/待辨識/g, () => 'Not recognized yet'], [/・最喜歡/g, () => ' · favorite'], [/・/g, () => ' · '],
    [/AI 解說 · /g, () => 'AI notes · '], [/ · 已用你拍的說明牌校正/g, () => ' · checked against your label photo'], [/作品 ·/g, () => 'Artwork ·']
  ];
  function L(s) { if (lang === 'zh') return String(s).replace(/^type:/, ''); return D[s] ?? String(s).replace(/^type:/, ''); }
  function tr(s) {
    if (lang === 'zh' || !s || !/[　-鿿＀-￯]/.test(s)) return s;
    const t = s.trim(); if (D[t] !== undefined) return s.replace(t, D[t]);
    let out = s; for (const [re, fn] of R) out = out.replace(re, fn);
    return out;
  }
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT']);
  function dom(root) {
    if (lang === 'zh' || !root) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => (n.parentElement && (SKIP.has(n.parentElement.tagName) || n.parentElement.closest('.usr'))) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(n => { const v = tr(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; });
    (root.querySelectorAll ? root.querySelectorAll('[aria-label],[placeholder],[alt],[title]') : []).forEach(el => {
      if (el.closest('.usr')) return;
      for (const a of ['aria-label', 'placeholder', 'alt', 'title']) { const v = el.getAttribute(a); if (v) { const t2 = tr(v); if (t2 !== v) el.setAttribute(a, t2); } }
    });
  }
  let obs = null;
  function watch() {
    if (obs || !window.MutationObserver) return;
    obs = new MutationObserver(ms => { if (lang === 'zh') return; ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) dom(n); else if (n.nodeType === 3 && n.parentElement && !SKIP.has(n.parentElement.tagName) && !n.parentElement.closest('.usr')) { const v = tr(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; } })); });
    obs.observe(document.body, { childList: true, subtree: true });
  }
  return {
    get lang() { return lang; },
    set(l) { lang = l === 'en' ? 'en' : 'zh'; document.documentElement.lang = lang === 'en' ? 'en' : 'zh-Hant'; },
    L, tr, dom, watch,
    tt: (en, zh) => (lang === 'en' ? en : zh)
  };
})();
const L = I18N.L, tt = I18N.tt;
