const OrdersComponent = {
    activeFilter: "all",
    activeTableFilter: null,
    searchQuery: "",

    handleTableQuickView: function (tableId) {
        // Find the active order for this table
        const order = orders.find(o => o.table === tableId && o.status !== 'completed' && o.status !== 'cancelled');
        if (order) {
            this.openOrderDetails(order.id);
        }
    },

    render: function (container, params) {
        if (params.table && !params.quickview) this.activeTableFilter = params.table;

        container.innerHTML = `
            <div class="flex flex-col h-full">
                <!-- FILTER TABS (Sticky) -->
                <div class="bg-white border-b border-border-main h-[44px] shrink-0">
                    <div class="flex overflow-x-auto no-scrollbar px-4 h-full items-center gap-6">
                        <button class="filter-tab ${this.activeFilter === 'all' ? 'active border-b-2 border-primary' : ''} flex-none h-full relative" data-status="all">
                            <span class="${this.activeFilter === 'all' ? 'text-primary font-bold' : 'text-text-sub font-medium'} font-display text-[14px]">Tất cả</span>
                        </button>
                        <button class="filter-tab ${this.activeFilter === 'pending' ? 'active border-b-2 border-primary' : ''} flex-none h-full relative" data-status="pending">
                            <span class="${this.activeFilter === 'pending' ? 'text-primary font-bold' : 'text-text-sub font-medium'} font-display text-[14px]">Chờ XN</span>
                        </button>
                        <button class="filter-tab ${this.activeFilter === 'preparing' ? 'active border-b-2 border-primary' : ''} flex-none h-full relative" data-status="preparing">
                            <span class="${this.activeFilter === 'preparing' ? 'text-primary font-bold' : 'text-text-sub font-medium'} font-display text-[14px]">Đang làm</span>
                        </button>
                        <button class="filter-tab ${this.activeFilter === 'ready' ? 'active border-b-2 border-primary' : ''} flex-none h-full relative" data-status="ready">
                            <span class="${this.activeFilter === 'ready' ? 'text-primary font-bold' : 'text-text-sub font-medium'} font-display text-[14px]">Sẵn sàng</span>
                        </button>
                        <button class="filter-tab ${this.activeFilter === 'paying' ? 'active border-b-2 border-primary' : ''} flex-none h-full relative" data-status="paying">
                            <span class="${this.activeFilter === 'paying' ? 'text-primary font-bold' : 'text-text-sub font-medium'} font-display text-[14px]">Thanh toán</span>
                        </button>
                        <button class="filter-tab ${this.activeFilter === 'completed' ? 'active border-b-2 border-primary' : ''} flex-none h-full relative" data-status="completed">
                            <span class="${this.activeFilter === 'completed' ? 'text-primary font-bold' : 'text-text-sub font-medium'} font-display text-[14px]">Xong</span>
                        </button>

                        <div class="w-px h-5 bg-border-main mx-1 shrink-0"></div>
                        <button id="table-filter-btn" class="flex-none px-3 py-1.5 ${this.activeTableFilter ? 'bg-primary text-white' : 'bg-slate-100 text-text-sub'} rounded-lg text-[12px] font-bold flex items-center gap-1.5 active:bg-slate-200">
                            <span class="material-symbols-outlined text-[16px]">pin_drop</span>
                            <span id="active-table-label">${this.activeTableFilter ? `Bàn ${this.activeTableFilter}` : "Tất cả bàn"}</span>
                        </button>
                    </div>
                </div>

                <!-- SEARCH BAR -->
                <div class="px-4 mt-3 shrink-0">
                    <div class="relative group">
                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
                        <input class="w-full h-[40px] pl-10 pr-4 bg-[#F8F7F4] border-1.5 border-border-main rounded-[10px] outline-none placeholder:text-text-muted text-[14px] font-body" placeholder="Tìm bàn, mã đơn..." type="text" id="order-search" value="${this.searchQuery}" />
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto pb-28 pt-3 no-scrollbar">
                    <div class="px-4 space-y-[10px]" id="order-list"></div>
                    <div id="empty-state" class="hidden flex flex-col items-center justify-center py-20 px-4 text-center">
                        <span class="material-symbols-outlined text-[48px] text-border-main mb-3">assignment_late</span>
                        <h3 class="font-display font-bold text-[16px] text-text-sub">Chưa có đơn hàng</h3>
                    </div>
                </div>
            </div>

            <!-- Bottom Sheets/Overlays for Orders -->
            <div id="sheet-overlay-orders" class="fixed inset-0 bg-black/40 z-[60] bottom-sheet-overlay hidden" onclick="OrdersComponent.closeOrderDetails()"></div>
            <div id="order-details-sheet" class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] h-[92%] bg-white bottom-sheet hidden z-[70] rounded-t-[20px] shadow-float flex flex-col overflow-hidden transition-transform">
                <div class="w-full flex justify-center pt-3 pb-2 shrink-0"><div class="w-[36px] h-1 bg-border-main rounded-full"></div></div>
                <div id="order-details-content" class="flex flex-col h-full overflow-hidden"></div>
            </div>

            <!-- Table Filter Sheet -->
            <div id="filter-table-overlay" class="fixed inset-0 bg-black/20 z-[60] hidden transition-opacity" onclick="OrdersComponent.closeFilterTable()"></div>
            <div id="filter-table-sheet" class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] bg-white z-[70] rounded-t-[20px] shadow-sheet p-4 pb-10 hidden transform transition-transform">
                <h3 class="font-display font-bold mb-4">Lọc theo bàn</h3>
                <div class="grid grid-cols-4 gap-2" id="filter-table-grid"></div>
                <button id="clear-table-filter" class="w-full mt-4 py-3 bg-slate-50 text-text-sub text-[13px] font-bold rounded-xl border border-border-main">Xóa lọc bàn</button>
            </div>
        `;

        this.init(container);
    },

    init: function (container) {
        const orderListEl = container.querySelector('#order-list');
        const emptyStateEl = container.querySelector('#empty-state');
        const searchInput = container.querySelector('#order-search');
        const filterTabs = container.querySelectorAll('.filter-tab');

        this.renderOrders(orderListEl, emptyStateEl);

        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.renderOrders(orderListEl, emptyStateEl);
        });

        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => {
                    t.classList.remove('active', 'border-b-2', 'border-primary');
                    t.querySelector('span').classList.remove('text-primary', 'font-bold');
                    t.querySelector('span').classList.add('text-text-sub', 'font-medium');
                });
                tab.classList.add('active', 'border-b-2', 'border-primary');
                tab.querySelector('span').classList.add('text-primary', 'font-bold');
                tab.querySelector('span').classList.remove('text-text-sub', 'font-medium');

                this.activeFilter = tab.dataset.status;
                this.renderOrders(orderListEl, emptyStateEl);
            });
        });

        container.querySelector('#table-filter-btn').onclick = () => this.openFilterTable();
        container.querySelector('#clear-table-filter').onclick = () => this.applyTableFilter(null);
    },

    renderOrders: function (listEl, emptyEl) {
        // Auto-update order status based on item statuses
        orders.forEach(o => {
            if (o.status === 'completed' || o.status === 'cancelled' || o.status === 'paying') return;

            const activeItems = o.items.filter(i => i.status !== 'cancelled');
            if (activeItems.length === 0) {
                o.status = 'cancelled';
                return;
            }

            const allReady = activeItems.every(i => i.status === 'ready');
            const allCompleted = activeItems.every(i => i.status === 'completed');
            const anyPreparing = activeItems.some(i => i.status === 'preparing');
            const anyConfirmed = activeItems.some(i => i.status === 'confirmed');

            if (allCompleted) o.status = 'completed';
            else if (allReady) o.status = 'ready';
            else if (anyPreparing) o.status = 'preparing';
            else if (anyConfirmed) o.status = 'confirmed';
        });

        let filtered = orders.filter(o => {
            const matchesTab = this.activeFilter === 'all' || o.status === this.activeFilter;
            const matchesTable = this.activeTableFilter === null || o.table === this.activeTableFilter;
            const matchesSearch = o.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                o.table.toLowerCase().includes(this.searchQuery.toLowerCase());
            return matchesTab && matchesSearch && matchesTable;
        });

        if (filtered.length === 0) {
            listEl.innerHTML = '';
            emptyEl.classList.remove('hidden');
            return;
        }

        emptyEl.classList.add('hidden');
        listEl.innerHTML = filtered.map(o => {
            const diffMin = Math.floor((new Date() - o.timestamp) / 60000);
            const isUrgent = diffMin >= 10 && o.status !== 'completed' && o.status !== 'paying' && o.status !== 'cancelled';
            const itemsSummary = o.items.map(i => `${i.name} ×${i.qty}`).join(', ');
            const total = o.items.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);

            const accentColorMap = {
                'pending': 'status-pending',
                'confirmed': 'blue-500',
                'preparing': 'primary-orange',
                'ready': 'status-ready',
                'paying': 'purple-500',
                'completed': 'green-500',
                'cancelled': 'slate-300'
            };
            const accentColor = accentColorMap[o.status] || 'slate-200';

            return `
                <div onclick="OrdersComponent.openOrderDetails('${o.id}')" class="bg-white rounded-[20px] shadow-sm relative overflow-hidden transition-all active:scale-[0.98] cursor-pointer hover:shadow-md">
                    <!-- Accent Line Top -->
                    <div class="absolute top-0 left-0 w-full h-1 bg-${accentColor}"></div>
                    
                    <div class="p-4 pt-5 pb-4">
                        <!-- Top Header -->
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex items-center gap-3">
                                <!-- Big Table Badge -->
                                <div class="size-[44px] bg-primary/5 rounded-[12px] flex items-center justify-center">
                                    <span class="font-display font-black text-[18px] text-primary">${o.table}</span>
                                </div>
                                
                                <div>
                                    <div class="flex items-center gap-2 mb-0.5">
                                        <h3 class="font-display font-bold text-[15px] text-text-main leading-none">Bàn ${o.table}</h3>
                                        ${isUrgent ? `
                                            <span class="flex items-center gap-0.5 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded shadow-sm animate-pulse">
                                                <span class="material-symbols-outlined text-[10px] leading-none">warning</span> ${diffMin}'
                                            </span>
                                        ` : ''}
                                    </div>
                                    <div class="flex items-center gap-1.5 text-[12px] text-text-sub font-medium">
                                        <span class="font-mono text-text-muted">${o.id}</span>
                                        <div class="size-1 rounded-full bg-slate-300"></div>
                                        <span>${o.time}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Status -->
                            <div class="shrink-0 flex items-center pl-2">
                                ${getStatusBadge(o.status)}
                            </div>
                        </div>

                        <!-- Order Summary Box -->
                        <div class="bg-[#F8F7F4] rounded-[14px] p-3 mb-4">
                            <p class="text-[13px] text-text-sub font-body leading-relaxed line-clamp-2">${itemsSummary}</p>
                            <div class="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                                <span class="material-symbols-outlined text-[14px] leading-none">restaurant_menu</span>
                                ${o.items.reduce((sum, item) => sum + item.qty, 0)} Phần
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="flex justify-between items-end border-t border-slate-50 pt-3">
                            <div>
                                <span class="text-[10px] text-text-muted block uppercase font-bold tracking-wider mb-0.5">Tổng thanh toán</span>
                                <span class="font-price font-bold text-[20px] text-primary-orange tabular-nums">${formatCurrency(total)}</span>
                            </div>
                            <div class="h-9 px-4 bg-slate-50 text-text-sub text-[13px] font-bold rounded-[10px] flex items-center gap-1">
                                <span class="material-symbols-outlined text-[14px]">visibility</span> Xem
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    cancelOrder: function (id, e) {
        if (e) e.stopPropagation();
        if (confirm("Xác nhận hủy đơn hàng này?")) {
            const order = orders.find(o => o.id === id);
            if (order) {
                order.status = 'cancelled';
                order.items.forEach(i => i.status = 'cancelled');
                showToast(`Đã hủy đơn hàng ${id} thành công!`);
            }
            this.renderOrders(document.getElementById('order-list'), document.getElementById('empty-state'));
            this.closeOrderDetails();
        }
    },

    updateItemStatus: function (orderId, itemIndex, newStatus) {
        const order = orders.find(o => o.id === orderId);
        if (order && order.items[itemIndex]) {
            order.items[itemIndex].status = newStatus;
            showToast(`Cập nhật món: ${order.items[itemIndex].name}`);
            this.openOrderDetails(orderId);
            this.renderOrders(document.getElementById('order-list'), document.getElementById('empty-state'));
        }
    },

    requestPayment: function (orderId) {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'paying';
            showToast(`Đã gửi yêu cầu thanh toán bàn ${order.table}`);
            this.openOrderDetails(orderId);
            this.renderOrders(document.getElementById('order-list'), document.getElementById('empty-state'));
        }
    },

    completePayment: function (orderId) {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'completed';
            order.items.forEach(i => { if (i.status !== 'cancelled') i.status = 'completed'; });

            // Re-open table
            const table = tables.find(t => t.id === order.table);
            if (table) {
                table.status = 'empty';
                delete table.orderId;
                delete table.startTime;
            }

            showToast(`Thanh toán hoàn tất bàn ${order.table}`);
            this.closeOrderDetails();
            this.renderOrders(document.getElementById('order-list'), document.getElementById('empty-state'));
        }
    },

    openOrderDetails: function (id) {
        const o = orders.find(order => order.id === id);
        if (!o) return;

        const content = document.getElementById('order-details-content');
        const subtotal = o.items.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
        const tax = Math.floor(subtotal * 0.08);
        const total = subtotal + tax;

        content.innerHTML = `
            <div class="px-4 pb-4 border-b border-border-main relative shrink-0">
                <div class="flex justify-between items-start mb-1">
                    <span class="font-mono text-[13px] text-text-muted">${o.id}</span>
                    <div class="flex items-center gap-2">
                        ${(o.status !== 'completed' && o.status !== 'cancelled') ? `<button onclick="router.navigate('create-order', {table: '${o.table}', mode: 'add'})" class="h-8 px-3 flex items-center gap-1.5 text-primary bg-primary/5 rounded-full font-bold text-[12px]"><span class="material-symbols-outlined text-[18px]">add</span> Thêm món</button>` : ''}
                        <button class="size-8 flex items-center justify-center text-text-muted hover:bg-slate-50 rounded-full" onclick="OrdersComponent.closeOrderDetails()"><span class="material-symbols-outlined text-[20px]">close</span></button>
                    </div>
                </div>
                <div class="flex justify-between items-end"><h2 class="font-display font-bold text-[22px] text-text-main">Bàn ${o.table}</h2>${getStatusBadge(o.status)}</div>
            </div>
            <div class="flex-1 overflow-y-auto p-4 no-scrollbar">
                <div class="mt-2 space-y-4">
                    <h3 class="font-display font-bold text-[14px] text-text-muted uppercase tracking-wider">Danh sách món ăn</h3>
                    ${o.items.map((item, idx) => `
                        <div class="flex flex-col py-3 border-b border-[#F1EFE9]">
                            <div class="flex justify-between items-start mb-2">
                                <div class="flex gap-3">
                                    <div class="size-5 rounded-full bg-[#F1EFE9] text-text-sub text-[10px] font-bold flex items-center justify-center shrink-0">${idx + 1}</div>
                                    <div>
                                        <div class="font-display font-bold text-[15px] text-text-main">${item.name} ${item.note ? `<span class="text-[10px] text-primary-orange italic ml-2">(${item.note})</span>` : ''}</div>
                                        <div class="text-[12px] text-text-sub">Số lượng: ${item.qty} × ${formatCurrency(item.price)}</div>
                                    </div>
                                </div>
                                ${getStatusBadge(item.status)}
                            </div>
                            
                            ${(item.status === 'pending') ? `
                            <div class="flex justify-end">
                                <button onclick="OrdersComponent.updateItemStatus('${o.id}', ${idx}, 'cancelled')" class="px-3 py-1.5 rounded-lg text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 flex items-center gap-1 active:bg-red-100 transition-colors">
                                    <span class="material-symbols-outlined text-[14px]">close</span> Hủy món
                                </button>
                            </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
                <!-- Simple Summary -->
                <div class="mt-8 pt-6 border-t border-border-main">
                    <div class="flex justify-between items-center text-[14px] mb-2">
                        <span class="text-text-sub">Tạm tính</span>
                        <span class="font-price font-bold text-[16px] text-text-main">${formatCurrency(subtotal)}</span>
                    </div>
                    <div class="flex justify-between items-center text-[14px] mb-4">
                        <span class="text-text-sub">Thuế VAT (8%)</span>
                        <span class="font-price font-bold text-[16px] text-text-main">${formatCurrency(tax)}</span>
                    </div>
                    <div class="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                        <span class="font-display font-bold text-text-main">Tổng thanh toán</span>
                        <span class="font-price font-bold text-[26px] text-primary tracking-tight">${formatCurrency(total)}</span>
                    </div>
                </div>
            </div>
            <div class="p-4 border-t border-border-main bg-white shrink-0 pb-safe">
                <div class="flex gap-3">
                    ${(o.status !== 'completed' && o.status !== 'cancelled' && o.status !== 'paying') ? `
                        <button onclick="OrdersComponent.cancelOrder('${o.id}')" class="flex-1 h-12 bg-white border border-red-500 text-red-500 font-bold rounded-xl active:bg-red-50 text-[14px]">Hủy đơn</button>
                        <button onclick="OrdersComponent.requestPayment('${o.id}')" class="flex-[2] h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all text-[14px]">Yêu cầu thanh toán</button>
                    ` : o.status === 'paying' ? `
                        <button onclick="OrdersComponent.completePayment('${o.id}')" class="w-full h-12 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 active:scale-[0.98] transition-all text-[14px]">Xác nhận đã thanh toán</button>
                    ` : `
                        <div class="w-full h-12 flex items-center justify-center bg-slate-100 text-text-muted font-bold rounded-xl gap-2 text-[14px]">
                            <span class="material-symbols-outlined text-[20px]">check_circle</span> Đơn hàng đã kết thúc
                        </div>
                    `}
                </div>
            </div>
        `;

        document.getElementById('order-details-sheet').classList.remove('hidden');
        document.getElementById('sheet-overlay-orders').classList.remove('hidden');
    },

    closeOrderDetails: function () {
        document.getElementById('order-details-sheet').classList.add('hidden');
        document.getElementById('sheet-overlay-orders').classList.add('hidden');
    },

    openFilterTable: function () {
        const tableList = [...new Set(orders.map(o => o.table))].sort();
        const grid = document.getElementById('filter-table-grid');
        grid.innerHTML = tableList.map(t => `
            <button onclick="OrdersComponent.applyTableFilter('${t}')" class="h-10 rounded-lg border text-[13px] font-bold transition-all ${t === this.activeTableFilter ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-border-main text-text-sub'}">${t}</button>
        `).join('');

        document.getElementById('filter-table-sheet').classList.remove('hidden', 'translate-y-full');
        document.getElementById('filter-table-overlay').classList.remove('hidden');
    },

    closeFilterTable: function () {
        document.getElementById('filter-table-sheet').classList.add('translate-y-full');
        document.getElementById('filter-table-overlay').classList.add('hidden');
        setTimeout(() => document.getElementById('filter-table-sheet').classList.add('hidden'), 300);
    },

    applyTableFilter: function (table) {
        this.activeTableFilter = table;
        const label = document.getElementById('active-table-label');
        if (label) label.innerText = table ? `Bàn ${table}` : "Tất cả bàn";

        const btn = document.getElementById('table-filter-btn');
        if (btn) {
            if (table) {
                btn.classList.replace('bg-slate-100', 'bg-primary');
                btn.classList.replace('text-text-sub', 'text-white');
            } else {
                btn.classList.replace('bg-primary', 'bg-slate-100');
                btn.classList.replace('text-white', 'text-text-sub');
            }
        }

        this.renderOrders(document.getElementById('order-list'), document.getElementById('empty-state'));
        this.closeFilterTable();
    }
};
