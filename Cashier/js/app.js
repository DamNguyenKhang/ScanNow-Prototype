// =================== DUMMY DATA ===================
const menuItems = [
    { id: 'm1', name: 'Cà phê Đen Đá', price: 29000, category: 'coffee' },
    { id: 'm2', name: 'Cà phê Sữa Đá', price: 35000, category: 'coffee' },
    { id: 'm3', name: 'Bạc Xỉu', price: 39000, category: 'coffee' },
    { id: 'm4', name: 'Trà Đào Cam Sả', price: 45000, category: 'tea' },
    { id: 'm5', name: 'Trà Vải', price: 45000, category: 'tea' },
    { id: 'm6', name: 'Bánh Sừng Trâu', price: 25000, category: 'food' }
];

let orders = [
    {
        id: 'ORD-001', table: 'B1', status: 'pending', time: '10:15', customer: 'Anh Sơn', note: 'Ít đá 1 ly',
        items: [{ id: 'm1', qty: 2, price: 29000 }, { id: 'm4', qty: 1, price: 45000 }],
        total: 103000
    },
    {
        id: 'ORD-002', table: 'B2', status: 'ready', time: '10:05', customer: '', note: '',
        items: [{ id: 'm2', qty: 1, price: 35000 }],
        total: 35000
    },
    {
        id: 'ORD-003', table: 'B5', status: 'completed', time: '09:45', customer: 'Chị Mai', note: '', payMethod: 'cash', payTime: '09:50',
        items: [{ id: 'm5', qty: 2, price: 45000 }],
        total: 90000
    },
    {
        id: 'ORD-004', table: 'T/A', status: 'ready', time: '10:20', customer: 'Anh Phát', note: 'Mang đi',
        items: [{ id: 'm3', qty: 1, price: 39000 }, { id: 'm6', qty: 1, price: 25000 }],
        total: 64000
    }
];

let transactions = [
    { id: 'TX-1001', orderId: 'ORD-003', amount: 90000, method: 'cash', status: 'success', time: '09:50' }
];

let currentShift = {
    revenue: 90000, cash: 90000, vnpay: 0, momo: 0, orderCount: 1, cancelled: 0
};

// =================== UTILS ===================
const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
function generateId(prefix = 'ORD') { return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`; }

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const icons = { info: 'info', success: 'check_circle', error: 'error' };
    const colors = { info: 'bg-blue-50 text-blue-800 border-blue-200', success: 'bg-green-50 text-green-800 border-green-200', error: 'bg-red-50 text-red-800 border-red-200' };

    toast.className = `flex items-center gap-2 p-3 rounded-lg border shadow-lg view-transition pointer-events-auto ${colors[type]}`;
    toast.innerHTML = `<span class="material-symbols-outlined text-[20px]">${icons[type]}</span><span class="font-medium text-sm">${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// Global state
let currentView = 'orders';
let activeOrderForPayment = null;
let currentPayMethod = 'cash';
let filterStatus = 'all';
let searchQuery = '';

// =================== APP INIT ===================
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
    switchView('orders');
});

function updateClock() {
    const now = new Date();
    document.getElementById('current-time').textContent = now.toLocaleTimeString('vi-VN', { hour12: false });
    document.getElementById('current-date').textContent = now.toLocaleDateString('vi-VN');
}

// =================== NAVIGATION ===================
function switchView(view) {
    currentView = view;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`nav-${view}`)?.classList.add('active');

    const container = document.getElementById('views-container');
    container.innerHTML = '';

    let title = 'Quản lý Đơn Hàng';
    if (view === 'orders') { title = "Quản lý Đơn Hàng"; renderOrdersView(container); }
    if (view === 'create') { title = "Tạo Đơn Thủ Công"; renderCreateView(container); }
    if (view === 'history') { title = "Lịch sử Giao Dịch"; renderHistoryView(container); }
    if (view === 'report') { title = "Báo Cáo Ca Làm"; renderReportView(container); }

    document.getElementById('header-title').textContent = title;
}

// =================== VIEWS ===================

function renderOrdersView(container) {
    container.innerHTML = `
        <div class="flex h-full view-transition">
            <!-- Left: Order List -->
            <div class="w-1/3 min-w-[320px] max-w-[400px] border-r border-border-main bg-white flex flex-col h-full">
                <!-- Filters & Stats -->
                <div class="p-4 border-b border-border-main flex flex-col gap-3">
                    <div class="flex justify-between items-center bg-gray-50 rounded-lg p-2 border border-gray-100">
                        <div class="text-center w-1/2 border-r border-gray-200">
                            <p class="text-[11px] text-text-muted font-bold uppercase tracking-wider">Tổng đơn</p>
                            <p class="text-lg font-display tracking-tight text-primary">${orders.length}</p>
                        </div>
                        <div class="text-center w-1/2">
                            <p class="text-[11px] text-text-muted font-bold uppercase tracking-wider">Doanh thu ca</p>
                            <p class="text-lg font-display tracking-tight text-text-main">${formatVND(currentShift.revenue)}</p>
                        </div>
                    </div>
                    
                    <div class="relative">
                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
                        <input type="text" id="order-search" placeholder="Mã đơn, bàn..." class="w-full pl-9 pr-3 py-2 bg-gray-50 border-transparent rounded-lg text-sm text-text-main focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20" oninput="handleOrderSearch(this.value)">
                    </div>
                    
                    <!-- Chips -->
                    <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        ${['all', 'pending', 'ready', 'completed'].map(s => `
                            <button onclick="setFilterStatus('${s}')" class="px-3 py-1.5 rounded-full text-xs font-bold shrink-0 border transition-colors ${filterStatus === s ? 'bg-text-main text-white border-text-main' : 'bg-white text-text-sub border-gray-200 hover:bg-gray-50'}">
                                ${s === 'all' ? 'Tất cả' : s === 'pending' ? 'Chờ xác nhận' : s === 'ready' ? 'Sẵn sàng' : 'Hoàn thành'}
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <!-- List -->
                <div class="flex-1 overflow-y-auto p-3 flex flex-col gap-2" id="order-list-container">
                    <!-- Populated by JS -->
                </div>
            </div>
            
            <!-- Right: Payment/Detail Panel -->
            <div class="flex-1 bg-background-light flex flex-col h-full" id="order-detail-container">
                <div class="flex-1 flex flex-col items-center justify-center text-text-muted h-full">
                    <span class="material-symbols-outlined text-[64px] mb-4">receipt_long</span>
                    <p class="font-medium text-lg">Chọn một đơn hàng để xem chi tiết</p>
                </div>
            </div>
        </div>
    `;
    renderOrderList();
}

function setFilterStatus(status) {
    filterStatus = status;
    renderOrderList();
}
function handleOrderSearch(val) {
    searchQuery = val.toLowerCase();
    renderOrderList();
}

function renderOrderList() {
    const listContainer = document.getElementById('order-list-container');
    if (!listContainer) return;

    let filtered = orders.filter(o =>
        (filterStatus === 'all' || o.status === filterStatus) &&
        (o.id.toLowerCase().includes(searchQuery) || o.table.toLowerCase().includes(searchQuery))
    );

    if (filtered.length === 0) {
        listContainer.innerHTML = `<div class="text-center p-8 text-text-muted text-sm">Không tìm thấy đơn hàng</div>`;
        return;
    }

    const statusColors = {
        'pending': 'bg-status-pending/10 text-status-pending',
        'preparing': 'bg-blue-100 text-blue-700',
        'ready': 'bg-status-ready/10 text-status-ready',
        'completed': 'bg-gray-100 text-gray-600',
        'cancelled': 'bg-red-100 text-red-600'
    };

    const statusLabels = {
        'pending': 'Chờ XN', 'preparing': 'Đang làm', 'ready': 'Sẵn sàng', 'completed': 'Hoàn thành', 'cancelled': 'Đã hủy'
    };

    listContainer.innerHTML = filtered.map(o => `
        <div onclick="selectOrder('${o.id}')" class="bg-white border rounded-xl p-3 cursor-pointer hover:shadow-md transition-all ${activeOrderForPayment?.id === o.id ? 'order-item-active' : 'border-border-main'}">
            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                    <span class="font-display font-bold text-text-main">${o.table}</span>
                    <span class="text-xs text-text-muted">· ${o.id}</span>
                </div>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${statusColors[o.status] || ''}">${statusLabels[o.status] || o.status}</span>
            </div>
            <div class="flex justify-between items-end mt-3">
                <span class="text-xs text-text-sub flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">schedule</span>${o.time}</span>
                <span class="font-price font-bold text-[15px] text-text-main">${formatVND(o.total)}</span>
            </div>
        </div>
    `).join('');
}

function selectOrder(id) {
    activeOrderForPayment = orders.find(o => o.id === id);
    renderOrderList();
    renderOrderDetail();
}

function renderOrderDetail() {
    const container = document.getElementById('order-detail-container');
    if (!container || !activeOrderForPayment) return;

    const o = activeOrderForPayment;
    const isCompleted = o.status === 'completed';
    const isCancelled = o.status === 'cancelled';

    container.innerHTML = `
        <div class="flex h-full">
            <!-- Order Details -->
            <div class="w-1/2 border-r border-border-main bg-white flex flex-col">
                <div class="p-6 border-b border-border-main flex justify-between items-start">
                    <div>
                        <h2 class="font-display font-extrabold text-2xl mb-1">${o.table}</h2>
                        <p class="text-sm text-text-muted">Mã đơn: ${o.id} • Lên đơn lúc ${o.time}</p>
                    </div>
                </div>
                
                <div class="flex-1 overflow-y-auto p-6 bg-[#FAFAFA]">
                    <h3 class="font-bold text-sm text-text-sub uppercase mb-4">Danh sách món (${o.items.reduce((sum, i) => sum + i.qty, 0)})</h3>
                    <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col gap-4">
                        ${o.items.map(item => {
        const product = menuItems.find(p => p.id === item.id) || { name: 'Món xóa', price: item.price };
        return `
                            <div class="flex justify-between items-center">
                                <div class="flex items-center gap-3">
                                    <div class="size-8 bg-gray-50 rounded-lg flex items-center justify-center font-bold text-text-main text-sm">${item.qty}</div>
                                    <div class="flex flex-col">
                                        <span class="font-bold text-sm">${product.name}</span>
                                        <span class="text-xs text-text-sub">${formatVND(item.price)}</span>
                                    </div>
                                </div>
                                <span class="font-bold text-[15px] font-price">${formatVND(item.price * item.qty)}</span>
                            </div>
                            `;
    }).join('')}
                    </div>
                    
                    ${o.note ? `
                    <div class="mt-4 bg-yellow-50 rounded-lg p-3 border border-yellow-100 text-sm flex gap-2">
                        <span class="material-symbols-outlined text-yellow-600 text-[18px]">speaker_notes</span>
                        <span class="text-yellow-800">${o.note}</span>
                    </div>` : ''}
                </div>
                
                <div class="p-6 bg-white border-t border-border-main flex flex-col gap-2">
                    <div class="flex justify-between text-sm text-text-sub"><span>Tạm tính</span><span>${formatVND(o.total)}</span></div>
                    <div class="flex justify-between text-sm text-text-sub"><span>VAT (0%)</span><span>0 ₫</span></div>
                    <div class="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-gray-200">
                        <span class="font-bold text-text-main">Tổng cộng</span>
                        <span class="font-display font-extrabold text-2xl text-primary">${formatVND(o.total)}</span>
                    </div>
                </div>
            </div>
            
            <!-- Payment Action Panel -->
            <div class="flex-1 bg-white flex flex-col">
                ${isCompleted ? renderPaymentSuccessPanel(o) : isCancelled ? renderCancelledPanel(o) : renderPaymentActionPanel(o)}
            </div>
        </div>
    `;

    // Attach event listeners for payment if needed
    if (!isCompleted && !isCancelled) {
        setupPaymentPanel(o);
    }
}

function renderPaymentSuccessPanel(o) {
    return `
        <div class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F3FEF6]">
            <span class="material-symbols-outlined text-[80px] text-green-500 mb-4">check_circle</span>
            <h2 class="font-display font-bold text-2xl text-text-main mb-2">Đã thanh toán</h2>
            <p class="text-text-sub mb-8">Đơn hàng ${o.id} đã hoàn tất thanh toán.</p>
            
            <div class="bg-white rounded-xl shadow-sm border border-green-100 w-full max-w-sm p-6 text-left mb-8">
                <div class="flex justify-between text-sm mb-3"><span class="text-text-sub">Phương thức</span><span class="font-bold uppercase">${o.payMethod || 'Tiền mặt'}</span></div>
                <div class="flex justify-between text-sm mb-3"><span class="text-text-sub">Thời gian</span><span class="font-bold">${o.payTime || o.time}</span></div>
                <div class="flex justify-between text-sm"><span class="text-text-sub">Tổng tiền</span><span class="font-bold text-primary">${formatVND(o.total)}</span></div>
            </div>
            
            <div class="flex gap-4 w-full max-w-sm">
                <button class="flex-1 py-3 px-4 rounded-xl font-bold bg-white border border-gray-200 text-text-main flex items-center justify-center gap-2 hover:bg-gray-50">
                    <span class="material-symbols-outlined text-[20px]">print</span> In lại Bill
                </button>
                <button onclick="activeOrderForPayment=null; renderOrdersView(document.getElementById('views-container'))" class="flex-1 py-3 px-4 rounded-xl font-bold bg-primary text-white hover:bg-primary/90">
                    Đóng
                </button>
            </div>
        </div>
    `;
}

function renderCancelledPanel(o) {
    return `
         <div class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-red-50">
            <span class="material-symbols-outlined text-[80px] text-red-500 mb-4">cancel</span>
            <h2 class="font-display font-bold text-2xl text-text-main mb-2">Đơn đã hủy</h2>
            <p class="text-text-sub mb-8">Lý do: Khách đổi ý</p>
         </div>
    `;
}

function renderPaymentActionPanel(o) {
    return `
        <div class="flex border-b border-border-main">
            <button onclick="switchPayMethod('cash')" class="flex-1 py-4 text-center font-bold relative ${currentPayMethod === 'cash' ? 'text-primary' : 'text-text-sub'}">
                Tiền mặt
                ${currentPayMethod === 'cash' ? '<div class="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>' : ''}
            </button>
            <button onclick="switchPayMethod('vnpay')" class="flex-1 py-4 text-center font-bold relative ${currentPayMethod === 'vnpay' ? 'text-primary' : 'text-text-sub'}">
                VNPay
                ${currentPayMethod === 'vnpay' ? '<div class="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>' : ''}
            </button>
            <button onclick="switchPayMethod('momo')" class="flex-1 py-4 text-center font-bold relative ${currentPayMethod === 'momo' ? 'text-primary' : 'text-text-sub'}">
                MoMo
                ${currentPayMethod === 'momo' ? '<div class="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>' : ''}
            </button>
        </div>
        
        <div class="flex-1 flex flex-col p-6" id="pay-method-container">
            <!-- Dynamic content -->
        </div>
        
        <div class="p-6 border-t border-border-main flex gap-4 bg-gray-50">
            <button onclick="cancelOrder()" class="py-4 px-6 rounded-xl font-bold bg-white border border-red-200 text-red-600 flex-1 flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
                <span class="material-symbols-outlined text-[20px]">cancel</span> Hủy Đơn
            </button>
            <button id="btn-process-pay" onclick="processPayment()" class="py-4 px-6 rounded-xl font-bold bg-primary text-white flex-[2] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg">
                <span class="material-symbols-outlined">payments</span> Xóa Nợ & Hoàn Tất
            </button>
        </div>
    `;
}

function switchPayMethod(method) {
    currentPayMethod = method;
    if (!activeOrderForPayment) return;
    renderOrderDetail(); // Re-render to update tabs
}

function setupPaymentPanel(o) {
    const container = document.getElementById('pay-method-container');
    const btnProcess = document.getElementById('btn-process-pay');

    if (currentPayMethod === 'cash') {
        btnProcess.innerHTML = `<span class="material-symbols-outlined">payments</span> Thu ${formatVND(o.total)}`;
        btnProcess.classList.remove('opacity-50', 'pointer-events-none');
        btnProcess.onclick = processPayment; // Allow manual payment processing

        container.innerHTML = `
            <div class="flex flex-col gap-6 h-full">
                <div>
                    <label class="text-sm font-bold text-text-sub mb-2 block">Khách đưa</label>
                    <div class="relative">
                        <input type="number" id="cash-input" value="${o.total}" class="w-full text-right text-3xl font-display font-bold py-4 pl-4 pr-12 rounded-xl border border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 bg-blue-50/30 text-primary">
                        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-primary font-bold">₫</span>
                    </div>
                </div>
                
                <div class="grid grid-cols-4 gap-2">
                    <button class="cash-chip py-3 rounded-lg border border-gray-200 font-bold hover:bg-gray-50 hover:border-primary/50 transition" onclick="setCashInput(${o.total})">Vừa đủ</button>
                    <button class="cash-chip py-3 rounded-lg border border-gray-200 font-bold hover:bg-gray-50 hover:border-primary/50 transition" onclick="addCashInput(50000)">+50k</button>
                    <button class="cash-chip py-3 rounded-lg border border-gray-200 font-bold hover:bg-gray-50 hover:border-primary/50 transition" onclick="addCashInput(100000)">+100k</button>
                    <button class="cash-chip py-3 rounded-lg border border-gray-200 font-bold hover:bg-gray-50 hover:border-primary/50 transition" onclick="addCashInput(500000)">+500k</button>
                </div>
                
                <div class="mt-auto bg-gray-50 border border-gray-200 rounded-xl p-5 flex justify-between items-center">
                    <span class="font-bold text-text-sub">Tiền thừa trả khách:</span>
                    <span id="change-amount" class="font-display font-extrabold text-2xl text-green-600">0 ₫</span>
                </div>
            </div>
        `;

        document.getElementById('cash-input').addEventListener('input', (e) => {
            let given = parseInt(e.target.value) || 0;
            let change = given - o.total;
            const changeEl = document.getElementById('change-amount');
            if (change < 0) {
                changeEl.textContent = 'Thiếu tiền';
                changeEl.classList.replace('text-green-600', 'text-red-500');
                btnProcess.classList.add('opacity-50', 'pointer-events-none');
            } else {
                changeEl.textContent = formatVND(change);
                changeEl.classList.replace('text-red-500', 'text-green-600');
                btnProcess.classList.remove('opacity-50', 'pointer-events-none');
            }
        });

    } else if (currentPayMethod === 'vnpay' || currentPayMethod === 'momo') {
        // Change complete button state to polling mode
        btnProcess.innerHTML = `<span class="material-symbols-outlined animate-spin">refresh</span> Đang chờ khách quét...`;
        btnProcess.classList.add('opacity-50', 'pointer-events-none');
        btnProcess.onclick = () => { }; // Disabled until QR triggers

        const isVnpay = currentPayMethod === 'vnpay';
        const color = isVnpay ? 'blue' : 'pink';
        const logoUrl = isVnpay ? 'https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png' : 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png';
        const qrColor = isVnpay ? 'text-blue-600' : 'text-pink-600';

        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full pt-4">
                <img src="${logoUrl}" alt="${currentPayMethod}" class="h-8 object-contain mb-6">
                
                <div class="relative bg-white p-4 rounded-2xl border border-gray-200 shadow-sm inline-block w-[240px] h-[240px] flex items-center justify-center ring-4 ring-${color}-50">
                    <span class="material-symbols-outlined text-[150px] ${qrColor}">qr_code_2</span>
                    <!-- Fake mock QR design -->
                </div>
                
                <div class="mt-6 text-center">
                    <p class="font-bold text-text-main text-lg mb-1">Quét mã để thanh toán</p>
                    <p class="text-text-sub text-sm flex items-center justify-center gap-1">
                        <span class="material-symbols-outlined text-[16px]">timer</span>
                        Mã hết hạn sau <span id="qr-timer" class="font-bold text-red-500">10:00</span>
                    </p>
                </div>

                <div class="w-full mt-auto mt-8 flex flex-col gap-3">
                    <button onclick="simulateQrSuccess()" class="w-full py-3 rounded-xl border border-${color}-200 bg-${color}-50 text-${color}-700 font-bold hover:bg-${color}-100 transition">
                        [Dev] Giả lập Khách quét thành công
                    </button>
                    <button onclick="simulateQrFail()" class="w-full py-3 rounded-xl border border-gray-200 text-text-sub font-bold hover:bg-gray-50 transition">
                        [Dev] Giả lập Lỗi thanh toán
                    </button>
                </div>
            </div>
        `;

        // Start simple timer logic (visual only)
        let timeLeft = 600;
        const timerEl = document.getElementById('qr-timer');
        clearInterval(window.qrInterval);
        window.qrInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) { clearInterval(window.qrInterval); timerEl.textContent = "Hết hạn"; return; }
            let m = Math.floor(timeLeft / 60), s = timeLeft % 60;
            if (timerEl) timerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
        }, 1000);
    }
}

// Window scope functions for fake QR testing
window.setCashInput = (val) => { document.getElementById('cash-input').value = val; document.getElementById('cash-input').dispatchEvent(new Event('input')); }
window.addCashInput = (val) => {
    const el = document.getElementById('cash-input');
    let cur = parseInt(el.value) || 0;
    el.value = cur + val;
    el.dispatchEvent(new Event('input'));
}

window.simulateQrSuccess = () => {
    clearInterval(window.qrInterval);
    processPayment();
}

window.simulateQrFail = () => {
    clearInterval(window.qrInterval);
    const container = document.getElementById('pay-method-container');
    const btnProcess = document.getElementById('btn-process-pay');

    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center">
            <span class="material-symbols-outlined text-[80px] text-red-500 mb-4 animate-bounce">warning</span>
            <h3 class="font-display font-bold text-xl text-text-main mb-2">Thanh toán thất bại</h3>
            <p class="text-text-sub mb-6">Mã lỗi: ERR_TIMEOUT<br>Khách hàng hủy giao dịch hoặc quá hạn.</p>
            <button onclick="setupPaymentPanel(activeOrderForPayment)" class="py-3 px-8 rounded-xl font-bold bg-white border border-gray-200 flex items-center gap-2 hover:bg-gray-50 shadow-sm">
                <span class="material-symbols-outlined">refresh</span> Thử lại QR mới
            </button>
        </div>
    `;

    btnProcess.innerHTML = "Đang lỗi";
    btnProcess.classList.add('opacity-50', 'pointer-events-none');
}

function processPayment() {
    if (!activeOrderForPayment) return;

    // Update order status
    activeOrderForPayment.status = 'completed';
    activeOrderForPayment.payMethod = currentPayMethod;
    activeOrderForPayment.payTime = new Date().toLocaleTimeString('vi-VN', { hour12: false }).substring(0, 5);

    // Add transaction history
    transactions.push({
        id: generateId('TX'),
        orderId: activeOrderForPayment.id,
        amount: activeOrderForPayment.total,
        method: currentPayMethod,
        status: 'success',
        time: activeOrderForPayment.payTime
    });

    // Update shift stats
    currentShift.revenue += activeOrderForPayment.total;
    currentShift[currentPayMethod] += activeOrderForPayment.total;
    currentShift.orderCount++;

    showToast("Thanh toán thành công!", "success");
    renderOrderList();
    renderOrderDetail(); // Wil render success panel
}

function cancelOrder() {
    if (confirm("Bạn có chắc muốn hủy đơn này? Hành động này không thể hoàn tác.")) {
        activeOrderForPayment.status = 'cancelled';
        currentShift.cancelled++;
        showToast("Đã hủy đơn hàng.", "info");
        renderOrderList();
        renderOrderDetail();
    }
}

// =================== CREATE VIEW ===================
function renderCreateView(container) {
    container.innerHTML = `<div class="p-8 flex items-center justify-center h-full text-text-muted">Chức năng đang được cập nhật (Demo: Use Orders list instead)</div>`;
    // For manual prototype: Create a simple layout if required tightly, but let's provide a basic layout
    container.innerHTML = `
        <div class="h-full flex overflow-hidden">
            <!-- Menu grid -->
            <div class="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
                <div class="flex justify-between items-center">
                    <h2 class="font-display font-bold text-xl">Thực đơn</h2>
                    <input type="text" placeholder="Tìm món..." class="px-4 py-2 border rounded-lg bg-white">
                </div>
                <div class="grid grid-cols-3 gap-4">
                    ${menuItems.map(m => `
                        <div class="bg-white p-4 rounded-xl border border-gray-100 hover:shadow shadow-sm cursor-pointer hover:border-primary transition" onclick="showToast('Đã thêm ${m.name} vào giỏ', 'success')">
                            <div class="h-24 bg-gray-50 rounded-lg mb-3 flex items-center justify-center"><span class="material-symbols-outlined text-gray-300 text-[40px]">fastfood</span></div>
                            <h4 class="font-bold text-sm mb-1 line-clamp-1">${m.name}</h4>
                            <span class="font-price font-bold text-primary">${formatVND(m.price)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <!-- Cart space -->
            <div class="w-[350px] bg-white border-l border-border-main p-6 flex flex-col items-center justify-center text-text-muted shadow-[-4px_0_15px_rgba(0,0,0,0.02)]">
                <span class="material-symbols-outlined text-[60px] mb-4 text-gray-200">shopping_cart</span>
                <p>Chưa có món nào</p>
                <button class="mt-8 bg-gray-100 px-6 py-2 rounded-lg font-bold">Thêm món vào đơn dể tiếp tục</button>
            </div>
        </div>
    `;
}

// =================== HISTORY VIEW ===================
function renderHistoryView(container) {
    container.innerHTML = `
        <div class="p-6 h-full flex flex-col gap-6 overflow-hidden">
            <div class="flex justify-between items-center">
                <div class="flex gap-2">
                    <select class="border border-gray-200 rounded-lg px-4 py-2 bg-white text-sm font-medium"><option>Tất cả phương thức</option><option>Tiền mặt</option><option>VNPay</option></select>
                    <select class="border border-gray-200 rounded-lg px-4 py-2 bg-white text-sm font-medium"><option>Thành công</option><option>Thất bại</option></select>
                </div>
                <input type="text" placeholder="Tìm theo mã GD..." class="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm w-[250px]">
            </div>
            
            <div class="bg-white rounded-xl border border-border-main flex-1 overflow-hidden flex flex-col shadow-sm">
                <div class="grid grid-cols-6 p-4 border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-text-sub uppercase tracking-wider">
                    <div class="col-span-1">Mã GD</div>
                    <div class="col-span-1">Mã Đơn</div>
                    <div class="col-span-1">Thời gian</div>
                    <div class="col-span-1 text-right">Số tiền</div>
                    <div class="col-span-1 text-center">Phương thức</div>
                    <div class="col-span-1 text-right">Trạng thái</div>
                </div>
                <div class="flex-1 overflow-y-auto p-2">
                    ${transactions.map(t => `
                        <div class="grid grid-cols-6 p-3 px-2 border-b border-gray-50 items-center hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                            <div class="col-span-1 font-mono text-sm font-bold text-text-main">${t.id}</div>
                            <div class="col-span-1 text-primary text-sm font-medium">${t.orderId}</div>
                            <div class="col-span-1 text-text-sub text-sm">${t.time}</div>
                            <div class="col-span-1 text-right font-price font-bold">${formatVND(t.amount)}</div>
                            <div class="col-span-1 flex justify-center"><span class="px-2 py-0.5 uppercase bg-gray-100 rounded text-[10px] font-bold">${t.method}</span></div>
                            <div class="col-span-1 text-right"><span class="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold inline-flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">check_circle</span>Thành công</span></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// =================== REPORT VIEW ===================
function renderReportView(container) {
    let totalP = currentShift.revenue || 1;
    let cPct = (currentShift.cash / totalP * 100).toFixed(0);
    let vPct = (currentShift.vnpay / totalP * 100).toFixed(0);
    let mPct = (currentShift.momo / totalP * 100).toFixed(0);

    container.innerHTML = `
        <div class="p-6 h-full overflow-y-auto no-scrollbar pb-12">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="font-display font-extrabold text-2xl">Báo cáo Ca: Sáng</h2>
                    <p class="text-text-sub text-sm mt-1">Hôm nay, Thu Ngân 1</p>
                </div>
                <button class="bg-text-main text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-colors flex items-center gap-2 shadow-lg">
                    <span class="material-symbols-outlined">logout</span> Kết thúc Ca
                </button>
            </div>
            
            <div class="grid grid-cols-3 gap-6 mb-6">
                <div class="bg-white p-6 rounded-2xl border border-border-main shadow-sm flex flex-col gap-2">
                    <p class="text-sm font-bold text-text-sub uppercase tracking-wider">Tổng doanh thu</p>
                    <p class="text-4xl font-display font-extrabold text-primary tracking-tight">${formatVND(currentShift.revenue)}</p>
                </div>
                <div class="bg-white p-6 rounded-2xl border border-border-main shadow-sm flex flex-col gap-2">
                    <p class="text-sm font-bold text-text-sub uppercase tracking-wider">Số đơn thành công</p>
                    <p class="text-4xl font-display font-extrabold text-text-main tracking-tight">${currentShift.orderCount}</p>
                </div>
                <div class="bg-white p-6 rounded-2xl border border-border-main shadow-sm flex flex-col gap-2">
                    <p class="text-sm font-bold text-text-sub uppercase tracking-wider">Đơn hủy</p>
                    <p class="text-4xl font-display font-extrabold text-red-500 tracking-tight">${currentShift.cancelled}</p>
                </div>
            </div>
            
            <!-- Payment Methods Split -->
            <div class="bg-white p-6 rounded-2xl border border-border-main shadow-sm mb-6">
                <h3 class="font-bold text-lg mb-4">Phương thức thanh toán</h3>
                <div class="flex w-full h-4 rounded-full overflow-hidden mb-4 bg-gray-100">
                    <div class="bg-green-500 h-full" style="width: ${cPct}%"></div>
                    <div class="bg-blue-500 h-full" style="width: ${vPct}%"></div>
                    <div class="bg-pink-500 h-full" style="width: ${mPct}%"></div>
                </div>
                <div class="grid grid-cols-3 gap-4">
                    <div class="flex items-center gap-3">
                        <div class="size-3 rounded-full bg-green-500"></div>
                        <div class="flex flex-col">
                            <span class="text-sm text-text-sub">Tiền mặt</span>
                            <span class="font-bold">${formatVND(currentShift.cash)}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="size-3 rounded-full bg-blue-500"></div>
                        <div class="flex flex-col">
                            <span class="text-sm text-text-sub">VNPay</span>
                            <span class="font-bold">${formatVND(currentShift.vnpay)}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="size-3 rounded-full bg-pink-500"></div>
                        <div class="flex flex-col">
                            <span class="text-sm text-text-sub">MoMo</span>
                            <span class="font-bold">${formatVND(currentShift.momo)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="flex gap-4">
                <button class="px-6 py-3 rounded-xl border border-gray-200 bg-white font-bold flex items-center gap-2 hover:bg-gray-50 flex-1 justify-center">
                    <span class="material-symbols-outlined">download</span> Xuất báo cáo (Excel)
                </button>
                <button class="px-6 py-3 rounded-xl border border-gray-200 bg-white font-bold flex items-center gap-2 hover:bg-gray-50 flex-1 justify-center text-primary">
                    <span class="material-symbols-outlined">print</span> In Báo cáo Z
                </button>
            </div>
        </div>
    `;
}
