document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const mainContent = document.getElementById('main-content');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const stageIndicator = document.getElementById('stage-indicator');

    // --- Game State ---
    let currentStageIndex = 0;
    const stages = []; // This will be populated with stage objects

    // --- Navigation Functions ---
    function showStage(index) {
        // ★★★ここから追加★★★
        // Update background and timeline based on the new stage index
        updateEraVisuals(index);
        // ★★★ここまで追加★★★

        if (index < 0 || index >= stages.length) return;
        currentStageIndex = index;
        const stageData = stages[index];

        // Create and display the stage's HTML content
        mainContent.innerHTML = ''; // Clear previous stage
        const stageElement = document.createElement('section');
        stageElement.id = stageData.id;
        stageElement.className = 'stage';
        stageElement.innerHTML = stageData.content;
        mainContent.appendChild(stageElement);
        
        // Update navigation footer
        stageIndicator.textContent = `${index + 1} / ${stages.length} : ${stageData.title}`;
        prevBtn.disabled = index === 0;
        nextBtn.disabled = !stageData.isComplete();

        // Run stage-specific initialization logic
        if (stageData.init) {
            stageData.init();
        }
    }

    prevBtn.addEventListener('click', () => showStage(currentStageIndex - 1));
    nextBtn.addEventListener('click', () => {
        if (currentStageIndex < stages.length - 1) {
            showStage(currentStageIndex + 1);
        }
    });

    function markStageComplete(index) {
        if (index === currentStageIndex) {
            stages[index].completed = true;
            nextBtn.disabled = false;
        }
    }

    // --- Stage Definitions ---

    // Stage 0: Prologue
    stages.push({
        id: 'prologue',
        title: 'プロローグ：発見',
        completed: true,
        isComplete: () => true,
        content: `
            <h2>プロローグ：発見</h2>
            <p>古代の賢者が、夜空に発見した周期的な現象について語る。<br>「この重大な発見を、決して途絶えさせることなく、未来の世代へ正確に伝えなければならない」</p>
            <p class="mission-text">ミッション：賢者の言葉を心に刻み、旅を始めよう。</p>
            <p class="important-info">「76年ごとに、第七の月の空に、尾を引く炎の星が現れる」</p>
        `
    });

    // Stage 1: Oral Tradition
    stages.push({
        id: 'stage1',
        title: 'ステージ1: 口承の時代',
        completed: false,
        isComplete: () => stages[1].completed,
        content: `
            <h2>ステージ1: 口承の時代</h2>
            <p class="mission-text">ミッション: 師である賢者から聞いた観測記録を、弟子に口頭で正確に伝える。</p>
            <div class="quiz-options">
                <div><p>周期は？</p><button data-key="p" data-val="76">76年</button> <button data-key="p" data-val="67">67年</button> <button data-key="p" data-val="86">86年</button></div>
                <div><p>いつ？</p><button data-key="m" data-val="7">第七の月</button> <button data-key="m" data-val="6">第六の月</button> <button data-key="m" data-val="8">第八の月</button></div>
                <div><p>何が？</p><button data-key="o" data-val="炎の星">炎の星</button> <button data-key="o" data-val="燃える石">燃える石</button> <button data-key="o" data-val="空の裂け目">空の裂け目</button></div>
            </div>
            <p class="result-text" id="s1-result"></p>
        `,
        init: () => {
            const answers = {};
            const buttons = document.querySelectorAll('#stage1 .quiz-options button');
            buttons.forEach(btn => btn.addEventListener('click', () => {
                // Prevent multiple clicks after completion
                if (Object.keys(answers).length === 3) return;

                const { key, val } = btn.dataset;
                answers[key] = val;
                btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');

                if (Object.keys(answers).length === 3) {
                    const correct = { p: '76', m: '7', o: '炎の星' };
                    let score = 0;
                    buttons.forEach(b => {
                        if (b.classList.contains('selected')) {
                            if(b.dataset.val === correct[b.dataset.key]) { b.classList.add('correct'); score++; } 
                            else { b.classList.add('incorrect'); }
                        }
                        b.disabled = true;
                    });
                    const resultText = document.getElementById('s1-result');
                    if(score === 3) {
                        resultText.textContent = '完璧だ！正確に記憶していた。';
                        resultText.className = 'result-text success';
                        markStageComplete(1);
                    } else {
                        resultText.textContent = `うーん、${3-score}箇所間違っている。口伝えでは情報が変わりやすい...`;
                        resultText.className = 'result-text fail';
                        markStageComplete(1); // 失敗でも先に進めるようにする
                    }
                }
            }));
        }
    });

    // Stage 1.5: Cave Painting
    stages.push({
        id: 'stage1-5',
        title: 'ステージ1.5: 洞窟壁画',
        completed: false,
        isComplete: () => stages[2].completed,
        content: `
            <h2>ステージ1.5: 記録のはじまり ― 洞窟壁画</h2>
            <p class="mission-text">ミッション: 星の動きを壁画に記録し、次世代に伝える。指定された3つの点を順にクリックして星座を描け。</p>
            <div id="cave-wall">
                <canvas id="constellation-canvas"></canvas>
                <div class="star-point" style="top: 20%; left: 30%;" data-order="1"></div>
                <div class="star-point" style="top: 50%; left: 50%;" data-order="2"></div>
                <div class="star-point" style="top: 30%; left: 70%;" data-order="3"></div>
            </div>
            <button class="action-btn" id="s1-5-reset">やり直す</button>
            <p class="result-text" id="s1-5-result"></p>
        `,
        init: () => {
            const starPoints = document.querySelectorAll('#stage1-5 .star-point');
            const resultText = document.getElementById('s1-5-result');
            const resetButton = document.getElementById('s1-5-reset');
            const canvas = document.getElementById('constellation-canvas');
            const caveWall = document.getElementById('cave-wall');
            
            canvas.width = caveWall.clientWidth;
            canvas.height = caveWall.clientHeight;
            const ctx = canvas.getContext('2d');
            
            let userClickOrder = [];
            let lastClickedPoint = null;
            let stageCompleted = false; // ステージが完了したかどうかを管理するフラグ

            const resetStage = () => {
                userClickOrder = [];
                lastClickedPoint = null;
                stageCompleted = false; // フラグをリセット
                
                starPoints.forEach(p => {
                    p.classList.remove('clicked');
                });
                
                ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvasをクリア
                resultText.textContent = '';
                resultText.className = 'result-text';
            };

            const handleStarClick = (e) => {
                // ステージ完了後は、フラグをチェックして処理を中断
                if (stageCompleted) return;

                const point = e.currentTarget;
                if (point.classList.contains('clicked')) return;

                point.classList.add('clicked');
                const order = parseInt(point.dataset.order, 10);
                userClickOrder.push(order);

                const currentPoint = {
                    x: point.offsetLeft + point.offsetWidth / 2,
                    y: point.offsetTop + point.offsetHeight / 2
                };

                if (lastClickedPoint) {
                    ctx.beginPath();
                    ctx.moveTo(lastClickedPoint.x, lastClickedPoint.y);
                    ctx.lineTo(currentPoint.x, currentPoint.y);
                    ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }
                lastClickedPoint = currentPoint;

                if (userClickOrder.length === starPoints.length) {
                    stageCompleted = true; // これ以上クリックできないようにフラグを立てる
                    const isCorrect = userClickOrder.every((val, index) => val === index + 1);
                    if (isCorrect) {
                        resultText.textContent = '成功！パターンは正しく記録された。';
                        resultText.className = 'result-text success';
                        markStageComplete(2);
                    } else {
                        resultText.textContent = '失敗...。順序が違うため、この記録は誤った意味で伝わってしまうだろう。';
                        resultText.className = 'result-text fail';
                        markStageComplete(2); // 失敗でも先に進める
                    }
                }
            };
            
            // イベントリスナーを一度だけ設定
            starPoints.forEach(point => point.addEventListener('click', handleStarClick));
            resetButton.addEventListener('click', resetStage);
            
            // 初期化時にリセット（見た目を整えるため）
            resetStage();
        }
    });

    // (ステージ1.5 の定義の後に追加)

    // Stage 2: Cuneiform (Clay Tablet)
    stages.push({
        id: 'stage2',
        title: 'ステージ2: 書記の時代',
        completed: false,
        isComplete: () => stages[3].completed,
        content: `
            <h2>ステージ2: 書記の時代（粘土板）</h2>
            <p class="mission-text">ミッション: 観測記録を楔形文字で粘土板に刻み込む。マウスを使って粘土板に何かを刻んでみよう。</p>
            <div class="clay-tablet-area">
                <canvas id="clay-tablet" width="400" height="200"></canvas>
            </div>
            <button class="action-btn" id="s2-complete">記録を終える</button>
            <p class="result-text" id="s2-result"></p>
        `,
        init: () => {
            const canvas = document.getElementById('clay-tablet');
            const completeBtn = document.getElementById('s2-complete');
            const resultText = document.getElementById('s2-result');
            const ctx = canvas.getContext('2d');
            
            // ペン（スタイラス）のスタイル設定
            ctx.strokeStyle = '#5c4033'; // 刻んだ跡の色
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            let drawing = false;
            let hasDrawn = false; // 少しでも描画したかをチェック

            // 描画開始
            const startDrawing = (e) => {
                drawing = true;
                draw(e); // クリックしただけでも点を描画するため
            };

            // 描画終了
            const stopDrawing = () => {
                drawing = false;
                ctx.beginPath(); // ペンを離す
            };

            // 描画処理
            const draw = (e) => {
                if (!drawing) return;
                hasDrawn = true;
                
                // Canvas要素の画面上の位置を考慮して座標を補正
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x, y);
            };
            
            // イベントリスナーを設定
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseout', stopDrawing); // Canvas外に出たら描画終了

            // 「記録を終える」ボタンの処理
            completeBtn.addEventListener('click', () => {
                if (hasDrawn) {
                    resultText.textContent = '成功！大変な労力だが、これで情報は半永久的に残るだろう。';
                    resultText.className = 'result-text success';
                    markStageComplete(3); // このステージのインデックスは3
                } else {
                    resultText.textContent = 'まだ何も記録されていないようだ。粘土板に何かを刻もう。';
                    resultText.className = 'result-text fail';
                }
            });
        }
    });

    // (ステージ2 の定義の後に追加)

    // Stage 2.5: Papyrus and Scrolls
    stages.push({
        id: 'stage2-5',
        title: 'ステージ2.5: パピルスと巻物',
        completed: false,
        isComplete: () => stages[4].completed,
        content: `
            <h2>ステージ2.5: パピルスと巻物の時代</h2>
            <p class="mission-text">ミッション: 巻物をスクロールし、湿度や虫食いで失われる情報の中から「76年の星」の記録を探せ。</p>
            <div id="papyrus-scroll">
                <p>...ナイルの氾濫は天の運行と連動する。偉大なる神々の意思の現れなり...</p>
                <p class="blurred">...第七の月、かの炎の星は確かに東の空に現れた。その姿はまるで...</p>
                <p>...太陽神ラーの舟は毎日東から西へと渡り、夜の世界を旅する...</p>
                <p>...この星の周期は <span class="eaten">正確に七十六年</span> ごとであると、賢者は計算した...</p>
                <p>...ファラオにこの天の吉兆を報告せねばなるまい...</p>
                <p>...書記官アメンホテプの記録、第3巻より。王の治世、第15年。</p>
            </div>
            <button class="action-btn" id="s2-5-complete">巻物を読み終えた</button>
            <p class="result-text" id="s2-5-result"></p>
        `,
        init: () => {
            const completeBtn = document.getElementById('s2-5-complete');
            const resultText = document.getElementById('s2-5-result');

            completeBtn.addEventListener('click', () => {
                resultText.textContent = '成功！しかし、記録の一部は湿気で滲み、最も重要な周期の部分は虫食いで失われている。記録媒体そのものが、未来への情報伝達を脅かすのだ。';
                resultText.className = 'result-text success';
                markStageComplete(4); // このステージのインデックスは4
            });
        }
    });

    // (ステージ2.5 の定義の後に追加)

    // Stage 3: Scriptorium (Library Search & Copy)
    stages.push({
        id: 'stage3',
        title: 'ステージ3: 書庫の時代',
        completed: false,
        isComplete: () => stages[5].completed,
        content: `
            <h2>ステージ3: 『書庫の時代：手写しと目録の迷宮』</h2>
            <p class="mission-text" id="s3-mission">ミッション(1/2): 巨大な書庫の中から「76年の星」に関する写本を探し出せ。</p>
            <div id="library-books">
                <button class="action-btn book-btn">農耕に関する書</button>
                <button class="action-btn book-btn">神学大全</button>
                <button class="action-btn book-btn">薬草の効能</button>
                <button class="action-btn book-btn" id="correct-book">賢者の天体記録</button>
                <button class="action-btn book-btn">王の年代記</button>
                <button class="action-btn book-btn">建築術の基礎</button>
            </div>

            <div id="copying-area" style="display:none;">
                <p><strong>発見！さあ、この内容を書き写すのだ...</strong></p>
                <p><em>「76年ごとに、第七の月の空に、尾を引く炎の星が現れる」</em></p>
                <textarea id="copying-textarea" placeholder="上記の内容を正確に書き写してください..."></textarea>
                <button class="action-btn" id="s3-copy-complete">複写完了</button>
            </div>

            <p class="result-text" id="s3-result"></p>
        `,
        init: () => {
            const stageIndex = 5; // このステージのインデックス
            const libraryBooks = document.getElementById('library-books');
            const correctBook = document.getElementById('correct-book');
            const copyingArea = document.getElementById('copying-area');
            const copyTextarea = document.getElementById('copying-textarea');
            const copyCompleteBtn = document.getElementById('s3-copy-complete');
            const resultText = document.getElementById('s3-result');
            const missionText = document.getElementById('s3-mission');
            
            // --- 探索パートのロジック ---
            libraryBooks.addEventListener('click', (e) => {
                if (e.target.tagName !== 'BUTTON') return;

                if (e.target === correctBook) {
                    resultText.textContent = '写本を発見した！';
                    resultText.className = 'result-text success';
                    libraryBooks.style.display = 'none'; // 書庫を隠す
                    copyingArea.style.display = 'block'; // 複写エリアを表示
                    missionText.innerHTML = 'ミッション(2/2): 見つけた写本の内容を、自分の手で書き写して持ち帰る。';
                } else {
                    resultText.textContent = `「${e.target.textContent}」を調べた...。これは違うようだ。`;
                    resultText.className = 'result-text fail';
                }
            });

            // --- 複写パートのロジック ---
            copyCompleteBtn.addEventListener('click', () => {
                // 完全一致ではなく、ある程度の長さが入力されていればOKとする
                if (copyTextarea.value.length > 20) {
                    resultText.innerHTML = '複写完了！これで情報を持ち帰れる。<br>しかし、人の手による複写は、たった一文字の間違いで全く違う意味になる危険を常にはらんでいる...。';
                    resultText.className = 'result-text success';
                    markStageComplete(stageIndex);
                } else {
                    resultText.textContent = '複写が不十分のようだ。もっと正確に書き写そう。';
                    resultText.className = 'result-text fail';
                }
            });
        }
    });

    // (ステージ3 の定義の後に追加)

    // Stage 3.5: Library of Alexandria
    stages.push({
        id: 'stage3-5',
        title: 'ステージ3.5: アレクサンドリアの図書館',
        completed: false,
        isComplete: () => stages[6].completed,
        content: `
            <h2>ステージ3.5: 知の集積地：アレクサンドリアの図書館</h2>
            <p class="mission-text" id="s3-5-mission">ミッション(1/3): 届いた巻物を内容で分類し、正しい棚に配置せよ。</p>
            
            <!-- Part 1: 分類パート -->
            <div id="classification-part">
                <p><strong>未分類の巻物:</strong></p>
                <div id="unclassified-scrolls">
                    <div class="scroll-item" draggable="true" id="scroll-astro" data-type="天文学">内容: 76年の星...</div>
                    <div class="scroll-item" draggable="true" id="scroll-math" data-type="数学">内容: 円周率の計算...</div>
                    <div class="scroll-item" draggable="true" id="scroll-philosophy" data-type="哲学">内容: 善とは何か...</div>
                </div>
                <div id="sorting-area">
                    <div class="category-bin" data-category="天文学"><h4>天文学の棚</h4></div>
                    <div class="category-bin" data-category="数学"><h4>数学の棚</h4></div>
                    <div class="category-bin" data-category="哲学"><h4>哲学の棚</h4></div>
                </div>
            </div>

            <!-- Part 2: 目録作成パート -->
            <div id="cataloging-area" style="display:none;">
                <p><strong>天文学の棚から「76年の星」の巻物が見つかった。後世の人が見つけやすいように、目録を作成せよ。</strong></p>
                <form id="catalog-form">
                    <label>巻物名:</label><input type="text" value="76年の星の記録" disabled>
                    <label>筆記者:</label><input type="text" id="author" placeholder="例: ヒッパルコス">
                    <label>材質:</label><input type="text" id="material" placeholder="例: パピルス">
                    <button type="button" class="action-btn" id="s3-5-catalog">目録を作成</button>
                </form>
            </div>

            <!-- Part 3: 火災イベント -->
            <div id="fire-event" style="display:none;">
                <h3>警告！図書館で火災が発生！</h3>
                <p>限られた時間内に、最も重要な巻物を運び出せ！</p>
                <div id="fire-timer">10</div>
                <div>
                    <button class="action-btn book-btn">ソクラテスの対話篇</button>
                    <button class="action-btn book-btn" id="save-correct-scroll">76年の星の記録</button>
                    <button class="action-btn book-btn">ユークリッド原論</button>
                </div>
            </div>

            <p class="result-text" id="s3-5-result"></p>
        `,
        init: () => {
            const stageIndex = 6;
            const missionText = document.getElementById('s3-5-mission');
            const resultText = document.getElementById('s3-5-result');

            // --- Part 1: 分類パート (Drag & Drop) ---
            const scrolls = document.querySelectorAll('.scroll-item');
            const bins = document.querySelectorAll('.category-bin');
            const classificationPart = document.getElementById('classification-part');
            let sortedCount = 0;

            scrolls.forEach(scroll => {
                scroll.addEventListener('dragstart', e => {
                    e.dataTransfer.setData('text/plain', e.target.id);
                });
            });

            bins.forEach(bin => {
                bin.addEventListener('dragover', e => {
                    e.preventDefault();
                    bin.classList.add('drag-over');
                });
                bin.addEventListener('dragleave', () => bin.classList.remove('drag-over'));
                bin.addEventListener('drop', e => {
                    e.preventDefault();
                    bin.classList.remove('drag-over');
                    const scrollId = e.dataTransfer.getData('text/plain');
                    const scroll = document.getElementById(scrollId);

                    if (scroll.dataset.type === bin.dataset.category) {
                        bin.appendChild(scroll);
                        scroll.draggable = false;
                        scroll.style.cursor = 'default';
                        sortedCount++;
                        resultText.textContent = `「${scroll.dataset.type}」の巻物を分類した。`;
                        resultText.className = 'result-text success';
                        // Check if all are sorted
                        if (sortedCount === scrolls.length) {
                            setTimeout(startCataloging, 1000);
                        }
                    } else {
                        resultText.textContent = '棚が違うようだ！';
                        resultText.className = 'result-text fail';
                    }
                });
            });

            // --- Part 2: 目録作成パート ---
            const catalogingArea = document.getElementById('cataloging-area');
            const catalogBtn = document.getElementById('s3-5-catalog');

            const startCataloging = () => {
                classificationPart.style.display = 'none';
                catalogingArea.style.display = 'block';
                missionText.textContent = 'ミッション(2/3): 後世のため、巻物の特徴を目録に残す。';
                resultText.textContent = '';
            };

            catalogBtn.addEventListener('click', () => {
                const author = document.getElementById('author').value;
                const material = document.getElementById('material').value;
                if (author && material) {
                    resultText.textContent = '目録作成完了！これでこの巻物は格段に見つけやすくなった。';
                    setTimeout(startFireEvent, 1500);
                } else {
                    resultText.textContent = '筆記者と材質の両方を入力しよう。';
                    resultText.className = 'result-text fail';
                }
            });

            // --- Part 3: 火災イベント ---
            const fireEvent = document.getElementById('fire-event');
            const fireTimer = document.getElementById('fire-timer');
            const saveCorrectScrollBtn = document.getElementById('save-correct-scroll');
            let timerId = null;

            const startFireEvent = () => {
                catalogingArea.style.display = 'none';
                fireEvent.style.display = 'block';
                fireEvent.classList.add('active');
                missionText.textContent = 'ミッション(3/3): 知識の損失を最小限に食い止めよ！';
                resultText.textContent = '';

                let timeLeft = 10;
                fireTimer.textContent = timeLeft;

                timerId = setInterval(() => {
                    timeLeft--;
                    fireTimer.textContent = timeLeft;
                    if (timeLeft <= 0) {
                        clearInterval(timerId);
                        resultText.textContent = '間に合わなかった... 多くの貴重な知識が灰になってしまった。知識の集中は大きなリスクを伴う...。';
                        resultText.className = 'result-text fail';
                        markStageComplete(stageIndex);
                    }
                }, 1000);
                
                fireEvent.querySelectorAll('button').forEach(btn => btn.onclick = (e) => {
                    clearInterval(timerId); // Stop the timer once a choice is made
                    if (e.target === saveCorrectScrollBtn) {
                        resultText.textContent = '成功！目録を作った重要な巻物を救い出せた。メタデータは、危機的状況で何を守るべきかの判断基準にもなるのだ。';
                        resultText.className = 'result-text success';
                    } else {
                        resultText.textContent = `「${e.target.textContent}」を確保したが、最も重要な天体記録は失われてしまった...。`;
                        resultText.className = 'result-text fail';
                    }
                    markStageComplete(stageIndex);
                });
            };
        }
    });
    
    // (ステージ3.5 の定義の後に追加)

    // Stage X: Information Dark Ages
    stages.push({
        id: 'stageX',
        title: 'ステージX: 情報の暗黒時代',
        completed: false,
        isComplete: () => stages[7].completed,
        content: `
            <h2>ステージX: 情報の暗黒時代（中世ヨーロッパ）</h2>
            <p class="mission-text">ミッション: 異端とされる天文観測記録「76」を、錬金術の記号を使った暗号に変換して伝承せよ。</p>
            
            <p><strong>危険な記録:</strong> この数字を直接記録してはならない！</p>
            <div id="heretical-data">76</div>
            
            <p><strong>錬金術の暗号表:</strong></p>
            <table id="cipher-key">
                <tr><th>数字</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td></tr>
                <tr><th>記号</th><td class="symbol">☉</td><td class="symbol">☽</td><td class="symbol">☿</td><td class="symbol">♀</td><td class="symbol">♂</td><td class="symbol">♃</td><td class="symbol">♄</td></tr>
            </table>

            <div id="encryption-tool">
                <p>上の表を元に「76」を暗号化せよ (数字ボタンをクリック):</p>
                <button class="action-btn" data-digit="7">7</button>
                <button class="action-btn" data-digit="6">6</button>
                <div id="encrypted-output"></div>
                <button class="action-btn" id="sX-transmit" disabled>秘密裏に伝達する</button>
                <button class="action-btn" id="sX-reset">リセット</button>
            </div>
            
            <p class="result-text" id="sX-result"></p>
        `,
        init: () => {
            const stageIndex = 7;
            const resultText = document.getElementById('sX-result');
            const encryptedOutput = document.getElementById('encrypted-output');
            const transmitBtn = document.getElementById('sX-transmit');
            const resetBtn = document.getElementById('sX-reset');
            const digitButtons = document.querySelectorAll('#encryption-tool button[data-digit]');

            const cipherMap = { '7': '♄', '6': '♃' };
            let userInput = "";

            const updateOutput = () => {
                let output = "";
                for (const char of userInput) {
                    output += cipherMap[char] || '';
                }
                encryptedOutput.textContent = output;

                if (userInput === "76") {
                    transmitBtn.disabled = false;
                } else {
                    transmitBtn.disabled = true;
                }
            };

            digitButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    if (userInput.length < 2) {
                        userInput += btn.dataset.digit;
                        updateOutput();
                    }
                });
            });

            resetBtn.addEventListener('click', () => {
                userInput = "";
                resultText.textContent = "";
                updateOutput();
            });

            transmitBtn.addEventListener('click', () => {
                resultText.textContent = '成功！暗号化された記録は、検閲の目を逃れて未来へと託された。情報統制は、知識の発展を歪めるが、それを乗り越えようとする人間の知恵もまた育むのだ。';
                resultText.className = 'result-text success';
                markStageComplete(stageIndex);
            });
        }
    });

    // (ステージX の定義の後に追加)

    // Stage 4: Letterpress Printing (CORRECTED VERSION)
    stages.push({
        id: 'stage4',
        title: 'ステージ4: 印刷の時代',
        completed: false,
        isComplete: () => stages[8].completed,
        content: `<h2>ステージ4: 印刷の時代（活版印刷）</h2><p class="mission-text">ミッション: 天文暦を印刷するため、活版を組む。「76年 周期 彗星 再来」の順に活字を原盤に並べよ。</p><p><strong>原盤 (ここに活字を並べる):</strong></p><div id="composing-stone" class="dropzone"></div><p><strong>活字ケース (ここから活字を選ぶ):</strong></p><div id="type-case" class="dropzone"></div><p class="result-text" id="s4-result"></p>`,
        init: () => {
            const typeCase = document.getElementById('type-case');
            const composingStone = document.getElementById('composing-stone');
            const resultText = document.getElementById('s4-result');
            const words = ["76年", "周期", "彗星", "再来"];
            const correctOrder = "76年周期彗星再来";

            const initialize = () => {
                typeCase.innerHTML = ''; composingStone.innerHTML = ''; resultText.textContent = '';
                words.slice().sort(() => Math.random() - 0.5).forEach((word, index) => {
                    const typeBlock = document.createElement('div');
                    typeBlock.className = 'type-block';
                    typeBlock.textContent = word;
                    typeBlock.draggable = true;
                    typeBlock.id = `type-block-${index}`; // Add unique ID
                    typeCase.appendChild(typeBlock);
                });
            };

            document.getElementById('stage4').addEventListener('dragstart', e => {
                if (e.target.classList.contains('type-block')) {
                    e.dataTransfer.setData('text/plain', e.target.id); // Use ID for transfer
                }
            });

            document.querySelectorAll('.dropzone').forEach(zone => {
                zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
                zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
                zone.addEventListener('drop', e => {
                    e.preventDefault(); zone.classList.remove('drag-over');
                    const elementId = e.dataTransfer.getData('text/plain');
                    const draggedElement = document.getElementById(elementId);
                    if (draggedElement) {
                        zone.appendChild(draggedElement); // Move the element
                        checkCompletion();
                    }
                });
            });

            const checkCompletion = () => {
                const currentOrder = Array.from(composingStone.children).map(el => el.textContent).join('');
                if (currentOrder === correctOrder) {
                    resultText.textContent = '素晴らしい！これで同じ情報を大量に、そして正確に複製できる。科学知識の共有がここから始まる！';
                    resultText.className = 'result-text success';
                    markStageComplete(8);
                }
            };

            initialize();
        }
    });

    // (ステージ4 の定義の後に追加)

    // Stage 4.5: Encyclopedia
    stages.push({
        id: 'stage4-5',
        title: 'ステージ4.5: 百科全書の時代',
        completed: false,
        isComplete: () => stages[9].completed,
        content: `
            <h2>ステージ4.5: 百科全書の時代：知識の体系化</h2>
            <p class="mission-text" id="s4-5-mission">ミッション(1/3): 信頼できる情報源を選び出し、草稿を作成する。</p>
            
            <!-- Part 1: 情報の取捨選択 -->
            <div id="selection-part">
                <div id="sources-list">
                    <div class="source-item">
                        <input type="checkbox" id="source1" data-correct="true">
                        <label for="source1">彗星は、太陽の引力に引かれ、楕円軌道を描いて公転する天体である。(ケプラーの観測より)</label>
                    </div>
                    <div class="source-item">
                        <input type="checkbox" id="source2" data-correct="false">
                        <label for="source2">彗星は、神々の怒りを示す凶兆であり、疫病や戦乱を引き起こす。(古い伝承より)</label>
                    </div>
                    <div class="source-item">
                        <input type="checkbox" id="source3" data-correct="true">
                        <label for="source3">周期76年の彗星が、過去の文献にも複数記録されている。(ハレーの研究より)</label>
                    </div>
                </div>
                <button class="action-btn" id="s4-5-compile">草稿を作成</button>
            </div>

            <!-- Part 2 & 3: 編集エリア -->
            <div id="editing-area" style="display:none;">
                <h4>百科全書：【彗星】の項目</h4>
                <div id="encyclopedia-entry"></div>
                <div id="editing-tools">
                    <button class="action-btn" id="s4-5-add-ref">相互参照を追加</button>
                    <button class="action-btn" id="s4-5-add-image">図版を挿入</button>
                </div>
                <button class="action-btn" id="s4-5-publish" style="margin-top:20px;" disabled>項目を公開する</button>
            </div>

            <p class="result-text" id="s4-5-result"></p>
        `,
        init: () => {
            const stageIndex = 9;
            const missionText = document.getElementById('s4-5-mission');
            const resultText = document.getElementById('s4-5-result');
            
            // Part 1 elements
            const selectionPart = document.getElementById('selection-part');
            const compileBtn = document.getElementById('s4-5-compile');

            // Part 2&3 elements
            const editingArea = document.getElementById('editing-area');
            const entryDiv = document.getElementById('encyclopedia-entry');
            const addRefBtn = document.getElementById('s4-5-add-ref');
            const addImageBtn = document.getElementById('s4-5-add-image');
            const publishBtn = document.getElementById('s4-5-publish');

            let hasRef = false;
            let hasImage = false;

            // --- Part 1: 情報選択ロジック ---
            compileBtn.addEventListener('click', () => {
                let draftText = "";
                let correctSelections = 0;
                let incorrectSelections = 0;
                const sources = document.querySelectorAll('.source-item input[type="checkbox"]');
                
                sources.forEach(source => {
                    if (source.checked) {
                        const label = document.querySelector(`label[for="${source.id}"]`);
                        draftText += `<p>${label.textContent}</p>`;
                        if (source.dataset.correct === 'true') {
                            correctSelections++;
                        } else {
                            incorrectSelections++;
                        }
                    }
                });

                if (draftText === "") {
                    resultText.textContent = '少なくとも一つの情報源を選んでください。';
                    resultText.className = 'result-text fail';
                    return;
                }

                if (incorrectSelections > 0) {
                    resultText.textContent = '草稿を作成したが、中には迷信も含まれているようだ。優れた編集者は、情報の真偽を見極めねばならない。';
                } else {
                    resultText.textContent = '信頼できる情報源から、精度の高い草稿が作成された。';
                }
                resultText.className = 'result-text';

                entryDiv.innerHTML = draftText;
                selectionPart.style.display = 'none';
                editingArea.style.display = 'block';
                missionText.textContent = 'ミッション(2/3): 読者の理解を深めるため、記事を編集・構造化する。';
            });

            // --- Part 2&3: 編集ツールロジック ---
            addRefBtn.addEventListener('click', () => {
                if (hasRef) return;
                const refElement = document.createElement('p');
                refElement.className = 'cross-reference';
                refElement.innerHTML = '<em>(この現象の原理については『引力の法則』の項を参照せよ)</em>';
                entryDiv.appendChild(refElement);
                hasRef = true;
                addRefBtn.disabled = true;
                checkPublishable();
            });

            addImageBtn.addEventListener('click', () => {
                if (hasImage) return;
                const figure = document.createElement('figure');
                figure.id = 'entry-illustration';
                figure.innerHTML = `<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Giottocometa.jpg/220px-Giottocometa.jpg" alt="Comet illustration"><figcaption>彗星の軌道図</figcaption>`;
                entryDiv.prepend(figure); // 記事の先頭に図版を挿入
                hasImage = true;
                addImageBtn.disabled = true;
                checkPublishable();
            });
            
            const checkPublishable = () => {
                if (hasRef && hasImage) {
                    publishBtn.disabled = false;
                    missionText.textContent = 'ミッション(3/3): 完成した項目を公開し、知識を世に広める。';
                }
            };

            publishBtn.addEventListener('click', () => {
                resultText.textContent = '成功！単なる情報の寄せ集めが、編集によって構造化され、新たな価値を持つ「知識」となった。';
                resultText.className = 'result-text success';
                markStageComplete(stageIndex);
            });
        }
    });

    // (ステージ4.5 の定義の後に追加)

    // (ステージ4.5 の定義の後に追加)

   // (ステージ4.5 の定義の後に追加)

    // (ステージ4.5 の定義の後に追加)

    // Stage 4.8: Photography (NEW, SIMPLER INTERACTION)
    stages.push({
        id: 'stage4-8',
        title: 'ステージ4.8: 写真術の黎明',
        completed: false,
        isComplete: () => stages[10].completed,
        content: `
            <h2>ステージ4.8: 光の化石：写真術の黎明</h2>
            <p class="mission-text">ミッション: ボタンを押し続け、ピントが合った瞬間に指を離して彗星を撮影せよ！</p>
            
            <div id="photo-lab">
                <div id="photo-preview">
                    <div id="comet-photo"></div>
                </div>
                <button class="action-btn" id="shutter-button">ピントを合わせる (長押し)</button>
            </div>

            <p class="result-text" id="s4-8-result"></p>
        `,
        init: () => {
            const stageIndex = 10;
            const resultText = document.getElementById('s4-8-result');
            const shutterBtn = document.getElementById('shutter-button');
            const cometPhoto = document.getElementById('comet-photo');
            
            let focusInterval = null;
            let blurValue = 20; // 最初のボケ具合
            const targetBlur = 0; // 目標
            const focusSpeed = 0.5; // ピントが合う速度

            const resetPhoto = () => {
                blurValue = 20;
                cometPhoto.style.filter = `blur(${blurValue}px)`;
                resultText.textContent = '';
                shutterBtn.disabled = false;
            };
            
            // --- ボタンを押し始めた時の処理 ---
            shutterBtn.addEventListener('mousedown', () => {
                if (stages[stageIndex].completed) return;
                
                // 継続的にピントを合わせる処理を開始
                focusInterval = setInterval(() => {
                    blurValue = Math.max(0, blurValue - focusSpeed);
                    cometPhoto.style.filter = `blur(${blurValue}px)`;
                }, 50); // 50ミリ秒ごとに実行
            });

            // --- ボタンを離した時の処理 ---
            shutterBtn.addEventListener('mouseup', () => {
                clearInterval(focusInterval); // ピント合わせを停止
                shutterBtn.disabled = true; // 一度撮ったらボタンは無効

                // 成功判定 (最もシャープに近いか？)
                if (blurValue <= targetBlur + 1) { // 多少の誤差は許容
                    resultText.textContent = '撮影成功！客観的な事実が「光の化石」として記録された。これは科学にとって革命的な出来事だ。';
                    resultText.className = 'result-text success';
                    markStageComplete(stageIndex);
                } else if (blurValue < 10) { //惜しい
                    resultText.textContent = 'ピントが甘い...。もう少しだった。';
                    resultText.className = 'result-text fail';
                    setTimeout(resetPhoto, 2000); // 2秒後にリセット
                } else { // 完全に失敗
                    resultText.textContent = 'ピントが合っていない...。撮影失敗だ。';
                    resultText.className = 'result-text fail';
                    setTimeout(resetPhoto, 2000); // 2秒後にリセット
                }
            });
            
            // 初期状態を設定
            resetPhoto();
        }
    });

// (ステージ5 の定義が続く...)
    // (ステージ4.5 の定義の後に追加)

    // Stage 5: Telegraph
    stages.push({
        id: 'stage5',
        title: 'ステージ5: 電気通信の時代',
        completed: false,
        isComplete: () => stages[11].completed,
        content: `
            <h2>ステージ5: 電気通信の時代（電信）</h2>
            <p class="mission-text">ミッション: "COMET" という単語をモールス信号で送信せよ。</p>
            
            <div id="telegraph-station">
                <div id="morse-target"></div>
                <div id="morse-guide"></div>
                <div id="morse-input"></div>
                <div id="morse-keys">
                    <div class="morse-key" data-signal=".">・</div>
                    <div class="morse-key" data-signal="-">－</div>
                </div>
            </div>

            <p class="result-text" id="s5-result"></p>
        `,
        init: () => {
            const stageIndex = 11;
            const targetDiv = document.getElementById('morse-target');
            const guideDiv = document.getElementById('morse-guide');
            const inputDiv = document.getElementById('morse-input');
            const resultText = document.getElementById('s5-result');
            const keys = document.querySelectorAll('.morse-key');

            const MORSE_MAP = { 'C': '-.-.', 'O': '---', 'M': '--', 'E': '.', 'T': '-' };
            const TARGET_WORD = "COMET";
            
            let currentCharIndex = 0;
            let currentUserInput = "";

            const updateDisplay = () => {
                // ターゲットワードの表示を更新（現在の文字をハイライト）
                let targetHTML = "";
                for (let i = 0; i < TARGET_WORD.length; i++) {
                    if (i === currentCharIndex) {
                        targetHTML += `<span class="current-char">${TARGET_WORD[i]}</span>`;
                    } else {
                        targetHTML += TARGET_WORD[i];
                    }
                }
                targetDiv.innerHTML = targetHTML;

                // ガイドと入力欄を更新
                if (currentCharIndex < TARGET_WORD.length) {
                    guideDiv.textContent = `Required: ${MORSE_MAP[TARGET_WORD[currentCharIndex]]}`;
                } else {
                    guideDiv.textContent = 'Transmission Complete!';
                }
                inputDiv.textContent = currentUserInput;
            };

            const handleSignal = (signal) => {
                if (currentCharIndex >= TARGET_WORD.length) return; // 完了後は何もしない

                currentUserInput += signal;
                inputDiv.textContent = currentUserInput;

                const currentLetter = TARGET_WORD[currentCharIndex];
                const correctMorse = MORSE_MAP[currentLetter];

                // 入力が正しいシーケンスの先頭部分であるかチェック
                if (!correctMorse.startsWith(currentUserInput)) {
                    // 間違い
                    resultText.textContent = '符号が違う！やり直し。';
                    resultText.className = 'result-text fail';
                    currentUserInput = ""; // 入力をリセット
                    setTimeout(() => { 
                        inputDiv.textContent = "";
                        resultText.textContent = "";
                    }, 800);
                } else if (currentUserInput === correctMorse) {
                    // 正解
                    resultText.textContent = `文字「${currentLetter}」の送信成功！`;
                    resultText.className = 'result-text success';
                    currentCharIndex++;
                    currentUserInput = "";
                    
                    setTimeout(() => {
                        if (currentCharIndex >= TARGET_WORD.length) {
                            // 全て完了
                            resultText.textContent = '全信号の送信成功！観測データは瞬時に大陸を越えた。リアルタイムな科学連携の幕開けだ！';
                            markStageComplete(stageIndex);
                        } else {
                            resultText.textContent = '';
                        }
                        updateDisplay();
                    }, 500);
                }
            };

            keys.forEach(key => {
                key.addEventListener('click', () => {
                    handleSignal(key.dataset.signal);
                });
            });

            // 初期表示
            updateDisplay();
        }
    });

    // (ステージ5 の定義の後に追加)

    // Stage 5.5: Radio Broadcasting
    stages.push({
        id: 'stage5-5',
        title: 'ステージ5.5: ラジオ放送の時代',
        completed: false,
        isComplete: () => stages[12].completed,
        content: `
            <h2>ステージ5.5: ラジオ放送の時代</h2>
            <p class="mission-text">ミッション: 周波数を調整し、彗星情報を全国のアマチュア天文家にクリアな音声で届けよ。</p>
            
            <div id="radio-console">
                <p><strong>放送周波数: 102.5 MHz</strong></p>
                <div id="radio-tuner">
                    <span>88.0</span>
                    <input type="range" id="frequency-slider" min="880" max="1080" value="950">
                    <span>108.0</span>
                </div>
                <div style="text-align:center;">
                    <span id="frequency-display">95.0</span>
                </div>
                <div id="radio-output">
                    <div class="static-noise"></div>
                    <p id="broadcast-message">...ザー...ザー...こちら...天文台...</p>
                </div>
            </div>
            
            <p class="result-text" id="s5-5-result"></p>
        `,
        init: () => {
            const stageIndex = 12;
            const slider = document.getElementById('frequency-slider');
            const freqDisplay = document.getElementById('frequency-display');
            const broadcastMsg = document.getElementById('broadcast-message');
            const noiseEffect = document.querySelector('.static-noise');
            const resultText = document.getElementById('s5-5-result');

            const TARGET_FREQUENCY = 1025; // 102.5 MHz

            const updateRadio = () => {
                const currentValue = parseInt(slider.value, 10);
                freqDisplay.textContent = (currentValue / 10).toFixed(1);

                // ターゲット周波数との差を計算
                const difference = Math.abs(currentValue - TARGET_FREQUENCY);

                if (difference === 0) {
                    // 正解
                    noiseEffect.style.opacity = 0;
                    broadcastMsg.textContent = "「...クリアに聞こえる！アマチュア天文家の皆様へ。彗星は現在、赤経15時30分、赤緯マイナス25度。光度は3等級。観測準備を推奨します。繰り返します...」";
                    broadcastMsg.style.color = '#000';
                    
                    if (!stages[stageIndex].completed) {
                        resultText.textContent = '成功！正しい周波数に合わせたことで、あなたの声は瞬時に、広範囲の不特定多数の人々へ届けられた。これがマス・コミュニケーションの力だ！';
                        resultText.className = 'result-text success';
                        markStageComplete(stageIndex);
                    }

                } else {
                    // 不正解
                    broadcastMsg.style.color = '#555';
                    broadcastMsg.textContent = "...ザー...こちら...天文台...彗星...座標...ザー... ...";
                    // 差が小さいほどノイズが減る
                    const noiseLevel = Math.min(difference / 50, 1);
                    noiseEffect.style.opacity = noiseLevel;
                }
            };
            
            slider.addEventListener('input', updateRadio);

            // 初期状態を設定
            updateRadio();
        }
    });

    // (ステージ5.5 の定義の後に追加)

    // Stage Y: Wartime Information
    stages.push({
        id: 'stageY',
        title: 'ステージY: 戦時下の情報戦',
        completed: false,
        isComplete: () => stages[13].completed,
        content: `
            <h2>ステージY: 戦時下の情報戦</h2>
            <p class="mission-text">ミッション: "COMET AT 76" という平文を、エニグマ風暗号機で暗号化し、同盟国に送信せよ。</p>

            <div id="enigma-machine">
                <div class="enigma-panel">
                    <div class="enigma-section">
                        <h4>1. ローター設定 (鍵)</h4>
                        <div id="rotor-settings">
                            <label for="rotor1">ローターI:</label>
                            <select id="rotor1">
                                <option value="3">3</option><option value="1">1</option><option value="5">5</option>
                            </select>
                            <label for="rotor2">ローターII:</label>
                            <select id="rotor2">
                                <option value="2">2</option><option value="4">4</option><option value="6">6</option>
                            </select>
                        </div>
                    </div>
                    <div class="enigma-section">
                        <h4>2. 平文 (Plaintext)</h4>
                        <input type="text" id="plaintext-input" value="COMETAT76" readonly>
                        <h4>3. 暗号文 (Ciphertext)</h4>
                        <div id="ciphertext-output"></div>
                    </div>
                </div>
                <button class="action-btn" id="sY-encrypt" style="margin-top:20px;">暗号化して送信</button>
            </div>
            <p class="result-text" id="sY-result"></p>
        `,
        init: () => {
            const stageIndex = 13;
            const resultText = document.getElementById('sY-result');
            const encryptBtn = document.getElementById('sY-encrypt');
            const plaintextInput = document.getElementById('plaintext-input');
            const ciphertextOutput = document.getElementById('ciphertext-output');
            const rotor1 = document.getElementById('rotor1');
            const rotor2 = document.getElementById('rotor2');

            const encrypt = (text, key1, key2) => {
                const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                let result = '';
                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    const charIndex = alphabet.indexOf(char.toUpperCase());
                    if (charIndex > -1) {
                        // 非常に簡略化した暗号化ロジック
                        let newIndex = (charIndex + key1 + key2 + i) % alphabet.length;
                        result += alphabet[newIndex];
                    } else {
                        result += char; // アルファベット/数字以外はそのまま
                    }
                }
                return result;
            };

            encryptBtn.addEventListener('click', () => {
                const key1 = parseInt(rotor1.value, 10);
                const key2 = parseInt(rotor2.value, 10);
                const plaintext = plaintextInput.value;
                
                const ciphertext = encrypt(plaintext, key1, key2);
                ciphertextOutput.textContent = ciphertext;

                // 特定の組み合わせを正解とする
                if (key1 === 3 && key2 === 6) {
                    resultText.textContent = '成功！正しい鍵で暗号化された情報は、敵に解読されることなく同盟国へ届くだろう。情報セキュリティの重要性が、国家の運命を左右する。';
                    resultText.className = 'result-text success';
                    markStageComplete(stageIndex);
                } else {
                    resultText.textContent = '暗号化はされたが、この鍵の設定は本日指定されたものではない...。これでは同盟国側で正しく復号できない。';
                    resultText.className = 'result-text fail';
                }
            });
        }
    });

    // (ステージY の定義の後に追加)

    // (ステージYの定義とステージ6の定義の間)

    // Stage 6: Command Line Interface (with Hint)
    stages.push({
        id: 'stage6',
        title: 'ステージ6: コンピューター黎明期',
        completed: false,
        isComplete: () => stages[14].completed,
        content: `
            <h2>ステージ6: コンピューター黎明期（コマンドライン）</h2>
            <p class="mission-text">ミッション: コマンドを使い、サーバー内の "cycle_76" に関するデータを探し出し、内容を表示せよ。</p>
            
            <div id="terminal">
                <div id="terminal-output">Welcome to University Mainframe.</div>
                <div class="terminal-line">
                    <span class="prompt">/home/guest></span>
                    <input type="text" id="command-input" autofocus>
                </div>
            </div>
            
            <!-- Hint Button and Area -->
            <div id="hint-area">
                <button class="action-btn" id="s6-hint-btn">ヒントを見る</button>
                <div id="hint-content">
                    <p>以下のコマンドを順番に入力してみよう:</p>
                    <ol>
                        <li><code>cd ..</code> (一つ上の階層へ)</li>
                        <li><code>cd ..</code> (さらに上、ルート階層へ)</li>
                        <li><code>ls</code> (中身を確認)</li>
                        <li><code>cd archives</code> ('archives'へ移動)</li>
                        <li><code>cd celestial_bodies</code></li>
                        <li><code>cd comets</code></li>
                        <li><code>grep "cycle_76" *.dat</code> (ファイルを検索)</li>
                        <li><code>cat comet_1910.dat</code> (内容を表示)</li>
                    </ol>
                </div>
            </div>

            <p class="result-text" id="s6-result"></p>
        `,
        init: () => {
            const stageIndex = 14;
            const terminalOutput = document.getElementById('terminal-output');
            const commandInput = document.getElementById('command-input');
            const prompt = document.querySelector('.prompt');
            const resultText = document.getElementById('s6-result');
            const hintBtn = document.getElementById('s6-hint-btn');
            const hintContent = document.getElementById('hint-content');

            // Hint button functionality
            hintBtn.addEventListener('click', () => {
                hintContent.style.display = hintContent.style.display === 'block' ? 'none' : 'block';
            });

            const fileSystem = {
                '/': { type: 'dir', content: ['home', 'archives'] },
                '/home': { type: 'dir', content: ['guest'] },
                '/home/guest': { type: 'dir', content: ['readme.txt'] },
                '/home/guest/readme.txt': { type: 'file', content: 'Welcome, guest.' },
                '/archives': { type: 'dir', content: ['celestial_bodies', 'geology'] },
                '/archives/celestial_bodies': { type: 'dir', content: ['stars', 'comets'] },
                '/archives/celestial_bodies/comets': { type: 'dir', content: ['comet_1910.dat', 'comet_1986.dat'] },
                '/archives/celestial_bodies/comets/comet_1910.dat': { type: 'file', content: 'cycle_76_years,obs_alpha,data:1,5,3,...' },
                '/archives/celestial_bodies/comets/comet_1986.dat': { type: 'file', content: 'cycle_76_years,obs_beta,data:2,4,8,...' },
            };
            let currentPath = '/home/guest';

            const printToTerminal = (text) => {
                terminalOutput.textContent += `\n${text}`;
                terminalOutput.parentElement.scrollTop = terminalOutput.parentElement.scrollHeight;
            };
            
            const updatePrompt = () => {
                prompt.textContent = `${currentPath.length > 1 ? currentPath : '/'}>`;
            };

            commandInput.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter' || !commandInput.value) return;
                
                const command = commandInput.value.trim();
                printToTerminal(`${prompt.textContent}${command}`);
                commandInput.value = '';

                const [cmd, ...args] = command.split(' ');

                switch (cmd) {
                    case 'ls':
                        printToTerminal(fileSystem[currentPath].content.join('\t'));
                        break;
                    case 'cd':
                        const targetDir = args[0];
                        if (!targetDir) { printToTerminal('cd: missing operand'); break; }
                        let newPath;
                        if (targetDir === '..') {
                            newPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
                            if (newPath === '') newPath = '/';
                        } else {
                            newPath = (currentPath === '/' ? '' : currentPath) + '/' + targetDir;
                        }
                        
                        if (fileSystem[newPath] && fileSystem[newPath].type === 'dir') {
                            currentPath = newPath;
                        } else {
                            printToTerminal(`cd: no such directory: ${targetDir}`);
                        }
                        break;
                    case 'grep':
                        if (args[0] === '"cycle_76"' && args[1] === '*.dat' && currentPath === '/archives/celestial_bodies/comets') {
                            printToTerminal('comet_1910.dat: cycle_76_years,obs_alpha,data:1,5,3,...');
                            printToTerminal('comet_1986.dat: cycle_76_years,obs_beta,data:2,4,8,...');
                            resultText.textContent = 'データを発見！次は cat コマンドで中身を見てみよう。';
                            resultText.className = 'result-text';
                        } else {
                            printToTerminal('grep: no match found or incorrect usage.');
                        }
                        break;
                    case 'cat':
                        const filePath = (currentPath === '/' ? '' : currentPath) + '/' + args[0];
                        if (fileSystem[filePath] && fileSystem[filePath].type === 'file') {
                            printToTerminal(fileSystem[filePath].content);
                            if (args[0] === 'comet_1910.dat') {
                                resultText.textContent = '成功！人間には不可能な速さで膨大なデータが検索・表示された。だが、その力を引き出すには、機械の言語を厳密に学ばねばならない。';
                                resultText.className = 'result-text success';
                                markStageComplete(stageIndex);
                            }
                        } else {
                            printToTerminal(`cat: no such file: ${args[0]}`);
                        }
                        break;
                    default:
                        printToTerminal(`command not found: ${cmd}`);
                }
                updatePrompt();
            });
            
            commandInput.focus();
            updatePrompt(); // 初期プロンプト表示を修正
        }
    });

    // (ステージ6 の定義の後に追加)

    // (ステージ6 の定義の後に追加)

    // Stage 6.5: Dial-up BBS (with Hint)
    stages.push({
        id: 'stage6-5',
        title: 'ステージ6.5: インターネットの黎明',
        completed: false,
        isComplete: () => stages[15].completed,
        content: `
            <h2>ステージ6.5: インターネットの黎明</h2>
            <p class="mission-text">ミッション: BBSに接続し、観測報告を投稿せよ。(文字数制限: 140字)</p>
            
            <!-- Part 1: ダイヤルアップ接続 -->
            <div id="dialup-part">
                <div id="dialup-terminal">
                    <div id="dialup-output">OK</div>
                    <div class="dialup-input-line">
                        <span>></span>
                        <input type="text" id="atdt-input" placeholder="ATDTコマンドを入力..." autofocus>
                    </div>
                </div>
                <!-- Hint Button and Area -->
                <div id="hint-area" style="margin-top:0; padding: 10px; background-color: #00008b;">
                    <button class="action-btn" id="s6-5-hint-btn">ヒントを見る</button>
                    <div id="hint-content-6-5" style="display:none; color:#fff; margin-top:10px;">
                        <p>接続するには、モデムに電話をかけさせるコマンドを入力します。<br>
                        コマンド: <code>ATDT 045-123-4567</code></p>
                    </div>
                </div>
            </div>

            <!-- Part 2: BBS投稿画面 -->
            <div id="bbs-screen" style="display:none;">
                <h3 id="bbs-welcome">*** ASTRONOMY BBS ***</h3>
                <p>新規メッセージ投稿 (140字以内):</p>
                <textarea id="bbs-post-content" placeholder="例: COMET SIGHTED. 76 YEAR CYCLE CONFIRMED..."></textarea>
                <div id="char-counter">0 / 140</div>
                <button class="action-btn" id="s6-5-post">投稿する</button>
            </div>

            <p class="result-text" id="s6-5-result"></p>
        `,
        init: () => {
            const stageIndex = 15;
            const resultText = document.getElementById('s6-5-result');

            // Part 1 Elements
            const dialupPart = document.getElementById('dialup-part');
            const dialupTerminal = document.getElementById('dialup-terminal');
            const dialupOutput = document.getElementById('dialup-output');
            const atdtInput = document.getElementById('atdt-input');
            const hintBtn = document.getElementById('s6-5-hint-btn');
            const hintContent = document.getElementById('hint-content-6-5');
            
            // Part 2 Elements
            const bbsScreen = document.getElementById('bbs-screen');
            const bbsTextarea = document.getElementById('bbs-post-content');
            const charCounter = document.getElementById('char-counter');
            const postBtn = document.getElementById('s6-5-post');
            
            // --- Hint Button Logic ---
            hintBtn.addEventListener('click', () => {
                hintContent.style.display = hintContent.style.display === 'block' ? 'none' : 'block';
            });

            const TARGET_COMMAND = "ATDT 045-123-4567";

            const printToDialup = (text) => {
                dialupOutput.textContent += `\n${text}`;
                dialupTerminal.scrollTop = dialupTerminal.scrollHeight;
            };

            // --- Part 1: 接続ロジック ---
            atdtInput.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter') return;
                const command = atdtInput.value.trim().toUpperCase();
                printToDialup(`>${command}`);
                atdtInput.value = '';

                if (command === TARGET_COMMAND) {
                    atdtInput.disabled = true;
                    hintBtn.disabled = true; // 接続シーケンス中はヒントも無効化
                    let connectionLog = ["DIALING...", "RINGING...", "CONNECT 2400"];
                    let i = 0;
                    let intervalId = setInterval(() => {
                        printToDialup(connectionLog[i]);
                        i++;
                        if (i >= connectionLog.length) {
                            clearInterval(intervalId);
                            setTimeout(() => {
                                dialupPart.style.display = 'none'; // ヒントも含めて接続パート全体を非表示
                                bbsScreen.style.display = 'block';
                            }, 500);
                        }
                    }, 1000);
                } else {
                    printToDialup("ERROR");
                }
            });

            // --- Part 2: 投稿ロジック ---
            const CHAR_LIMIT = 140;
            bbsTextarea.addEventListener('input', () => {
                const len = bbsTextarea.value.length;
                charCounter.textContent = `${len} / ${CHAR_LIMIT}`;
                charCounter.classList.toggle('limit-exceeded', len > CHAR_LIMIT);
            });

            postBtn.addEventListener('click', () => {
                const postContent = bbsTextarea.value;
                if (postContent.length > CHAR_LIMIT) {
                    resultText.textContent = '文字数制限を超えています！簡潔に書く必要があります。';
                    resultText.className = 'result-text fail';
                    return;
                }
                if (!postContent.includes("76")) {
                    resultText.textContent = '重要な周期「76年」の情報が抜けています。';
                    resultText.className = 'result-text fail';
                    return;
                }

                resultText.textContent = '成功！限られた文字数と不安定な回線の中、あなたの報告はネットワークの海に乗り出した。情報爆発の前夜だ。';
                resultText.className = 'result-text success';
                markStageComplete(stageIndex);
            });
        }
    });

    // (ステージ6.5 の定義の後に追加)

    // (ステージ6.5 の定義の後に追加)

    // (ステージ6.5 の定義の後に追加)

    // (ステージ6.5 の定義の後に追加)

    // Stage 7: GUI (REVISED AND FIXED)
    stages.push({
        id: 'stage7',
        title: 'ステージ7: GUIの時代',
        completed: false,
        isComplete: () => stages[16].completed,
        content: `
            <h2>ステージ7: GUIの時代（グラフィカル・ユーザー・インタフェース）</h2>
            <p class="mission-text">ミッション: アイコンをダブルクリックしてフォルダを辿り、「halley_1986.jpg」と「orbit_simulation.mp4」の両方を開け。</p>
            
            <div id="desktop"></div>

            <div id="image-window" class="window">
                <div class="window-header"><span>halley_1986.jpg</span><span class="window-close-btn">X</span></div>
                <div class="window-content">
                    <p><strong>1986年に観測されたハレー彗星</strong></p>
                    <img id="halley-image" src="" alt="Halley's Comet 1986">
                </div>
            </div>
            <div id="video-window" class="window">
                <div class="window-header"><span>orbit_simulation.mp4</span><span class="window-close-btn">X</span></div>
                <div class="window-content">
                    <p><strong>軌道シミュレーション (動画)</strong><br>再生ボタンを押してください。</p>
                    <!-- ★修正点: 確実に動作するサンプル動画に戻す -->
                    <video width="100%" controls>
                        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
            
            <p class="result-text" id="s7-result"></p>
        `,
        init: () => {
            const stageIndex = 16;
            const desktop = document.getElementById('desktop');
            const resultText = document.getElementById('s7-result');
            const imageWindow = document.getElementById('image-window');
            const videoWindow = document.getElementById('video-window');

            // ★修正点: 画像もBase64で埋め込み、読み込みエラーを防ぐ
            const HALLEY_IMAGE_BASE64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGIodHRsfVRY+ODo4PyY2NjxGTEZGSFZUW1pydFL/2wBDAQYFBgYJCAwYBBQYLRi নমস্কার मित्रों! एस्ट्रो-जर्नी में आपका स्वागत है। यह पाठ एन्कोडिंग के कारण अपठनीय लग सकता है, लेकिन यह वास्तव में छवि डेटा है। नमस्ते। /9k=";
            document.getElementById('halley-image').src = HALLEY_IMAGE_BASE64;

            let openedImage = false;
            let openedVideo = false;

            const FOLDER_ICON = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmY2EwMCI+PHBhdGggZD0iTTEwIDRIMkMyLjkgNC4wMSA0IDIuOSA0IDJWMjBDNCAyMS4xIDQuOSAyMiA2IDIySDE4QzE5LjEgMjIgMjAgMjEuMSAyMCAyMFY2QzIwIDQuOSAxOS4xIDQgMTggNEgxMFoiLz48L3N2Zz4=";
            const UP_ICON = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmY2EwMCI+PHBhdGggZD0iTTEwIDRIMkMyLjkgNC4wMSA0IDIuOSA0IDJWMjBDNCAyMS4xIDQuOSAyMiA2IDIySDE4QzE5LjEgMjIgMjAgMjEuMSAyMCAyMFY2QzIwIDQuOSAxOS4xIDQgMTggNEgxMFoiLz48cGF0aCBmaWxsPSIjMDAwMDAwIiBvcGFjaXR5PSIwLjMiIGQ9Ik0xMiA5TDkgMTIgMTUgMTJIeiIvPjwvc3ZnPg==";
            const IMAGE_ICON = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2Y1ZmFmYSI+PHBhdGggZD0iTTYgMkgxNEMxNS4xIDIgMTYgMi45IDE2IDRWMTZMMTEgMTAuNSAyIDJWMkM2IDIuOSAwIDYuOSA2IDJNMjAgMkg0QzIuOSAyIDIgMi45IDIgNFYyMEMyIDIxLjEgMi45IDIyIDQgMjJIMjBDMjEuMSAyMiAyMiAyMS4xIDIyIDIwVjRDNDIgMi45IDIxLjEgMiAyMCAyWk0yMCAyMEg0VjZMMTAgMTIgMTIgMTRMMTYgMTBMMjAgMTRWMjBaIi8+PC9zdmc+";
            const VIDEO_ICON = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2Y1ZmFmYSI+PHBhdGggZD0iTTE4IDNIMkM+OSAzIDAgMy45IDAgNXYxMkMwIDcuMSAuOSA4IDIgOEgxOEM5LjEgOCAyMCA3LjEgMjAgNlY0QzIwIDMuOSAxOS4xIDMgMTggM1pNMTUgOS41TDEwIDEyLjVWNkwxNSA5LjVaIi8+PC9zdmc+";

            const fileSystem = {
                'desktop': { '研究データ': { type: 'folder', target: 'folder_data' } },
                'folder_data': { '.. (上へ)': { type: 'up', target: 'desktop' }, '彗星': { type: 'folder', target: 'folder_comets' } },
                'folder_comets': { '.. (上へ)': { type: 'up', target: 'folder_data' }, 'halley_1986.jpg': { type: 'image' }, 'orbit_simulation.mp4': { type: 'video' } }
            };
            let currentLocation = 'desktop';

            const createIcon = (name, item) => {
                const icon = document.createElement('div');
                icon.className = 'icon';
                let iconImgSrc = FOLDER_ICON;
                if (item.type === 'up') iconImgSrc = UP_ICON;
                if (item.type === 'image') iconImgSrc = IMAGE_ICON;
                if (item.type === 'video') iconImgSrc = VIDEO_ICON;
                icon.innerHTML = `<img src="${iconImgSrc}" alt="${item.type} icon"><span>${name}</span>`;
                icon.addEventListener('dblclick', () => handleDoubleClick(item));
                return icon;
            };

            const renderIcons = () => {
                desktop.innerHTML = '';
                const items = fileSystem[currentLocation];
                for (const name in items) {
                    const item = items[name];
                    const icon = createIcon(name, item);
                    desktop.appendChild(icon);
                }
            };
            
            const handleDoubleClick = (item) => {
                if (item.type === 'folder' || item.type === 'up') {
                    currentLocation = item.target;
                    renderIcons();
                } else if (item.type === 'image') {
                    imageWindow.style.display = 'block';
                    openedImage = true;
                } else if (item.type === 'video') {
                    videoWindow.style.display = 'block';
                    openedVideo = true;
                }
                checkCompletion();
            };
            
            const checkCompletion = () => {
                if (openedImage && openedVideo && !stages[stageIndex].completed) {
                    resultText.textContent = '成功！コマンドを覚えなくても、見た目でわかるアイコンをクリックするだけで、画像や動画といった複雑なデータにも直感的にアクセスできる。';
                    resultText.className = 'result-text success';
                    markStageComplete(stageIndex);
                }
            };

            document.querySelectorAll('.window-close-btn').forEach(btn => {
                btn.addEventListener('click', (e) => { e.target.closest('.window').style.display = 'none'; });
            });
            
            renderIcons();
        }
    });

    // (ステージ7 の定義の後に追加)
    // (ステージ7 の定義の後に追加)

    // (ステージ7 の定義の後に追加)

    // Stage 7.5: Web Search (with Hint)
    stages.push({
        id: 'stage7-5',
        title: 'ステージ7.5: キーワードの迷宮',
        completed: false,
        isComplete: () => stages[17].completed,
        content: `
            <h2>ステージ7.5: ウェブ検索の黎明期</h2>
            <p class="mission-text" id="s7-5-mission">ミッション(1/2): 「1986年の彗星観測に使われた探査機」の名前を検索して見つけ出せ。</p>

            <div id="search-engine">
                <h3 style="text-align:center; font-family: 'Times New Roman', serif;">WebFinder 1.0</h3>
                <div id="search-bar">
                    <input type="text" id="search-input" placeholder="キーワードを入力して検索...">
                    <button class="action-btn" id="search-button">検索</button>
                </div>
                <div id="search-results-container">
                    <ul id="search-results-list"></ul>
                </div>
            </div>
            
            <!-- Hint Button and Area -->
            <div id="hint-area" style="margin-top: 15px;">
                <button class="action-btn" id="s7-5-hint-btn">ヒントを見る</button>
                <div id="hint-content-7-5" style="display:none; background-color:#fffbe6; border:1px solid var(--accent-color); padding:10px; margin-top:10px; border-radius:5px;">
                    <!-- Hint content will be updated by JS -->
                </div>
            </div>
            
            <div id="link-content-modal">
                <button class="window-close-btn" style="float: right;">X</button>
                <div id="modal-content"></div>
            </div>

            <p class="result-text" id="s7-5-result"></p>
        `,
        init: () => {
            const stageIndex = 17;
            const missionText = document.getElementById('s7-5-mission');
            const resultText = document.getElementById('s7-5-result');
            const searchInput = document.getElementById('search-input');
            const searchBtn = document.getElementById('search-button');
            const resultsList = document.getElementById('search-results-list');
            const modal = document.getElementById('link-content-modal');
            const modalContent = document.getElementById('modal-content');
            const hintBtn = document.getElementById('s7-5-hint-btn');
            const hintContent = document.getElementById('hint-content-7-5');
            
            let foundFactA = false;
            let foundFactB = false;

            const hints = {
                A: 'ヒント: <code>彗星 1986 探査機</code> と入力してみよう。',
                B: 'ヒント: <code>彗星 1910 作家</code> と入力してみよう。'
            };

            const updateHint = () => {
                hintContent.innerHTML = !foundFactA ? hints.A : hints.B;
            };

            hintBtn.addEventListener('click', () => {
                updateHint();
                hintContent.style.display = hintContent.style.display === 'block' ? 'none' : 'block';
            });

            const searchDatabase = {
                '彗星 1986 探査機': [
                    { title: 'ジオット (探査機) - Wikipedia', snippet: 'ジオットは、欧州宇宙機関の無人宇宙探査機。ハレー彗星の核を初めて近接撮影したことで知られる。', content: '<h3>ジオット (Giotto)</h3><p>ハレー彗星が1986年に地球に接近した際、複数の探査機が観測を行いました。その中でも、欧州宇宙機関(ESA)の**ジオット**は彗星の核から約600kmの距離まで接近し、史上初めてその姿を鮮明に撮影することに成功しました。</p>', isCorrect: 'A' },
                    { title: '【衝撃】探査機が撮影した宇宙人の正体！', snippet: '1986年、あの探査機が見たモノとは...今明かされる驚愕の真実！', content: '<p>この先を読むには会員登録が必要です。</p>', isCorrect: null }
                ],
                '彗星 1910 作家': [
                    { title: 'ハレー彗星とマーク・トウェイン - 天文コラム', snippet: '「トム・ソーヤーの冒険」で知られる作家マーク・トウェインは、ハレー彗星が現れた1835年に生まれ...', content: '<h3>マーク・トウェインと彗星</h3><p>「私はハレー彗星と共に来た。来年、またハレー彗星が来たら、私もそれと共に去りたいものだ」<br>この言葉を残した作家**マーク・トウェイン**は、予言通り、ハレー彗星が再び地球に接近した1910年にこの世を去りました。</p>', isCorrect: 'B' },
                    { title: '家庭用洗剤「コメット」 - 会社の歴史', snippet: '1910年創業の当社は、輝く彗星のようにキッチンを綺麗にしたいという願いを込めて「コメット」と名付けられました。', content: '<p>当社の製品は、全国のスーパーマーケットでお求めいただけます。</p>', isCorrect: null }
                ]
            };

            const executeSearch = () => {
                const query = searchInput.value;
                resultsList.innerHTML = '';
                
                if (query.includes('何ですか') || query.includes('教えて')) {
                    resultsList.innerHTML = '<p>0件ヒット。ヒント: 検索エンジンは文章を理解できません。重要な単語（キーワード）を試してください。</p>';
                    return;
                }

                const results = searchDatabase[query.trim()];
                if (results) {
                    results.forEach(res => {
                        const li = document.createElement('li');
                        li.className = 'search-result-item';
                        const link = document.createElement('a');
                        link.textContent = res.title;
                        link.onclick = () => showLinkContent(res);
                        const snippet = document.createElement('p');
                        snippet.textContent = res.snippet;
                        li.appendChild(link);
                        li.appendChild(snippet);
                        resultsList.appendChild(li);
                    });
                } else {
                    resultsList.innerHTML = '<p>0件ヒット。別のキーワードの組み合わせを試してください。</p>';
                }
            };

            const showLinkContent = (result) => {
                modalContent.innerHTML = result.content;
                modal.style.display = 'block';

                if (result.isCorrect === 'A' && !foundFactA) {
                    foundFactA = true;
                    resultText.textContent = '発見！探査機の名前は「ジオット」だ。';
                    resultText.className = 'result-text success';
                    missionText.textContent = 'ミッション(2/2): 「1910年の彗星と共に生まれた有名作家」の名前を見つけ出せ。';
                    hintContent.style.display = 'none'; // ヒントを一旦隠す
                } else if (result.isCorrect === 'B' && !foundFactB) {
                    foundFactB = true;
                    resultText.textContent = '発見！作家の名前は「マーク・トウェイン」だ。';
                    resultText.className = 'result-text success';
                }

                if (foundFactA && foundFactB && !stages[stageIndex].completed) {
                    resultText.textContent = '成功！キーワードを駆使して、情報の海から答えを見つけ出した。しかし、AIならもっと簡単かもしれない...';
                    markStageComplete(stageIndex);
                }
            };

            searchBtn.addEventListener('click', executeSearch);
            searchInput.addEventListener('keydown', e => e.key === 'Enter' && executeSearch());
            modal.querySelector('.window-close-btn').addEventListener('click', () => modal.style.display = 'none');
            
            updateHint(); // 初期ヒントを設定
        }
    });

// (ステージ8以降の定義が続く...)
    // Stage 8: AI Chat
    stages.push({
        id: 'stage8',
        title: 'ステージ8: AIとの対話の時代',
        completed: false,
        isComplete: () => stages[18].completed,
        content: `
            <h2>ステージ8: AIとの対話の時代</h2>
            <p class="mission-text">ミッション: AIアシスタントに、この彗星について質問し、新たな知見を得る。<br>例:「76年周期の彗星について教えて」「1910年のデータは？」「次はいつ？」「1910年と1986年のデータを比較して」</p>
            
            <div id="chat-window">
                <div id="chat-history">
                    <div class="message ai-message">こんにちは。私に何でも聞いてください。</div>
                </div>
                <div class="chat-input-area">
                    <input type="text" id="chat-input" placeholder="メッセージを入力...">
                    <button class="action-btn" id="chat-send">送信</button>
                </div>
            </div>
            
            <p class="result-text" id="s8-result"></p>
        `,
        init: () => {
            const stageIndex = 18;
            const chatHistory = document.getElementById('chat-history');
            const chatInput = document.getElementById('chat-input');
            const chatSendBtn = document.getElementById('chat-send');
            const resultText = document.getElementById('s8-result');

            const addMessage = (text, sender) => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${sender}-message`;
                messageDiv.textContent = text;
                chatHistory.appendChild(messageDiv);
                chatHistory.scrollTop = chatHistory.scrollHeight; // 自動スクロール
            };

            const getAiResponse = (userInput) => {
                const input = userInput.toLowerCase();
                if (input.includes('比較') || input.includes('変化')) {
                    if (!stages[stageIndex].completed) {
                        resultText.textContent = '成功！AIは単に情報を探すだけでなく、問いに対してデータを分析し、新たな知見を生み出すパートナーとなった。';
                        resultText.className = 'result-text success';
                        markStageComplete(stageIndex);
                    }
                    return "分析中... 1910年と1986年の観測データを比較した結果、惑星の重力の影響により軌道に0.02%のわずかな変化が見られます。これは新しい洞察です。";
                }
                if (input.includes('1910')) {
                    return "1910年の観測記録:\n{ cycle_76_years, obs_by: 'Observatory Alpha', data: [1.2, 5.5, 3.1, ...] }";
                }
                if (input.includes('次') || input.includes('いつ')) {
                    return "軌道計算によると、次回の近日点通過は2061年頃と予測されます。観測に適した月は7月、主な観測方向は北の空です。";
                }
                if (input.includes('教え') || input.includes('概要')) {
                    return "この彗星は、約76年の周期で太陽の周りを公転する天体です。その記録は古代から残っており、人類の天文学史と深く関わっています。";
                }
                return "すみません、よく理解できませんでした。もう少し違う聞き方を試していただけますか？";
            };

            const handleChatSubmit = () => {
                const userText = chatInput.value;
                if (!userText.trim()) return;

                addMessage(userText, 'user');
                chatInput.value = '';

                setTimeout(() => {
                    const aiResponse = getAiResponse(userText);
                    addMessage(aiResponse, 'ai');
                }, 1000); // AIが考えている感を出すために1秒遅らせる
            };

            chatSendBtn.addEventListener('click', handleChatSubmit);
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    handleChatSubmit();
                }
            });
        }
    });

    // (ステージ8 の定義の後に追加)

    // Stage 9: Social Media / Fake News
    stages.push({
        id: 'stage9',
        title: 'ステージ9: 情報の洪水時代',
        completed: false,
        isComplete: () => stages[19].completed,
        content: `
            <h2>ステージ9: 情報の洪水時代：SNSにあふれる偽りの星</h2>
            <p class="mission-text">ミッション: タイムラインに流れてくる情報を見極め、「信頼できる」「誤情報」「要検証」に分類せよ。3つ正しく分類すればクリア。</p>
            
            <div id="sns-feed">
                <!-- Posts will be generated by JavaScript -->
            </div>
            
            <p class="result-text" id="s9-result">スコア: <span id="s9-score">0</span> / 3</p>
        `,
        init: () => {
            const stageIndex = 19;
            const feed = document.getElementById('sns-feed');
            const scoreDisplay = document.getElementById('s9-score');
            const resultText = document.getElementById('s9-result');
            let score = 0;

            const posts = [
                {
                    user: 'UFOウォッチャーMK',
                    source: '個人ブログ',
                    content: '速報！政府が隠蔽してきた彗星の正体は、異星人の巨大母船だった！この目で見た！ #UFO #アストロジャーニー',
                    correct: 'fake'
                },
                {
                    user: '国立天文台',
                    source: '公式アカウント',
                    content: '【公式発表】周期彗星の光度は現在-2等級に達し、観測の好機です。最適な観測地は南半球、特にオーストラリアです。 #彗星 #公式情報',
                    correct: 'reliable'
                },
                {
                    user: 'トレンドニュース速報',
                    source: 'Webメディア',
                    content: '【驚愕】このままだと彗星は地球に衝突する！？専門家と名乗る人物が警告！詳細は記事をチェック！ #彗星衝突 #拡散希望',
                    correct: 'fake'
                },
                {
                    user: '星好きのケンタ',
                    source: '一般アカウント',
                    content: 'うちの裏山から見えたよ！方角はたぶん北だった気がする！めっちゃキレイ！ #天体観測',
                    correct: 'verify'
                },
                {
                    user: 'サイエンス大好きママ',
                    source: '一般アカウント',
                    content: '専門家の〇〇先生の記事によると、彗星の核は主に氷と塵で出来ているそうです。勉強になるなあ。 #科学 #宇宙',
                    correct: 'reliable'
                }
            ].sort(() => Math.random() - 0.5); // 投稿をシャッフル

            const createPostElement = (post) => {
                const postEl = document.createElement('div');
                postEl.className = 'post';
                postEl.innerHTML = `
                    <div class="post-header">
                        <div class="post-avatar"></div>
                        <div>
                            <div class="post-username">${post.user}</div>
                            <div class="post-source">情報源: ${post.source}</div>
                        </div>
                    </div>
                    <div class="post-content">${post.content}</div>
                    <div class="post-actions">
                        <button class="action-btn btn-reliable" data-judge="reliable">信頼できる</button>
                        <button class="action-btn btn-fake" data-judge="fake">誤情報</button>
                        <button class="action-btn btn-verify" data-judge="verify">要検証</button>
                    </div>
                `;

                postEl.querySelector('.post-actions').addEventListener('click', (e) => {
                    if (e.target.tagName !== 'BUTTON' || postEl.classList.contains('judged')) return;
                    
                    postEl.classList.add('judged');
                    const judge = e.target.dataset.judge;

                    if (judge === post.correct) {
                        score++;
                        scoreDisplay.textContent = score;
                        resultText.textContent = 'ナイス判断！';
                        resultText.className = 'result-text success';
                    } else {
                        resultText.textContent = 'その判断は違うようだ...。';
                        resultText.className = 'result-text fail';
                    }

                    if (score >= 3 && !stages[stageIndex].completed) {
                        resultText.textContent = '成功！情報の洪水の中から真実を見抜く力が、現代を生きる我々には不可欠だ。';
                        resultText.className = 'result-text success';
                        markStageComplete(stageIndex);
                    }
                });
                return postEl;
            };

            posts.forEach(post => feed.appendChild(createPostElement(post)));
        }
    });

    // (ステージ9 の定義の後に追加)

    // (ステージ9 の定義の後に追加)

    // (ステージ9 の定義の後に追加)

    // Stage 10: Mind Interface (FIXED)
    stages.push({
        id: 'stage10',
        title: 'ステージ10: 思考の時代',
        completed: false,
        isComplete: () => stages[20].completed,
        content: `
            <h2>ステージ10: 思考の時代：問いが宇宙を拓く</h2>
            <p class="mission-text">ミッション: キーボードを使わず、思考（クリック）だけでAIと対話し、彗星の謎を探求せよ。</p>
            
            <div id="mind-interface-bg">
                <div id="thought-hub">
                    <div id="thought-core">彗星<br>(意識を向ける)</div>
                    <div id="thought-bubbles-container"></div>
                </div>
                <!-- ★修正点: パネルに閉じるボタンと、内容を入れるコンテナを追加 -->
                <div id="ai-response-panel">
                    <span class="panel-close-btn">&times;</span>
                    <div id="response-content-holder"></div>
                </div>
            </div>
            
            <p class="result-text" id="s10-result"></p>
        `,
        init: () => {
            const stageIndex = 20;
            const bubblesContainer = document.getElementById('thought-bubbles-container');
            const responsePanel = document.getElementById('ai-response-panel');
            const responseContent = document.getElementById('response-content-holder');
            const closeBtn = document.querySelector('.panel-close-btn');
            const resultText = document.getElementById('s10-result');
            let questionsAsked = new Set();

            const questions = [
                { id: 'origin', text: '起源は？', response: '<h3>起源: オールトの雲</h3><p>この彗星は、太陽系の最も外側にある「オールトの雲」で生まれました。何らかの重力的なきっかけで、遥かなる旅を経て内太陽系へとやってきたのです。</p><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Oort_cloud_and_Sedna_orbit-hu.svg/250px-Oort_cloud_and_Sedna_orbit-hu.svg.png" style="float:right; margin-left:10px; background:white; border-radius:3px;">' },
                { id: 'composition', text: '組成は？', response: '<h3>組成: 汚れた雪玉</h3><p>主成分は氷（水、一酸化炭素、二酸化炭素など）と、岩石、塵です。太陽に近づくと、これらの氷が昇華して美しい尾を形成します。</p>' },
                { id: 'history', text: '人類との関わりは？', response: '<h3>歴史との交錯</h3><p>古代の記録から現代の探査まで、この彗星は常に人類の好奇心を刺激してきました。ある時は凶兆と恐れられ、ある時は科学的探求の対象となりました。</p>' },
                { id: 'future', text: '火星をテラフォーミングできる？', response: '<h3>未来の可能性: 火星のテラフォーミング</h3><p>シミュレーションを開始... 完了。<br>理論上、彗星の氷を火星に衝突させれば大気と水を供給できます。しかし、軌道変更の莫大なエネルギーと、衝突の規模を制御する精密技術が最大の課題です。</p>' }
            ];

            // ★修正点: パネルを表示する/隠す関数を定義
            const showResponse = (responseText) => {
                responseContent.innerHTML = responseText;
                responsePanel.style.bottom = '5%';
            };
            const hideResponse = () => {
                responsePanel.style.bottom = '-100%';
            };

            // ★修正点: 閉じるボタンにイベントリスナーを追加
            closeBtn.addEventListener('click', hideResponse);

            questions.forEach((q, index) => {
                const angle = (index / questions.length) * 2 * Math.PI;
                const x = 180 * Math.cos(angle);
                const y = 180 * Math.sin(angle);
                
                const bubble = document.createElement('div');
                bubble.className = 'thought-bubble';
                bubble.textContent = q.text;
                bubble.style.left = `calc(50% + ${x}px - 50px)`;
                bubble.style.top = `calc(50% + ${y}px - 20px)`;

                bubble.addEventListener('click', () => {
                    showResponse(q.response);
                    questionsAsked.add(q.id);

                    if (questionsAsked.size === questions.length && !stages[stageIndex].completed) {
                        resultText.textContent = '成功！思考の速度でAIと対話し、宇宙の謎を探求した。身体的なアクションから解放されたとき、人間の創造性は新たな地平へと達するだろう。';
                        resultText.className = 'result-text success';
                        markStageComplete(stageIndex);
                    }
                });
                bubblesContainer.appendChild(bubble);
            });
        }
    });

    // (ステージ10 の定義の後に追加)

    // Extra 1: Blockchain
    stages.push({
        id: 'extra1',
        title: 'エクストラ1: 分散型天文台ネットワーク',
        completed: false,
        isComplete: () => stages[21].completed,
        content: `
            <h2>エクストラ1: 不変の宇宙記録</h2>
            <p class="mission-text" id="sX1-mission">ミッション(1/3): 世界中から届いた観測データ（トランザクション）を検証せよ。</p>
            
            <div id="blockchain-interface">
                <div id="tx-pool">
                    <div class="transaction valid" data-valid="true"><h5>豪州天文台</h5>RA:15h30m, DEC:-25.1d</div>
                    <div class="transaction valid" data-valid="true"><h5>チリ天文台</h5>RA:15h29m, DEC:-25.0d</div>
                    <div class="transaction invalid" data-valid="false"><h5>(偽)北極点基地</h5>RA:01h00m, DEC:+89.9d</div>
                    <div class="transaction valid" data-valid="true"><h5>ハワイ天文台</h5>RA:15h31m, DEC:-24.9d</div>
                </div>

                <div id="blockchain-actions">
                    <button class="action-btn" id="sX1-consensus">コンセンサスを得る</button>
                    <button class="action-btn" id="sX1-mine">ブロックを生成(Mine)</button>
                </div>

                <div id="blockchain-visualizer">
                    <div class="block">
                        <div class="block-header">Block #1</div>
                        <div class="block-hash">Hash: 0000...a3b1</div>
                    </div>
                </div>
            </div>
            
            <p class="result-text" id="sX1-result"></p>
        `,
        init: () => {
            const stageIndex = 21;
            const missionText = document.getElementById('sX1-mission');
            const resultText = document.getElementById('sX1-result');
            const txPool = document.getElementById('tx-pool');
            const consensusBtn = document.getElementById('sX1-consensus');
            const mineBtn = document.getElementById('sX1-mine');
            const visualizer = document.getElementById('blockchain-visualizer');
            
            let correctSelections = 0;
            const totalTransactions = txPool.children.length;

            // --- Part 1: 検証ロジック ---
            txPool.querySelectorAll('.transaction').forEach(tx => {
                tx.addEventListener('click', () => {
                    if (tx.classList.contains('judged')) return;
                    tx.classList.add('judged');

                    if (tx.dataset.valid === 'true') {
                        tx.classList.add('selected-valid');
                        correctSelections++;
                    } else {
                        tx.classList.add('selected-invalid');
                        correctSelections++; // 偽データを見抜くのも正解
                    }

                    if (correctSelections === totalTransactions) {
                        missionText.textContent = 'ミッション(2/3): 検証済みデータをネットワークにブロードキャストし、合意を形成する。';
                        resultText.textContent = '全データの検証完了。';
                        resultText.className = 'result-text success';
                        consensusBtn.style.display = 'inline-block';
                    }
                });
            });

            // --- Part 2: コンセンサスロジック ---
            consensusBtn.addEventListener('click', () => {
                consensusBtn.disabled = true;
                resultText.textContent = 'コンセンサス形成中...';
                
                // 承認アニメーション
                let approvedCount = 0;
                txPool.querySelectorAll('.selected-valid').forEach(tx => {
                    setTimeout(() => {
                        tx.innerHTML += ' ✅';
                        approvedCount++;
                        if (approvedCount === 3) { // 3つの有効なデータが承認されたら
                            missionText.textContent = 'ミッション(3/3): 合意の取れたデータをブロックにまとめ、チェーンに繋ぐ。';
                            resultText.textContent = 'コンセンサス形成完了！';
                            mineBtn.style.display = 'inline-block';
                        }
                    }, Math.random() * 1000 + 500);
                });
            });

            // --- Part 3: マイニング＆チェイニングロジック ---
            mineBtn.addEventListener('click', () => {
                mineBtn.disabled = true;
                
                const newBlock = document.createElement('div');
                newBlock.className = 'block is-mining';
                newBlock.innerHTML = `<div class="block-header">Block #2</div><div class="block-hash">Hash: 計算中...</div>`;
                
                const chainLink = document.createElement('div');
                chainLink.className = 'chain';
                
                visualizer.appendChild(chainLink);
                visualizer.appendChild(newBlock);

                resultText.textContent = 'ハッシュ計算中...';

                setTimeout(() => {
                    newBlock.classList.remove('is-mining');
                    newBlock.querySelector('.block-hash').textContent = 'Hash: 0000...f4e9';
                    resultText.textContent = '成功！新たなブロックがチェーンに繋がれた。この記録はもはや誰にも改ざんできない！';
                    resultText.className = 'result-text success';
                    markStageComplete(stageIndex);
                }, 2500); // 2.5秒でマイニング完了
            });
        }
    });

    // (エクストラステージ1 の定義の後に追加)

    // Extra 2: Quantum Simulation
    stages.push({
        id: 'extra2',
        title: 'エクストラ2: 可能性の海へ',
        completed: false,
        isComplete: () => stages[22].completed,
        content: `
            <h2>エクストラ2: 可能性の海へ：量子シミュレーション</h2>
            <p class="mission-text" id="sX2-mission">ミッション: 量子シミュレーションを使い、彗星の起源を特定せよ。</p>
            
            <div id="quantum-interface">
                <div id="quantum-controls">
                    <fieldset>
                        <legend>1. 問題設定</legend>
                        <label><input type="checkbox" id="param-sun" checked disabled> 太陽の重力</label>
                        <label><input type="checkbox" id="param-jupiter"> 木星の影響</label>
                        <label><input type="checkbox" id="param-velocity"> 彗星の初期速度</label>
                    </fieldset>
                    <button class="action-btn" id="sX2-simulate" disabled>シミュレーション開始</button>
                    <fieldset id="observation-buttons">
                        <legend>3. 観測</legend>
                        <button class="action-btn" id="sX2-observe">最も確からしい起源を特定</button>
                    </fieldset>
                </div>
                <div id="quantum-canvas-container">
                    <canvas id="quantum-canvas"></canvas>
                </div>
            </div>
            
            <p class="result-text" id="sX2-result"></p>
        `,
        init: () => {
            const stageIndex = 22;
            const resultText = document.getElementById('sX2-result');
            const missionText = document.getElementById('sX2-mission');
            const params = document.querySelectorAll('#quantum-controls input[type="checkbox"]:not([disabled])');
            const simulateBtn = document.getElementById('sX2-simulate');
            const observationBtns = document.getElementById('observation-buttons');
            const observeBtn = document.getElementById('sX2-observe');
            
            const canvas = document.getElementById('quantum-canvas');
            const ctx = canvas.getContext('2d');
            const w = canvas.width = canvas.offsetWidth;
            const h = canvas.height = canvas.offsetHeight;

            let animationFrameId = null;

            // パラメータチェック
            const checkParams = () => {
                const allChecked = Array.from(params).every(p => p.checked);
                simulateBtn.disabled = !allChecked;
            };
            params.forEach(p => p.addEventListener('change', checkParams));

            // --- Part 1: シミュレーション開始（重ね合わせ） ---
            simulateBtn.addEventListener('click', () => {
                simulateBtn.disabled = true;
                missionText.textContent = 'ミッション(2/3): 重ね合わせ状態（可能性の海）から、解を収束させる。';
                resultText.textContent = 'スーパーポジション（重ね合わせ）状態を生成中...';
                
                // 多数の半透明な軌道を描画
                let particles = [];
                for (let i = 0; i < 200; i++) { // 200本の軌道
                    particles.push({
                        x: w / 2, y: h / 2,
                        vx: (Math.random() - 0.5) * 4,
                        vy: (Math.random() - 0.5) * 4,
                        color: `rgba(0, 170, 255, ${Math.random() * 0.1 + 0.05})`,
                    });
                }
                
                const animateSuperposition = () => {
                    particles.forEach(p => {
                        ctx.fillStyle = p.color;
                        ctx.fillRect(p.x, p.y, 2, 2);
                        p.x += p.vx;
                        p.y += p.vy;
                        p.vy += 0.02; // 簡易的な重力
                    });
                    animationFrameId = requestAnimationFrame(animateSuperposition);
                };
                animateSuperposition();

                setTimeout(() => {
                    observationBtns.style.display = 'block';
                    resultText.textContent = '重ね合わせ状態完了。観測してください。';
                }, 2000);
            });

            // --- Part 2: 観測（収束） ---
            observeBtn.addEventListener('click', () => {
                observeBtn.disabled = true;
                cancelAnimationFrame(animationFrameId); // 重ね合わせアニメーションを停止
                missionText.textContent = 'ミッション完了！';
                resultText.textContent = '波動関数を収縮させ、解を特定中...';

                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // 画面を少しずつ暗くする
                let fadeOut = setInterval(() => {
                    ctx.fillRect(0, 0, w, h);
                }, 50);

                setTimeout(() => {
                    clearInterval(fadeOut);
                    ctx.clearRect(0, 0, w, h);

                    // 一本の鮮やかな軌道を描画
                    ctx.beginPath();
                    ctx.moveTo(w/2, h/2);
                    ctx.quadraticCurveTo(w * 0.8, h * 0.1, w * 0.1, h * 0.9);
                    ctx.strokeStyle = '#00aaff';
                    ctx.lineWidth = 3;
                    ctx.shadowColor = '#00aaff';
                    ctx.shadowBlur = 10;
                    ctx.stroke();

                    resultText.textContent = '成功！無数の可能性の中から、最も確からしい一つの解が特定された。これが計算の概念そのものを覆す、量子シミュレーションの力だ。';
                    resultText.className = 'result-text success';
                    markStageComplete(stageIndex);
                }, 1000);
            });
        }
    });

    // (「デジタル記憶の終焉」ステージの定義の後ろに追加)

    // Epilogue
    stages.push({
        id: 'epilogue',
        title: 'エピローグ: 情報の考古学者',
        completed: true,
        isComplete: () => true,
        content: `
            <h2>エピローグ：情報の考古学者</h2>
            <p class="mission-text">ミッション: これまでの旅路を振り返り、情報の変遷をその目に焼き付けよ。</p>
            
            <p>あなたは、一つの情報「76年周期の彗星」を伝えるための、人類の長い旅を終えた。<br>
            各時代の記録を統合し、その変遷を分析した結果がここにある。</p>

            <table id="epilogue-summary">
                <tr>
                    <th>時代</th>
                    <th>記録された情報</th>
                    <th>情報の状態</th>
                </tr>
                <tr>
                    <td>口承の時代</td>
                    <td>「<span class="info-lost">67年</span>ごとに<span class="info-lost">第六の月</span>に...」</td>
                    <td>劣化・変化</td>
                </tr>
                <tr>
                    <td>書記の時代</td>
                    <td>「76」の楔形文字</td>
                    <td class="info-preserved">保存 (ただし解読困難)</td>
                </tr>
                <tr>
                    <td>書庫の時代</td>
                    <td>手書きの写本「76年...星...」</td>
                    <td class="info-preserved">保存 (ただし発見困難)</td>
                </tr>
                <tr>
                    <td>印刷の時代</td>
                    <td>「76年 周期 彗星 再来」</td>
                    <td class="info-preserved">正確な大量複製</td>
                </tr>
                <tr>
                    <td>電気通信の時代</td>
                    <td>符号化された信号「-.-. --- -- . -」</td>
                    <td class="info-preserved">リアルタイム伝達</td>
                </tr>
                <tr>
                    <td>コンピュータの時代</td>
                    <td><code>comet_1910.dat: cycle_76_years</code></td>
                    <td class="info-preserved">検索可能</td>
                </tr>
                <tr>
                    <td>AIとの対話の時代</td>
                    <td>「惑星の重力により軌道に0.02%の変化あり」</td>
                    <td class="info-evolved"><strong>新たな洞察</strong></td>
                </tr>
            </table>

            <p>情報の伝達コストは、時代と共に劇的に低下した。<br>
            かつては特権階級の労役だった「記録」は、今や誰もが瞬時に行える「対話」となった。</p>
            <p>そしてAIは、単に情報を伝えるだけでなく、そこから新たな意味を生み出すパートナーとなったのだ。</p>
            <p>この旅で得た視点こそが、未来の情報社会を生き抜くための羅針盤となるだろう。</p>
            <h3 style="text-align:center; color: var(--accent-color);">クエスト完了、おめでとう！</h3>
        `
        // このステージにはインタラクティブな要素がないため、init関数は不要です
    });

        // (既存のコードの最後に追加)

    // ★★★ここから新しい関数を追加★★★
    const updateEraVisuals = (currentIndex) => {
        const body = document.getElementById('game-body');
        
        // Define era based on stage index
        let era = 'era-ancient'; // Default
        if (currentIndex >= 10 && currentIndex <= 15) { // 写真術からGUIまで
            era = 'era-modern';
        } else if (currentIndex >= 16 && currentIndex <= 24) { // Web検索から最後まで
            era = 'era-digital';
        }
        // Remove old era classes and add the new one
        body.className = '';
        body.classList.add(era);

        // Update timeline dots
        const dots = document.querySelectorAll('.timeline-dot');
        dots.forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === currentIndex) {
                dot.classList.add('active');
            }
            if (stages[index].completed) {
                dot.classList.add('completed');
            }
        });
    };
    
    // Initialize Timeline
    const timelineContainer = document.getElementById('timeline-container');
    stages.forEach((stage, index) => {
        const dot = document.createElement('div');
        dot.className = 'timeline-dot';
        dot.id = `dot-${index}`;
        timelineContainer.appendChild(dot);
    });
    // ★★★ここまで新しい関数を追加★★★
    // --- Initial Game Load ---
    showStage(0);
});