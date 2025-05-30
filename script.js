/* IPv4 学習ツール - JavaScript */

// グローバル変数
let currentQuiz = null;
let currentStep = 1;
let completedSteps = [];
let currentQuizLevel = 'basic';
let quizStats = {
    correct: 0,
    total: 0
};

// 練習問題データベース
const quizDatabase = {
    basic: [
        {
            question: "IPアドレス 192.168.1.100 でサブネットマスク /24 の場合、ネットワークアドレスは？",
            options: ["192.168.1.0", "192.168.1.1", "192.168.1.255", "192.168.0.0"],
            correct: 0,
            explanation: "/24 は最後の8ビットがホスト部なので、ホスト部を0にした 192.168.1.0 がネットワークアドレスです。",
            hint: "ネットワークアドレスは、ホスト部のビットをすべて0にしたアドレスです。"
        },
        {
            question: "サブネットマスク 255.255.255.0 をCIDR記法で表すと？",
            options: ["/16", "/24", "/8", "/32"],
            correct: 1,
            explanation: "255.255.255.0 は24個の連続する1ビットなので、/24 と表現されます。",
            hint: "各オクテットが255の場合、そのオクテットは8ビット分の1を表します。"
        },
        {
            question: "IPアドレス 10.0.0.1 の種類は？",
            options: ["パブリックIP", "プライベートIP", "ループバックアドレス", "マルチキャストアドレス"],
            correct: 1,
            explanation: "10.0.0.0/8 の範囲はプライベートIPアドレスとして予約されています。",
            hint: "10.x.x.x で始まるアドレスはClass Aのプライベートアドレスです。"
        },
        {
            question: "プライベートIPアドレスとして正しいのは？",
            options: ["8.8.8.8", "172.16.1.1", "203.0.113.1", "224.0.0.1"],
            correct: 1,
            explanation: "172.16.0.0～172.31.255.255 はClass Bのプライベートアドレス範囲です。",
            hint: "172.16～172.31の範囲がClass Bプライベートアドレスです。"
        },
        {
            question: "IPアドレス 127.0.0.1 は何のアドレス？",
            options: ["プライベートIP", "パブリックIP", "ループバックアドレス", "ブロードキャストアドレス"],
            correct: 2,
            explanation: "127.x.x.x はループバックアドレスで、自分自身を指します。",
            hint: "127で始まるアドレスは自分自身を指す特別なアドレスです。"
        }
    ],
    intermediate: [
        {
            question: "/26 サブネットで利用可能なホスト数は？",
            options: ["62", "64", "30", "32"],
            correct: 0,
            explanation: "/26 は6ビットのホスト部があるので、2^6 - 2 = 62台のホストが利用可能です。",
            hint: "ホスト部のビット数をnとすると、利用可能ホスト数は 2^n - 2 です。"
        },
        {
            question: "192.168.1.50/26 のブロードキャストアドレスは？",
            options: ["192.168.1.63", "192.168.1.255", "192.168.1.127", "192.168.1.95"],
            correct: 0,
            explanation: "/26では最後のオクテットの上位2ビットがネットワーク部。50は48-63の範囲にあるため、ブロードキャストは63です。",
            hint: "/26では64個ずつのブロックに分かれます。50がどのブロックに属するか考えてみましょう。"
        },
        {
            question: "10.0.0.0/8 ネットワークに含まれるホスト数は？",
            options: ["16,777,214", "16,777,216", "255", "65,534"],
            correct: 0,
            explanation: "/8 は24ビットのホスト部があるので、2^24 - 2 = 16,777,214台です。",
            hint: "Class Aの場合、3つのオクテット全体がホスト部になります。"
        },
        {
            question: "172.16.10.100/20 のネットワークアドレスは？",
            options: ["172.16.0.0", "172.16.10.0", "172.16.8.0", "172.16.16.0"],
            correct: 2,
            explanation: "/20 では第3オクテットの上位4ビットがネットワーク部。10の上位4ビットは8なので、172.16.8.0です。",
            hint: "/20では第3オクテットが16個ずつのブロックに分割されます。"
        },
        {
            question: "255.255.248.0 をCIDR記法で表すと？",
            options: ["/20", "/21", "/22", "/23"],
            correct: 1,
            explanation: "248 = 11111000（バイナリ）なので、21個の連続する1ビット = /21です。",
            hint: "248を2進数に変換すると11111000となります。"
        }
    ],
    advanced: [
        {
            question: "VLSM設計：500台、100台、50台のセグメントに必要な最小サブネットは？",
            options: ["/22, /25, /26", "/23, /25, /26", "/22, /24, /25", "/21, /24, /26"],
            correct: 0,
            explanation: "500台→/22(1022台), 100台→/25(126台), 50台→/26(62台) が最適です。",
            hint: "必要なホスト数以上で、最も効率的なサブネットサイズを選びましょう。"
        },
        {
            question: "192.168.0.0/24を4つの等しいサブネットに分割するには？",
            options: ["/25", "/26", "/27", "/28"],
            correct: 1,
            explanation: "4つに分割するには2ビット必要なので、/24 + 2 = /26です。",
            hint: "4つに分割するには2^2=4なので、2ビット追加が必要です。"
        },
        {
            question: "スーパーネット 192.168.0.0/24 と 192.168.1.0/24 を統合すると？",
            options: ["192.168.0.0/22", "192.168.0.0/23", "192.168.0.0/25", "統合不可"],
            correct: 1,
            explanation: "連続する2つの/24ネットワークは/23に統合できます。",
            hint: "連続する2つのネットワークを統合するとプレフィックス長が1つ短くなります。"
        },
        {
            question: "10.1.16.0/20 に含まれるサブネット 10.1.17.0/24 の数は？",
            options: ["1", "16", "256", "含まれない"],
            correct: 1,
            explanation: "/20は16個の/24サブネットを含みます。10.1.16.0/24から10.1.31.0/24まで。",
            hint: "/20から/24への分割では、2^(24-20) = 16個のサブネットができます。"
        },
        {
            question: "NAT環境で内部に192.168.1.0/24、DMZに192.168.2.0/24を使用。統合ルートエントリは？",
            options: ["192.168.0.0/22", "192.168.0.0/23", "192.168.1.0/23", "統合不可"],
            correct: 2,
            explanation: "192.168.1.0/24と192.168.2.0/24は連続していないため、192.168.1.0/23として統合できます。",
            hint: "連続するアドレスブロックかどうかを確認してください。"
        }
    ],
    'real-world': [
        {
            question: "企業で新しい支店（80台のPC）用ネットワークを設計。既存は192.168.0.0/22使用済み。適切な割り当ては？",
            options: ["192.168.4.0/25", "192.168.5.0/24", "192.168.4.0/24", "192.168.8.0/25"],
            correct: 0,
            explanation: "80台なら/25(126台)で十分。192.168.4.0/25が次の利用可能アドレスです。",
            hint: "既存の192.168.0.0/22は192.168.0.0-192.168.3.255を使用しています。"
        },
        {
            question: "Wi-Fi ゲストネットワークで1日最大30台の接続。セキュリティ重視でどのサブネット？",
            options: ["/25", "/26", "/27", "/28"],
            correct: 2,
            explanation: "/27(30台)が最適。必要最小限のアドレスでセキュリティリスクを最小化。",
            hint: "ゲストネットワークは必要最小限のアドレス数にしてセキュリティを向上させます。"
        },
        {
            question: "データセンターでサーバー間通信用Point-to-Point接続。最適なサブネットは？",
            options: ["/29", "/30", "/31", "/32"],
            correct: 1,
            explanation: "/30はPoint-to-Point接続の標準。2台のルーター用に2つのアドレスを提供。",
            hint: "Point-to-Point接続では通常2台のデバイスのみが必要です。"
        },
        {
            question: "マルチキャスト配信（239.255.1.1）が受信できないクライアント。原因として最も可能性が高いのは？",
            options: ["ルーティング問題", "IGMP未サポート", "ファイアウォール", "すべて可能性あり"],
            correct: 3,
            explanation: "マルチキャスト問題は複合的。IGMP、ルーティング、ファイアウォールすべて確認が必要。",
            hint: "マルチキャストは通常のユニキャストと異なる設定が多数必要です。"
        },
        {
            question: "VPN接続で 10.0.0.0/8 と 172.16.0.0/16 が重複。トラフィック分離方法は？",
            options: ["NAT使用", "VRF設定", "VLAN分離", "すべて有効"],
            correct: 3,
            explanation: "アドレス重複解決にはNAT、VRF、VLAN分離などの技術が利用可能。",
            hint: "プライベートアドレスの重複は企業間VPN接続でよく発生する問題です。"
        }
    ]
};

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('IPv4学習ツールが初期化されました');
    
    // 年度表示の更新
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    // 各種初期化
    generateQuiz();
    updateQuizStats(); // 統計表示を初期化
    updateProgress('basics');
    showLesson(1);
    updateDemoIP();
    
    // サブネットデモの初期化（改良版）
    setTimeout(() => {
        updateSubnetDemo();
    }, 100);
    
    // フォームイベントリスナーの設定
    setupFormEventListener();
    
    console.log('すべての初期化が完了しました');
});

// === 段階的学習機能 ===

/**
 * 指定されたステップのレッスンを表示する
 * @param {number} stepNumber - 表示するステップ番号
 */
function showLesson(stepNumber) {
    // ロックされたステップはクリックできない（ただし、ステップ1は常にアクセス可能）
    if (stepNumber > 1 && !completedSteps.includes(stepNumber - 1)) {
        console.log(`ステップ ${stepNumber} はロックされています。先にステップ ${stepNumber - 1} を完了してください。`);
        alert(`📚 ステップ ${stepNumber - 1} を先に完了してください！`);
        return;
    }
    
    // すべてのレッスンを非表示
    document.querySelectorAll('.lesson-content').forEach(lesson => {
        lesson.classList.remove('active');
    });
    
    // すべてのステップを非アクティブ
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    
    // 指定されたレッスンを表示
    const targetLesson = document.getElementById(`lesson${stepNumber}`);
    const targetStep = document.getElementById(`step${stepNumber}`);
    
    if (targetLesson && targetStep) {
        targetLesson.classList.add('active');
        targetStep.classList.add('active');
        currentStep = stepNumber;
        console.log(`ステップ ${stepNumber} が表示されました`);
    }
}

/**
 * ステップを完了状態にし、次のステップを解放する
 * @param {number} stepNumber - 完了するステップ番号
 */
function completeStep(stepNumber) {
    if (!completedSteps.includes(stepNumber)) {
        completedSteps.push(stepNumber);
        console.log(`ステップ ${stepNumber} が完了しました！`);
    }
    
    // ステップを完了状態にする
    const stepElement = document.getElementById(`step${stepNumber}`);
    if (stepElement) {
        stepElement.classList.add('completed');
        stepElement.classList.remove('locked');
    }
    
    // 次のステップのロックを解除
    const nextStep = stepNumber + 1;
    if (nextStep <= 3) {
        const nextStepElement = document.getElementById(`step${nextStep}`);
        if (nextStepElement) {
            nextStepElement.classList.remove('locked');
            console.log(`ステップ ${nextStep} のロックが解除されました`);
            
            // 成功メッセージを表示
            setTimeout(() => {
                alert(`🎉 ステップ ${stepNumber} 完了！ステップ ${nextStep} に進めます。`);
                showLesson(nextStep);
            }, 500);
        }
    } else {
        // 全ステップ完了
        alert('🎊 おめでとうございます！基礎知識の学習が完了しました！\\n次は「計算ツール」タブで実際に計算してみましょう。');
    }
}

// === デモ機能 ===

/**
 * IPアドレスデモの更新
 */
function updateDemoIP() {
    const inputs = document.querySelectorAll('#lesson1 .demo-input');
    
    // 入力値の検証
    let isValid = true;
    inputs.forEach(input => {
        const value = parseInt(input.value);
        if (isNaN(value) || value < 0 || value > 255) {
            isValid = false;
            input.style.borderColor = '#dc3545';
        } else {
            input.style.borderColor = '#28a745';
        }
    });
    
    const demoResult = document.getElementById('demoResult');
    if (!demoResult) return;
    
    if (!isValid) {
        demoResult.innerHTML = 
            '<span style="color: #dc3545;">⚠️ 各数字は0～255の範囲で入力してください</span>';
        return;
    }
    
    const ip = `${inputs[0].value}.${inputs[1].value}.${inputs[2].value}.${inputs[3].value}`;
    const demoIPElement = document.getElementById('demoIP');
    if (demoIPElement) {
        demoIPElement.textContent = ip;
    }
    
    // IP種類の判定（詳細版）
    let ipType = "パブリックIPアドレス";
    let explanation = "";
    const firstOctet = parseInt(inputs[0].value);
    const secondOctet = parseInt(inputs[1].value);
    
    if (firstOctet === 10) {
        ipType = "プライベートIPアドレス (Class A)";
        explanation = "企業の大規模ネットワークでよく使用されます";
    } else if (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) {
        ipType = "プライベートIPアドレス (Class B)";
        explanation = "中規模ネットワークで使用されます";
    } else if (firstOctet === 192 && secondOctet === 168) {
        ipType = "プライベートIPアドレス (Class C)";
        explanation = "家庭用ルーターで最も一般的です";
    } else if (firstOctet === 127) {
        ipType = "ループバックアドレス";
        explanation = "自分自身を指すテスト用アドレスです";
    } else {
        explanation = "インターネット上で使用される実際のアドレスです";
    }
    
    const demoIPTypeElement = document.getElementById('demoIPType');
    if (demoIPTypeElement) {
        demoIPTypeElement.textContent = ipType;
    }
    
    // 結果の表示を更新
    demoResult.innerHTML = `
        作成されたIPアドレス: <strong style="color: #007bff;">${ip}</strong><br>
        種類: <strong style="color: #28a745;">${ipType}</strong><br>
        <small style="color: #6c757d;">${explanation}</small>
    `;
}

/**
 * サブネットデモの更新（改良版：ビット単位での視覚化対応）
 */
function updateSubnetDemo() {
    const select = document.getElementById('cidr-select') || event.target;
    const prefixLen = parseInt(select.value);
    const visualization = document.getElementById('subnetVisualization');
    const bitVisualization = document.getElementById('subnetBitVisualization');
    const explanation = document.getElementById('subnetExplanation');
    
    if (!visualization || !explanation) return;
    
    const sampleIP = [192, 168, 1, 10];
    const hostBits = 32 - prefixLen;
    
    // === オクテット単位での視覚化 ===
    let html = '<div class="ip-visualization" style="margin: 20px 0;">';
    
    for (let i = 0; i < 4; i++) {
        const octetStartBit = i * 8;
        const octetEndBit = octetStartBit + 7;
        let className = 'ip-octet ';
        
        if (prefixLen > octetEndBit) {
            // このオクテット全体がネットワーク部
            className += 'network-part';
        } else if (prefixLen <= octetStartBit) {
            // このオクテット全体がホスト部
            className += 'host-part';
        } else {
            // このオクテットは部分的にネットワーク部
            className += 'mixed-part';
        }
        
        html += `<div class="${className}">${sampleIP[i]}</div>`;
        if (i < 3) html += '<div style="margin: 0 5px; font-size: 20px;">.</div>';
    }
    html += '</div>';
    visualization.innerHTML = html;
    
    // === ビット単位での詳細視覚化 ===
    if (bitVisualization) {
        let bitHtml = '<div class="bit-visualization" style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0;">';
        bitHtml += '<h5 style="margin: 0 0 10px 0; color: #495057;">🔍 ビット単位での詳細表示</h5>';
        
        // 32ビットを8ビットずつ4グループに分けて表示
        for (let octet = 0; octet < 4; octet++) {
            bitHtml += `<div style="margin: 8px 0;">`;
            bitHtml += `<strong>オクテット${octet + 1} (${sampleIP[octet]}):</strong> `;
            
            const binary = sampleIP[octet].toString(2).padStart(8, '0');
            for (let bit = 0; bit < 8; bit++) {
                const globalBitPos = octet * 8 + bit;
                const isNetworkBit = globalBitPos < prefixLen;
                const bitClass = isNetworkBit ? 'network-bit' : 'host-bit';
                const color = isNetworkBit ? '#28a745' : '#ffc107';
                
                bitHtml += `<span style="
                    display: inline-block; 
                    width: 20px; 
                    height: 20px; 
                    line-height: 20px; 
                    text-align: center; 
                    margin: 1px; 
                    background: ${color}; 
                    color: white; 
                    font-weight: bold; 
                    border-radius: 3px; 
                    font-size: 12px;
                ">${binary[bit]}</span>`;
            }
            bitHtml += '</div>';
        }
        
        bitHtml += `<div style="margin-top: 10px; font-size: 12px; color: #666;">
            <span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 3px; margin-right: 10px;">ネットワーク部</span>
            <span style="background: #ffc107; color: white; padding: 2px 6px; border-radius: 3px;">ホスト部</span>
        </div>`;
        bitHtml += '</div>';
        
        bitVisualization.innerHTML = bitHtml;
    }
    
    // === 詳細説明の更新 ===
    const networkOctets = Math.floor(prefixLen / 8);
    const remainingBits = prefixLen % 8;
    const totalHosts = Math.pow(2, hostBits);
    const usableHosts = Math.max(0, totalHosts - 2);
    
    // サブネットマスクの計算
    let subnetMask = '';
    for (let i = 0; i < 4; i++) {
        let octetValue = 0;
        for (let j = 0; j < 8; j++) {
            const bitPosition = i * 8 + j;
            if (bitPosition < prefixLen) {
                octetValue += Math.pow(2, 7 - j);
            }
        }
        subnetMask += octetValue;
        if (i < 3) subnetMask += '.';
    }
    
    let detailedExplanation = `
        <div style="background: #e9ecef; padding: 15px; border-radius: 8px; margin-top: 10px;">
            <strong>📊 計算結果</strong><br>
            <div style="margin: 10px 0;">
                <strong>CIDR記法：</strong> /${prefixLen}<br>
                <strong>サブネットマスク：</strong> ${subnetMask}<br>
                <strong>ネットワーク部：</strong> ${prefixLen}ビット`;
    
    if (remainingBits > 0) {
        detailedExplanation += ` (${networkOctets}オクテット + ${remainingBits}ビット)`;
    } else {
        detailedExplanation += ` (${networkOctets}オクテット丁度)`;
    }
    
    detailedExplanation += `<br>
                <strong>ホスト部：</strong> ${hostBits}ビット<br>
                <strong>総アドレス数：</strong> ${totalHosts.toLocaleString()}個<br>
                <strong>利用可能ホスト数：</strong> ${usableHosts.toLocaleString()}台
            </div>
        </div>
    `;
    
    // 実用例の追加
    if (prefixLen === 23) {
        detailedExplanation += `
            <div style="background: #d1ecf1; padding: 10px; border-radius: 6px; margin-top: 10px; border-left: 4px solid #17a2b8;">
                <strong>💡 /23の実用例：</strong><br>
                中規模オフィスでよく使用。512台のデバイスを収容可能。<br>
                192.168.0.0/23 → 192.168.0.0～192.168.1.255の範囲
            </div>
        `;
    } else if (prefixLen === 26) {
        detailedExplanation += `
            <div style="background: #d1ecf1; padding: 10px; border-radius: 6px; margin-top: 10px; border-left: 4px solid #17a2b8;">
                <strong>💡 /26の実用例：</strong><br>
                小規模部署や会議室用ネットワーク。62台のデバイスを収容可能。<br>
                192.168.1.0/26 → 192.168.1.1～192.168.1.62の利用可能範囲
            </div>
        `;
    } else if (prefixLen === 30) {
        detailedExplanation += `
            <div style="background: #d1ecf1; padding: 10px; border-radius: 6px; margin-top: 10px; border-left: 4px solid #17a2b8;">
                <strong>💡 /30の実用例：</strong><br>
                ルーター間の接続（Point-to-Point）でよく使用。<br>
                利用可能ホスト：2台のみ（ルーター同士の接続に最適）
            </div>
        `;
    }
    
    explanation.innerHTML = detailedExplanation;
}

/**
 * 基礎的な計算を実行する
 */
function performBasicCalculation() {
    const ip = document.getElementById('calcIP').value.trim();
    const subnet = document.getElementById('calcSubnet').value.trim();
    
    // 入力検証
    if (!ip || !subnet) {
        alert('⚠️ IPアドレスとサブネットマスクの両方を入力してください');
        return;
    }
    
    if (!isValidIPv4(ip)) {
        alert('❌ 有効なIPアドレスを入力してください（例: 192.168.1.100）');
        return;
    }
    
    try {
        const networkInfo = getNetworkInfo(ip, subnet);
        
        if (networkInfo.error) {
            alert('❌ ' + networkInfo.error);
            return;
        }
        
        const resultDiv = document.getElementById('calcResult');
        const detailsDiv = document.getElementById('calcDetails');
        
        if (!resultDiv || !detailsDiv) return;
        
        // 成功メッセージとアニメーション
        detailsDiv.innerHTML = `
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 10px 0;">
                <h5 style="color: #155724; margin: 0 0 10px 0;">✅ 計算完了！</h5>
                <div class="calculation-grid">
                    <div class="calc-item">
                        <strong>🏢 ネットワークアドレス:</strong><br>
                        <span style="color: #007bff; font-family: monospace; font-size: 16px;">${networkInfo.networkAddress}</span>
                    </div>
                    <div class="calc-item">
                        <strong>📡 ブロードキャストアドレス:</strong><br>
                        <span style="color: #dc3545; font-family: monospace; font-size: 16px;">${networkInfo.broadcastAddress}</span>
                    </div>
                    <div class="calc-item">
                        <strong>🔗 利用可能ホスト範囲:</strong><br>
                        <span style="color: #28a745; font-family: monospace; font-size: 14px;">${networkInfo.hostRange}</span>
                    </div>
                    <div class="calc-item">
                        <strong>📊 利用可能ホスト数:</strong><br>
                        <span style="color: #6f42c1; font-size: 18px; font-weight: bold;">${networkInfo.numHosts.toLocaleString()}台</span>
                    </div>
                    <div class="calc-item">
                        <strong>✅ 入力IPの有効性:</strong><br>
                        <span style="color: ${networkInfo.ipInNetwork.includes('有効') ? '#28a745' : '#dc3545'};">${networkInfo.ipInNetwork}</span>
                    </div>
                </div>
            </div>
        `;
        
        resultDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // 成功の効果音（視覚的フィードバック）
        const button = event.target;
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
        
    } catch (error) {
        console.error('計算エラー:', error);
        alert('❌ 計算中にエラーが発生しました。入力値を確認してください。');
    }
}

// === タブ切り替え機能 ===

/**
 * タブを切り替える
 * @param {string} tabName - 切り替え先のタブ名
 */
function switchTab(tabName) {
    // すべてのタブコンテンツを非表示
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // すべてのタブボタンを非アクティブ
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 指定されたタブを表示
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // プログレスバーの更新
    updateProgress(tabName);
}

/**
 * プログレスバーを更新する
 * @param {string} tabName - 現在のタブ名
 */
function updateProgress(tabName) {
    const progressFill = document.getElementById('progressFill');
    if (!progressFill) return;
    
    const progressMap = {
        'basics': 25,
        'calculator': 50,
        'practice': 75,
        'glossary': 100
    };
    
    progressFill.style.width = (progressMap[tabName] || 0) + '%';
}

// === クイズ機能 ===

// === 練習問題機能 ===

/**
 * 難易度レベルを設定する
 * @param {string} level - 設定する難易度レベル (basic, intermediate, advanced, real-world)
 */
function setQuizLevel(level) {
    currentQuizLevel = level;
    
    // レベルボタンのアクティブ状態を更新
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="setQuizLevel('${level}')"]`).classList.add('active');
    
    // 新しいクイズを生成
    generateQuiz();
}

/**
 * 統計情報を更新する
 */
function updateQuizStats() {
    const correctElement = document.getElementById('statsCorrect');
    const totalElement = document.getElementById('statsTotal');
    const accuracyElement = document.getElementById('statsAccuracy');
    
    if (correctElement) correctElement.textContent = quizStats.correct;
    if (totalElement) totalElement.textContent = quizStats.total;
    if (accuracyElement) {
        const accuracy = quizStats.total > 0 ? Math.round((quizStats.correct / quizStats.total) * 100) : 0;
        accuracyElement.textContent = `${accuracy}%`;
    }
}

/**
 * 新しいクイズを生成する
 */
function generateQuiz() {
    const questionsForLevel = quizDatabase[currentQuizLevel];
    if (!questionsForLevel || questionsForLevel.length === 0) {
        console.error(`レベル ${currentQuizLevel} の問題が見つかりません`);
        return;
    }
    
    const randomQuiz = questionsForLevel[Math.floor(Math.random() * questionsForLevel.length)];
    currentQuiz = randomQuiz;
    
    const questionElement = document.getElementById('quizQuestion');
    if (questionElement) {
        questionElement.textContent = randomQuiz.question;
    }
    
    const optionsContainer = document.getElementById('quizOptions');
    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        
        randomQuiz.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'quiz-option';
            optionDiv.textContent = option;
            optionDiv.onclick = () => checkAnswer(index);
            optionsContainer.appendChild(optionDiv);
        });
    }
    
    // UI要素をリセット
    const resultElement = document.getElementById('quizResult');
    if (resultElement) {
        resultElement.style.display = 'none';
    }
    
    // ボタンの状態をリセット
    hideHintAndSolution();
}

/**
 * ヒントを表示する
 */
function showHint() {
    if (!currentQuiz || !currentQuiz.hint) return;
    
    const hintElement = document.getElementById('quizHint');
    if (hintElement) {
        hintElement.innerHTML = `<div class="hint-content">💡 ヒント: ${currentQuiz.hint}</div>`;
        hintElement.style.display = 'block';
    }
}

/**
 * 解答と解説を表示する
 */
function showSolution() {
    if (!currentQuiz) return;
    
    const options = document.querySelectorAll('.quiz-option');
    options.forEach((option, index) => {
        option.onclick = null; // クリックを無効化
        if (index === currentQuiz.correct) {
            option.classList.add('correct');
        }
    });
    
    const resultDiv = document.getElementById('quizResult');
    if (resultDiv) {
        resultDiv.innerHTML = `
            <div class="info">
                <strong>💡 正解:</strong> ${currentQuiz.options[currentQuiz.correct]}
                <br><br>
                <strong>📝 解説:</strong> ${currentQuiz.explanation}
            </div>
        `;
        resultDiv.style.display = 'block';
    }
}

/**
 * ヒントと解答ボタンを非表示にする
 */
function hideHintAndSolution() {
    const hintElement = document.getElementById('quizHint');
    if (hintElement) {
        hintElement.style.display = 'none';
    }
    
    // ボタンの表示状態をリセット
    const hintBtn = document.querySelector('button[onclick="showHint()"]');
    const solutionBtn = document.querySelector('button[onclick="showSolution()"]');
    if (hintBtn) hintBtn.style.display = 'inline-block';
    if (solutionBtn) solutionBtn.style.display = 'inline-block';
}

/**
 * 次の問題を生成する
 */
function nextQuiz() {
    generateQuiz();
}

/**
 * クイズの回答をチェックする
 * @param {number} selectedIndex - 選択された選択肢のインデックス
 */
function checkAnswer(selectedIndex) {
    if (!currentQuiz) return;
    
    const options = document.querySelectorAll('.quiz-option');
    const resultDiv = document.getElementById('quizResult');
    
    if (!resultDiv) return;
    
    // 統計を更新
    quizStats.total++;
    const isCorrect = selectedIndex === currentQuiz.correct;
    if (isCorrect) {
        quizStats.correct++;
    }
    updateQuizStats();
    
    // 選択肢の色分け
    options.forEach((option, index) => {
        option.onclick = null; // クリックを無効化
        if (index === currentQuiz.correct) {
            option.classList.add('correct');
        } else if (index === selectedIndex) {
            option.classList.add('incorrect');
        }
    });
    
    // 結果表示
    resultDiv.innerHTML = `
        <div class="${isCorrect ? 'success' : 'error'}">
            ${isCorrect ? '🎉 正解です！' : '❌ 不正解です。'}
            <br><br>
            <strong>📝 解説：</strong> ${currentQuiz.explanation}
            <br><br>
            <button onclick="nextQuiz()" class="next-quiz-btn">次の問題 →</button>
        </div>
    `;
    resultDiv.style.display = 'block';
}

// === 視覚化機能 ===

/**
 * IP アドレスの視覚的表現を作成する
 * @param {string} ipAddress - IPアドレス
 * @param {number} prefixLen - プレフィックス長
 */
function createIPVisualization(ipAddress, prefixLen) {
    const octets = ipAddress.split('.');
    const visualization = document.getElementById('ipVisualization');
    
    if (!visualization) return;
    
    const networkOctets = Math.floor(prefixLen / 8);
    const partialBits = prefixLen % 8;
    
    let html = '<div class="ip-visualization">';
    
    octets.forEach((octet, index) => {
        let className = 'ip-octet ';
        if (index < networkOctets) {
            className += 'network-part';
        } else if (index === networkOctets && partialBits > 0) {
            className += 'network-part'; // 部分的にネットワーク部
        } else {
            className += 'host-part';
        }
        html += `<div class="${className}">${octet}</div>`;
    });
    
    html += '</div>';
    html += '<p style="text-align: center; margin-top: 10px;">';
    html += '<span style="color: #28a745; font-weight: bold;">緑色：ネットワーク部</span> | ';
    html += '<span style="color: #ffc107; font-weight: bold;">黄色：ホスト部</span>';
    html += '</p>';
    
    visualization.innerHTML = html;
}

// === フォーム処理 ===

/**
 * フォームイベントリスナーを設定する
 */
function setupFormEventListener() {
    const ipForm = document.getElementById('ipForm');
    if (!ipForm) return;
    
    ipForm.addEventListener('submit', function(event) {
        event.preventDefault();
        clearPreviousResults();

        const ipInput = document.getElementById('ip_address').value.trim();
        const subnetInput = document.getElementById('subnet_mask').value.trim();

        if (!ipInput || !subnetInput) {
            displayError("IPアドレスとサブネットマスクの両方を入力してください。");
            return;
        }

        if (!isValidIPv4(ipInput)) {
            displayError(`「${ipInput}」は有効なIPv4アドレスではありません。正しい形式（例：192.168.1.10）で入力してください。`);
            return;
        }

        const networkInfo = getNetworkInfo(ipInput, subnetInput);

        if (networkInfo.error) {
            displayError(networkInfo.error);
        } else {
            displaySuccess("計算が完了しました！");
            displayResults(networkInfo);
        }
    });
}

/**
 * 前回の結果をクリアする
 */
function clearPreviousResults() {
    const errorDisplay = document.getElementById('errorDisplay');
    const successDisplay = document.getElementById('successDisplay');
    const resultsDisplay = document.getElementById('resultsDisplay');
    
    if (errorDisplay) {
        errorDisplay.style.display = 'none';
        errorDisplay.textContent = '';
    }
    
    if (successDisplay) {
        successDisplay.style.display = 'none';
        successDisplay.textContent = '';
    }
    
    if (resultsDisplay) {
        resultsDisplay.style.display = 'none';
    }
}

/**
 * エラーメッセージを表示する
 * @param {string} message - エラーメッセージ
 */
function displayError(message) {
    const errorDiv = document.getElementById('errorDisplay');
    const successDiv = document.getElementById('successDisplay');
    const resultsDiv = document.getElementById('resultsDisplay');
    
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
    
    if (successDiv) {
        successDiv.style.display = 'none';
    }
    
    if (resultsDiv) {
        resultsDiv.style.display = 'none';
    }
}

/**
 * 成功メッセージを表示する
 * @param {string} message - 成功メッセージ
 */
function displaySuccess(message) {
    const successDiv = document.getElementById('successDisplay');
    const errorDiv = document.getElementById('errorDisplay');
    
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
    }
    
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

/**
 * 計算結果を表示する
 * @param {Object} info - ネットワーク情報オブジェクト
 */
function displayResults(info) {
    // 視覚的な表現を生成
    const prefixLen = parseInt(info.cidr.substring(1));
    createIPVisualization(info.ipAddress, prefixLen);
    
    // 結果の各要素を更新
    const resultFields = {
        'resIpAddress': info.ipAddress,
        'resIpType': info.ipType,
        'resSubnetInput': info.subnetInput,
        'resNetworkAddress': info.networkAddress,
        'resBroadcastAddress': info.broadcastAddress,
        'resSubnetMask': info.subnetMask,
        'resCidr': info.cidr,
        'resHostRange': info.hostRange,
        'resNumHosts': info.numHosts.toLocaleString() + ' 台',
        'resIpInNetwork': info.ipInNetwork
    };
    
    Object.entries(resultFields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });

    const resultsDisplay = document.getElementById('resultsDisplay');
    const errorDisplay = document.getElementById('errorDisplay');
    
    if (resultsDisplay) {
        resultsDisplay.style.display = 'block';
    }
    
    if (errorDisplay) {
        errorDisplay.style.display = 'none';
    }
}

// === IP計算ロジック ===

/**
 * IPアドレスを32ビット整数に変換する
 * @param {string} ip - IPアドレス文字列
 * @returns {number|null} 32ビット整数またはnull
 */
function ipToLong(ip) {
    const parts = ip.split('.');
    if (parts.length !== 4) return null;
    let long = 0;
    for (let i = 0; i < 4; i++) {
        const part = parseInt(parts[i], 10);
        if (isNaN(part) || part < 0 || part > 255) return null;
        long = (long << 8) | part;
    }
    return long >>> 0; // Ensure unsigned 32-bit integer
}

/**
 * 32ビット整数をIPアドレス文字列に変換する
 * @param {number} long - 32ビット整数
 * @returns {string|null} IPアドレス文字列またはnull
 */
function longToIp(long) {
    if (long === null || long < 0 || long > 0xFFFFFFFF) return null;
    return `${(long >>> 24)}.${(long >> 16) & 0xFF}.${(long >> 8) & 0xFF}.${long & 0xFF}`;
}

/**
 * IPv4アドレスの形式が正しいかチェックする
 * @param {string} ipStr - IPアドレス文字列
 * @returns {boolean} 有効かどうか
 */
function isValidIPv4(ipStr) {
    if (!/^((\d{1,3}\.){3}\d{1,3})$/.test(ipStr)) return false;
    const parts = ipStr.split('.');
    return parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
    });
}

/**
 * IPアドレスの種類を判定する
 * @param {string} ipStr - IPアドレス文字列
 * @returns {string} IPアドレスの種類
 */
function getIpType(ipStr) {
    const longIp = ipToLong(ipStr);
    if (longIp === null) return "無効なIPアドレスです";

    // Private IP ranges
    // 10.0.0.0 - 10.255.255.255 (10.0.0.0/8)
    if (longIp >= ipToLong('10.0.0.0') && longIp <= ipToLong('10.255.255.255')) return "プライベートIPアドレス (Class A)";
    // 172.16.0.0 - 172.31.255.255 (172.16.0.0/12)
    if (longIp >= ipToLong('172.16.0.0') && longIp <= ipToLong('172.31.255.255')) return "プライベートIPアドレス (Class B)";
    // 192.168.0.0 - 192.168.255.255 (192.168.0.0/16)
    if (longIp >= ipToLong('192.168.0.0') && longIp <= ipToLong('192.168.255.255')) return "プライベートIPアドレス (Class C)";
    
    // Loopback
    if (longIp >= ipToLong('127.0.0.0') && longIp <= ipToLong('127.255.255.255')) return "ループバックアドレス";
    
    // Link-local
    if (longIp >= ipToLong('169.254.0.0') && longIp <= ipToLong('169.254.255.255')) return "リンクローカルアドレス (APIPA)";

    // Reserved addresses
    if (longIp === ipToLong('0.0.0.0')) return "予約済み (ネットワークアドレスとして使われることがある)";
    if (longIp === ipToLong('255.255.255.255')) return "予約済み (ブロードキャストアドレス)";
    if (longIp >= ipToLong('224.0.0.0') && longIp <= ipToLong('239.255.255.255')) return "マルチキャストアドレス";
    if (longIp >= ipToLong('240.0.0.0')) return "予約済み (将来の使用のため)";

    // Default to Public if not in other categories and valid
    if (longIp > ipToLong('0.0.0.0') && longIp < ipToLong('224.0.0.0')) return "パブリックIPアドレス";
    
    return "不明な種類";
}

/**
 * サブネットマスクを解析する
 * @param {string} subnetStr - サブネットマスク文字列
 * @param {number} ipLong - IPアドレスの32ビット整数
 * @returns {Object} 解析結果オブジェクト
 */
function parseSubnetMask(subnetStr, ipLong) {
    let prefixLen = -1;
    let maskLong = -1;

    if (subnetStr.startsWith('/')) {
        const len = parseInt(subnetStr.substring(1), 10);
        if (isNaN(len) || len < 0 || len > 32) return { error: "❌ CIDRプレフィックス長は0から32の間で入力してください。例：/24" };
        prefixLen = len;
        if (len === 0) {
            maskLong = 0;
        } else {
            maskLong = (0xFFFFFFFF << (32 - len)) >>> 0;
        }
    } else if (isValidIPv4(subnetStr)) {
        maskLong = ipToLong(subnetStr);
        if (maskLong === null) return { error: "❌ サブネットマスクの形式が正しくありません。例：255.255.255.0" };
        
        // Validate if it's a valid subnet mask (contiguous 1s followed by 0s)
        let tempMask = maskLong;
        let foundZero = false;
        let validMask = true;
        for (let i = 0; i < 32; i++) {
            if ((tempMask & 0x80000000) === 0) { // Check most significant bit
                foundZero = true;
            } else if (foundZero) {
                validMask = false; // Found a 1 after a 0
                break;
            }
            tempMask <<= 1;
        }
        if (!validMask) return { error: "❌ 無効なサブネットマスクです。連続する1の後に0が続く形式で入力してください。例：255.255.255.0" };

        // Calculate prefix length from dot-decimal mask
        let count = 0;
        tempMask = maskLong;
        while (tempMask !== 0) {
            tempMask = (tempMask << 1) & 0xFFFFFFFF;
            count++;
        }
        prefixLen = count;

    } else {
        return { error: "❌ サブネットマスクの形式が正しくありません。<br>正しい例：<br>• CIDR形式：/24<br>• ドット記法：255.255.255.0" };
    }
    return { prefixLen, maskLong };
}

/**
 * ネットワーク情報を取得する
 * @param {string} ipStr - IPアドレス文字列
 * @param {string} subnetStr - サブネットマスク文字列
 * @returns {Object} ネットワーク情報オブジェクト
 */
function getNetworkInfo(ipStr, subnetStr) {
    const ipLong = ipToLong(ipStr);
    if (ipLong === null) return { error: `❌ 「${ipStr}」は有効なIPv4アドレスではありません。<br>正しい例：192.168.1.10` };

    const maskInfo = parseSubnetMask(subnetStr, ipLong);
    if (maskInfo.error) return { error: maskInfo.error };

    const { prefixLen, maskLong } = maskInfo;

    const networkAddressLong = (ipLong & maskLong) >>> 0;
    const broadcastAddressLong = (networkAddressLong | (~maskLong)) >>> 0;
    
    let numHosts = 0;
    let hostRange = "なし";
    
    if (prefixLen < 31) { // /0 to /30
        numHosts = Math.pow(2, 32 - prefixLen) - 2;
        if (numHosts < 0) numHosts = 0; // Should not happen for prefixLen < 31
        if (numHosts > 0) {
             hostRange = `${longToIp(networkAddressLong + 1)} ～ ${longToIp(broadcastAddressLong - 1)}`;
        }
    } else if (prefixLen === 31) { // RFC 3021
        numHosts = 2; // The two endpoints
        hostRange = `${longToIp(networkAddressLong)} ～ ${longToIp(broadcastAddressLong)}`;
    } else if (prefixLen === 32) {
        numHosts = 1; // The single host address
        hostRange = longToIp(networkAddressLong);
    }

    const ipInNetwork = (ipLong >= networkAddressLong && ipLong <= broadcastAddressLong);
    let ipInNetworkStatus = "";
    if (prefixLen < 31) {
         if (ipLong === networkAddressLong) {
             ipInNetworkStatus = "❌ 無効（ネットワークアドレスのため、ホストには使用できません）";
         } else if (ipLong === broadcastAddressLong) {
             ipInNetworkStatus = "❌ 無効（ブロードキャストアドレスのため、ホストには使用できません）";
         } else if (ipLong > networkAddressLong && ipLong < broadcastAddressLong) {
             ipInNetworkStatus = "✅ 有効（このネットワーク内でホストアドレスとして使用可能です）";
         } else {
             ipInNetworkStatus = "❌ 無効（このネットワークの範囲外です）";
         }
    } else if (prefixLen === 31) { // For /31, both addresses are valid hosts
         ipInNetworkStatus = ipInNetwork ? "✅ 有効（ポイントツーポイント接続で使用可能です）" : "❌ 無効（このネットワークの範囲外です）";
    } else { // prefixLen === 32
         ipInNetworkStatus = (ipLong === networkAddressLong) ? "✅ 有効（ホストアドレスです）" : "❌ 無効（このネットワークの範囲外です）";
    }

    return {
        ipAddress: ipStr,
        ipType: getIpType(ipStr),
        subnetInput: subnetStr,
        networkAddress: longToIp(networkAddressLong),
        broadcastAddress: longToIp(broadcastAddressLong),
        subnetMask: longToIp(maskLong),
        cidr: `/${prefixLen}`,
        hostRange: hostRange,
        numHosts: numHosts,
        ipInNetwork: ipInNetworkStatus,
    };
}
