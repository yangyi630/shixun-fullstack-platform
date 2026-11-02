class Dashboard {
    constructor() {
        this.token = localStorage.getItem('token');
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.checkLoginStatus();
        this.updateJwtStatus();
        this.updateCacheStatus();
        this.loadAuditLogs();
        this.initRateLimitChart();
        this.startJwtCountdown();
        this.simulateAttackCount();
    }

    setupEventListeners() {
        // 加密按钮
        document.getElementById('encrypt-btn').addEventListener('click', async () => {
            await this.encryptData();
        });

        // 解密按钮
        document.getElementById('decrypt-btn').addEventListener('click', async () => {
            await this.decryptData();
        });

        // 加载用户按钮
        document.getElementById('load-users').addEventListener('click', async () => {
            await this.loadUsers();
        });

        // 重放攻击模拟
        document.getElementById('simulate-replay').addEventListener('click', async () => {
            await this.simulateReplayAttack();
        });

        // 限流演示
        document.getElementById('simulate-rate-limit').addEventListener('click', async () => {
            await this.simulateRateLimit();
        });

        // CSRF测试
        document.getElementById('simulate-csrf').addEventListener('click', async () => {
            await this.simulateCsrfAttack();
        });

        // 登录按钮
        document.getElementById('login-btn').addEventListener('click', () => {
            this.openLoginModal();
        });

        // 关闭模态框
        document.querySelector('.close').addEventListener('click', () => {
            this.closeLoginModal();
        });

        // 登录表单提交
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.login();
        });

        // 注册按钮
        document.getElementById('register-btn').addEventListener('click', async () => {
            await this.register();
        });

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('login-modal');
            if (e.target === modal) {
                this.closeLoginModal();
            }
        });

        // 每5秒更新审计日志
        setInterval(() => {
            this.loadAuditLogs();
        }, 5000);
    }

    openLoginModal() {
        document.getElementById('login-modal').style.display = 'flex';
    }

    closeLoginModal() {
        document.getElementById('login-modal').style.display = 'none';
    }

    async checkLoginStatus() {
        if (this.token) {
            // 验证令牌是否有效
            try {
                const nonce = crypto.randomUUID();
                const timestamp = Date.now().toString();
                const response = await fetch('http://127.0.0.1:8006/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'X-Nonce': nonce,
                        'X-Timestamp': timestamp
                    }
                });

                if (!response.ok) {
                    localStorage.removeItem('token');
                    this.token = null;
                }
            } catch (error) {
                localStorage.removeItem('token');
                this.token = null;
            }
        }
    }

    async login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            alert('请输入用户名和密码');
            return;
        }

        try {
            const nonce = crypto.randomUUID();
            const timestamp = Date.now().toString();
            const response = await fetch('http://127.0.0.1:8006/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Nonce': nonce,
                    'X-Timestamp': timestamp
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.token = data.access_token;
                localStorage.setItem('token', this.token);
                this.updateJwtStatus();
                this.closeLoginModal();
                alert('登录成功');
            } else {
                const error = await response.json();
                alert('登录失败: ' + (error.detail || '用户名或密码错误'));
            }
        } catch (error) {
            alert('登录失败: ' + error.message);
        }
    }

    async register() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            alert('请输入用户名和密码');
            return;
        }

        try {
            const nonce = crypto.randomUUID();
            const timestamp = Date.now().toString();
            const response = await fetch('http://127.0.0.1:8006/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Nonce': nonce,
                    'X-Timestamp': timestamp
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    email: `${username}@example.com`,
                    full_name: username
                })
            });

            if (response.ok) {
                alert('注册成功，请登录');
            } else {
                const error = await response.json();
                alert('注册失败: ' + (error.detail || '用户名已存在'));
            }
        } catch (error) {
            alert('注册失败: ' + error.message);
        }
    }

    async encryptData() {
        const plaintext = document.getElementById('plaintext').value;
        const fieldType = document.getElementById('field-type').value;

        if (!plaintext) {
            alert('请输入明文数据');
            return;
        }

        try {
            const nonce = crypto.randomUUID();
            const timestamp = Date.now().toString();
            const response = await fetch('http://127.0.0.1:8006/api/users/encrypt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                    'X-Nonce': nonce,
                    'X-Timestamp': timestamp
                },
                body: JSON.stringify({
                    data: plaintext,
                    field_type: fieldType
                })
            });

            if (response.ok) {
                const data = await response.json();
                document.getElementById('ciphertext').value = data.encrypted;
                document.getElementById('masked-text').value = data.masked;
            } else {
                const error = await response.json();
                alert('加密失败: ' + error.detail);
            }
        } catch (error) {
            alert('加密失败: ' + error.message);
        }
    }

    async decryptData() {
        const ciphertext = document.getElementById('ciphertext').value;

        if (!ciphertext) {
            alert('请输入密文');
            return;
        }

        try {
            const nonce = crypto.randomUUID();
            const timestamp = Date.now().toString();
            const response = await fetch('http://127.0.0.1:8006/api/users/decrypt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                    'X-Nonce': nonce,
                    'X-Timestamp': timestamp
                },
                body: JSON.stringify({
                    encrypted: ciphertext
                })
            });

            if (response.ok) {
                const data = await response.json();
                document.getElementById('plaintext').value = data.decrypted;
            } else {
                const error = await response.json();
                alert('解密失败: ' + error.detail);
            }
        } catch (error) {
            alert('解密失败: ' + error.message);
        }
    }

    async loadUsers() {
        const container = document.getElementById('users-container');
        container.innerHTML = '<p>加载中...</p>';

        try {
            const nonce = crypto.randomUUID();
            const timestamp = Date.now().toString();
            const response = await fetch('http://127.0.0.1:8006/api/users/me/masked', {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'X-Nonce': nonce,
                    'X-Timestamp': timestamp
                }
            });

            if (response.ok) {
                const user = await response.json();
                container.innerHTML = '';

                const userCard = document.createElement('div');
                userCard.className = 'user-card';
                userCard.innerHTML = `
                    <h4>${user.username}</h4>
                    <p>邮箱: ${user.email}</p>
                    <p>姓名: ${user.full_name}</p>
                    <p class="sensitive-field">手机: ${user.phone || '未设置'}</p>
                    <p class="sensitive-field">身份证: ${user.id_card || '未设置'}</p>
                    <p class="sensitive-field">银行卡: ${user.bank_card || '未设置'}</p>
                `;
                container.appendChild(userCard);
            } else {
                container.innerHTML = '<p>加载失败，请先登录</p>';
            }
        } catch (error) {
            container.innerHTML = '<p>加载失败: ' + error.message + '</p>';
        }
    }

    async simulateReplayAttack() {
        const resultBox = document.getElementById('replay-result');
        resultBox.innerHTML = '<p>准备模拟重放攻击...</p>';

        try {
            // 首先发送正常请求
            const nonce = crypto.randomUUID();
            const timestamp = Date.now().toString();

            const firstResponse = await fetch('http://127.0.0.1:8006/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'X-Nonce': nonce,
                    'X-Timestamp': timestamp
                }
            });

            if (firstResponse.ok) {
                resultBox.innerHTML = '<p class="success">✅ 第一次请求成功</p>';

                // 模拟重放攻击（使用相同的nonce）
                setTimeout(async () => {
                    resultBox.innerHTML += '<p>模拟重放攻击...</p>';
                    
                    const secondResponse = await fetch('http://127.0.0.1:8006/api/users/me', {
                        headers: {
                            'Authorization': `Bearer ${this.token}`,
                            'X-Nonce': nonce,  // 相同的nonce
                            'X-Timestamp': timestamp
                        }
                    });

                    if (!secondResponse.ok && secondResponse.status === 409) {
                        resultBox.innerHTML += '<p class="error">❌ 重放攻击被拒绝 (409)</p>';
                    } else {
                        resultBox.innerHTML += '<p class="error">⚠️ 重放攻击测试异常</p>';
                    }
                }, 1000);
            } else {
                resultBox.innerHTML = '<p class="error">❌ 第一次请求失败，请先登录</p>';
            }
        } catch (error) {
            resultBox.innerHTML = '<p class="error">❌ 测试失败: ' + error.message + '</p>';
        }
    }

    async simulateRateLimit() {
        const resultBox = document.getElementById('rate-limit-result');
        const progressBar = document.getElementById('rate-limit-progress');
        const countElement = document.getElementById('rate-limit-count');

        resultBox.innerHTML = '<p>开始测试限流...</p>';
        progressBar.style.width = '0%';
        countElement.textContent = '0/100';

        let count = 0;
        const maxRequests = 20;

        const sendRequest = async () => {
            if (count >= maxRequests) {
                resultBox.innerHTML += '<p>测试完成</p>';
                return;
            }

            count++;
            const progress = (count / maxRequests) * 100;
            progressBar.style.width = `${progress}%`;
            countElement.textContent = `${count}/${maxRequests}`;

            try {
                const response = await fetch('http://127.0.0.1:8006/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'X-Nonce': crypto.randomUUID(),
                        'X-Timestamp': Date.now().toString()
                    }
                });

                if (response.status === 429) {
                    progressBar.style.background = 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
                    resultBox.innerHTML += '<p class="error">❌ 429 - 限流触发</p>';
                    return;
                } else if (!response.ok) {
                    resultBox.innerHTML += '<p class="error">❌ 请求失败</p>';
                }
            } catch (error) {
                resultBox.innerHTML += '<p class="error">❌ 网络错误</p>';
            }

            // 延迟发送下一个请求
            setTimeout(sendRequest, 100);
        };

        sendRequest();
    }

    async simulateCsrfAttack() {
        const resultBox = document.getElementById('csrf-result');
        resultBox.innerHTML = '<p>测试CSRF保护...</p>';

        try {
            // 1. 无CSRF token的请求
            resultBox.innerHTML += '<p>测试无CSRF token的请求...</p>';
            const nonce1 = crypto.randomUUID();
            const timestamp1 = Date.now().toString();
            const noTokenResponse = await fetch('http://127.0.0.1:8006/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                    'X-Nonce': nonce1,
                    'X-Timestamp': timestamp1
                },
                body: JSON.stringify({
                    current_password: 'test',
                    new_password: 'test123'
                })
            });

            if (!noTokenResponse.ok) {
                resultBox.innerHTML += '<p class="success">✅ 无CSRF token被拒绝</p>';
            } else {
                resultBox.innerHTML += '<p class="error">❌ 无CSRF token请求成功（不安全）</p>';
            }

            // 2. 有CSRF token的请求
            setTimeout(async () => {
                resultBox.innerHTML += '<p>测试有CSRF token的请求...</p>';
                
                // 获取CSRF token
                const csrfToken = this.getCookie('csrf_token');
                
                if (!csrfToken) {
                    resultBox.innerHTML += '<p class="error">❌ 未找到CSRF token</p>';
                    return;
                }

                const nonce2 = crypto.randomUUID();
                const timestamp2 = Date.now().toString();
                const withTokenResponse = await fetch('http://127.0.0.1:8006/api/auth/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`,
                        'X-CSRF-Token': csrfToken,
                        'X-Nonce': nonce2,
                        'X-Timestamp': timestamp2
                    },
                    body: JSON.stringify({
                        current_password: 'test',
                        new_password: 'test123'
                    })
                });

                if (withTokenResponse.ok) {
                    resultBox.innerHTML += '<p class="success">✅ 有CSRF token请求成功</p>';
                } else {
                    resultBox.innerHTML += '<p class="error">❌ 有CSRF token请求失败</p>';
                }
            }, 1000);

        } catch (error) {
            resultBox.innerHTML = '<p class="error">❌ 测试失败: ' + error.message + '</p>';
        }
    }

    async loadAuditLogs() {
        const container = document.getElementById('logs-container');

        try {
            // 模拟审计日志
            const logs = [
                { time: new Date().toLocaleString(), action: '用户登录', ip: '127.0.0.1', result: 'success' },
                { time: new Date(Date.now() - 60000).toLocaleString(), action: '敏感数据访问', ip: '127.0.0.1', result: 'success' },
                { time: new Date(Date.now() - 120000).toLocaleString(), action: '重放攻击拦截', ip: '192.168.1.100', result: 'failure' },
                { time: new Date(Date.now() - 180000).toLocaleString(), action: '限流触发', ip: '192.168.1.101', result: 'failure' },
                { time: new Date(Date.now() - 240000).toLocaleString(), action: '用户注册', ip: '127.0.0.1', result: 'success' }
            ];

            container.innerHTML = '';
            logs.forEach(log => {
                const logItem = document.createElement('div');
                logItem.className = `log-item ${log.result}`;
                logItem.innerHTML = `
                    <div class="log-time">${log.time}</div>
                    <div class="log-content">
                        <span class="log-action">${log.action}</span>
                        <span class="log-ip">${log.ip}</span>
                    </div>
                `;
                container.appendChild(logItem);
            });
        } catch (error) {
            container.innerHTML = '<p>加载日志失败</p>';
        }
    }

    initRateLimitChart() {
        const ctx = document.getElementById('rate-limit-chart').getContext('2d');
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['已使用', '剩余'],
                datasets: [{
                    data: [25, 75],
                    backgroundColor: [
                        '#667eea',
                        'rgba(255, 255, 255, 0.1)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e0e0e0'
                        }
                    },
                    datalabels: {
                        color: '#ffffff',
                        font: {
                            weight: 'bold'
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }

    updateJwtStatus() {
        const statusElement = document.getElementById('jwt-status');
        if (this.token) {
            statusElement.textContent = '已登录';
            statusElement.style.color = '#48bb78';
        } else {
            statusElement.textContent = '未登录';
            statusElement.style.color = '#ef4444';
        }
    }

    updateCacheStatus() {
        const statusElement = document.getElementById('cache-status');
        // 模拟缓存状态
        statusElement.textContent = '正常';
        statusElement.style.color = '#48bb78';
    }

    startJwtCountdown() {
        const countdownElement = document.getElementById('jwt-countdown');
        let seconds = 900; // 15分钟

        setInterval(() => {
            seconds--;
            if (seconds < 0) seconds = 900;
            
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    simulateAttackCount() {
        const countElement = document.getElementById('attack-count');
        let count = 5;
        
        setInterval(() => {
            count += Math.floor(Math.random() * 3);
            countElement.textContent = count.toString();
        }, 30000);
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
}

// 初始化仪表板
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});