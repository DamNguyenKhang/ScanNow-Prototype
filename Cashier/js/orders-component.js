const OrdersComponent = {
    activeFilter: 'all',
    historyFilter: 'all',
    historyFilterStatus: 'all',

    render() {
        let activeOrders = window.appState.orders;

        const totalOrders = window.appState.orders.length;
        const unpaidOrders = window.appState.orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
        const currentRevenue = window.appState.orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalAmount, 0);

        if (this.activeFilter !== 'all') {
            activeOrders = window.appState.orders.filter(o => o.status === this.activeFilter);
        }

        setTimeout(() => {
            if (window.activeOrderViewId) {
                this.viewOrderDetails(window.activeOrderViewId);
            }
        }, 50);

        return `
            <div class="h-full flex relative overflow-hidden bg-[#F3F4F6]">

                <!-- ═══════════════════════════════════════════ -->
                <!-- COLUMN 1 — ORDER LIST                      -->
                <!-- ═══════════════════════════════════════════ -->
                <div class="w-[40%] shrink-0 bg-white border-r border-border-main flex flex-col h-full z-10">
                    <div class="px-3 py-3 border-b border-border-main shrink-0 bg-gray-50/50">
                        <div class="grid grid-cols-2 gap-2 mb-3">
                            <div class="bg-white p-2 text-center rounded-lg border border-gray-200">
                                <span class="block text-[10px] text-text-muted font-bold tracking-wider uppercase">Doanh thu ca</span>
                                <span class="font-bold text-[13px] text-primary">${window.formatPrice(currentRevenue)}</span>
                            </div>
                            <div class="bg-white p-2 text-center rounded-lg border border-gray-200">
                                <span class="block text-[10px] text-text-muted font-bold tracking-wider uppercase">Chưa thanh toán</span>
                                <span class="font-bold text-[13px] text-orange-600">${unpaidOrders} đơn</span>
                            </div>
                        </div>

                        <div class="relative mb-2">
                            <input onkeyup="OrdersComponent.searchOrders(this.value)" type="text"
                                placeholder="Tìm mã đơn, số bàn..."
                                class="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] focus:ring-1 focus:ring-primary outline-none">
                            <span class="material-symbols-outlined absolute left-2.5 top-2 text-text-muted text-[16px]">search</span>
                        </div>

                        <div class="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                            ${[
                { key: 'all', label: `Tất cả (${totalOrders})` },
                { key: 'pending', label: 'Chờ xử lý' },
                { key: 'completed', label: 'Đã thanh toán' },
                { key: 'cancelled', label: 'Đã hủy' },
            ].map(f => `
                                <button onclick="OrdersComponent.setFilter('${f.key}')"
                                    class="px-2.5 py-1 ${this.activeFilter === f.key ? 'bg-primary text-white' : 'bg-gray-100 text-text-sub hover:bg-gray-200'} rounded-full text-[11px] font-bold shrink-0 transition-colors">
                                    ${f.label}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="flex-1 overflow-y-auto p-2 space-y-1.5 pb-20" id="orders-list">
                        ${activeOrders.sort((a, b) => b.time.localeCompare(a.time)).map(order => this.renderOrderCard(order)).join('')}
                        ${activeOrders.length === 0
                ? '<p class="text-center text-text-muted mt-10 text-[13px]">Không có đơn hàng nào.</p>'
                : ''}
                    </div>
                </div>

                <!-- ═══════════════════════════════════════════ -->
                <!-- COLUMNS 2+3 WRAPPER (fixed width = col1)  -->
                <!-- ═══════════════════════════════════════════ -->
                <div class="flex w-[60%] shrink-0 h-full">

                <!-- ═══════════════════════════════════════════ -->
                <!-- COLUMN 2 — ORDER DETAIL                    -->
                <!-- ═══════════════════════════════════════════ -->
                <div class="w-1/2 bg-white border-r border-border-main flex flex-col h-full shrink-0 shadow-sm" id="order-detail-view">
                    <div class="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                        <span class="material-symbols-outlined text-[56px] mb-3 text-gray-300">receipt_long</span>
                        <p class="text-[13px] font-medium">Chọn một đơn để xem chi tiết</p>
                    </div>
                </div>

                <!-- ═══════════════════════════════════════════ -->
                <!-- COLUMN 3 — PAYMENT PANEL                   -->
                <!-- ═══════════════════════════════════════════ -->
                <div class="flex-1 bg-[#F3F4F6] flex flex-col h-full overflow-hidden" id="payment-panel">
                    <div class="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                        <span class="material-symbols-outlined text-[56px] mb-3 text-gray-300">point_of_sale</span>
                        <p class="text-[13px] font-medium">Chưa có thanh toán đang xử lý</p>
                    </div>
                </div>

                </div> <!-- end col2+col3 wrapper -->

            </div>
        `;
    },

    setFilter(f) {
        this.activeFilter = f;
        const temp = document.createElement('div');
        temp.innerHTML = this.render();
        const container = document.getElementById('views-container');
        if (container) container.innerHTML = temp.innerHTML;
        if (window.activeOrderViewId) this.viewOrderDetails(window.activeOrderViewId);
    },

    searchOrders(query) {
        query = query.toLowerCase();
        const list = document.getElementById('orders-list');
        if (!list) return;

        let orders = window.appState.orders;
        if (this.activeFilter !== 'all') {
            orders = orders.filter(o => o.status === this.activeFilter);
        }

        orders = orders.filter(o =>
            o.id.toLowerCase().includes(query) ||
            (o.tableId && o.tableId.toLowerCase().includes(query))
        ).sort((a, b) => b.time.localeCompare(a.time));

        list.innerHTML = orders.map(order => this.renderOrderCard(order)).join('');
        if (orders.length === 0) list.innerHTML = '<p class="text-center text-text-muted mt-10 text-[13px]">Không tìm thấy đơn hàng.</p>';
    },

    renderOrderCard(order) {
        let statusColor = 'bg-yellow-100 text-yellow-700';
        let statusText = 'Chờ xử lý';
        if (order.status === 'completed') { statusColor = 'bg-green-100 text-green-700'; statusText = 'Đã thanh toán'; }
        if (order.status === 'cancelled') { statusColor = 'bg-red-100 text-red-700'; statusText = 'Đã hủy'; }
        const isActive = order.id === window.activeOrderViewId;

        return `
            <div onclick="OrdersComponent.viewOrderDetails('${order.id}')"
                class="p-2.5 bg-white rounded-xl border ${isActive ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-primary/50'} cursor-pointer transition-all shadow-sm group">
                <div class="flex justify-between items-start mb-1.5">
                    <div>
                        <span class="font-bold text-[13px] ${isActive ? 'text-primary' : 'text-text-main group-hover:text-primary'} transition-colors">#${order.id}</span>
                        <span class="block text-[11px] text-text-muted mt-0.5">${order.time}</span>
                    </div>
                    <div class="text-right">
                        <span class="font-bold text-[13px]">${window.formatPrice(order.totalAmount)}</span>
                        ${order.tableId
                ? `<span class="block mt-0.5 px-1.5 py-0 bg-blue-50 text-primary text-[10px] font-bold rounded border border-blue-100">${order.tableId.replace('B', 'Bàn ')}</span>`
                : `<span class="block mt-0.5 px-1.5 py-0 bg-orange-50 text-orange-700 text-[10px] font-bold rounded border border-orange-100">Mang đi</span>`
            }
                    </div>
                </div>
                <div class="flex justify-between items-center border-t border-gray-100 pt-1.5">
                    <span class="text-[11px] text-text-sub truncate w-[160px]">${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</span>
                    <span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${statusColor}">${statusText}</span>
                </div>
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────────────────
    // COLUMN 2 — VIEW ORDER DETAILS
    // ─────────────────────────────────────────────────────────────────────────
    viewOrderDetails(orderId) {
        const order = window.appState.orders.find(o => o.id === orderId);
        if (!order) return;
        window.activeOrderViewId = orderId;

        // highlight selected card
        const listCards = document.getElementById('orders-list');
        if (listCards) {
            Array.from(listCards.children).forEach(card => {
                const isThis = card.innerText.includes(order.id);
                card.classList.toggle('border-primary', isThis);
                card.classList.toggle('ring-2', isThis);
                card.classList.toggle('ring-primary/20', isThis);
                card.classList.toggle('border-gray-200', !isThis);
            });
        }

        const container = document.getElementById('order-detail-view');
        if (!container) return;

        const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
        const vat = subtotal * 0.08;
        const total = subtotal + vat;
        order.totalAmount = total;

        let statusBadge = '';
        if (order.status === 'completed') statusBadge = `<span class="px-2 py-0.5 bg-green-100 text-green-700 font-bold rounded-lg text-xs border border-green-200">Đã thanh toán</span>`;
        else if (order.status === 'cancelled') statusBadge = `<span class="px-2 py-0.5 bg-red-100 text-red-700 font-bold rounded-lg text-xs border border-red-200">Đã hủy</span>`;
        else statusBadge = `<span class="px-2 py-0.5 bg-yellow-100 text-yellow-700 font-bold rounded-lg text-xs border border-yellow-200">Chờ thu tiền</span>`;

        container.innerHTML = `
            <div class="flex flex-col h-full">
                <!-- Header -->
                <div class="px-4 py-3 border-b border-border-main shrink-0 bg-white">
                    <div class="flex items-center justify-between mb-1">
                        <div class="flex items-center gap-2">
                            <h2 class="font-extrabold text-[20px] text-primary leading-none">#${order.id}</h2>
                            ${statusBadge}
                        </div>
                        ${order.status === 'pending' ? `
                            <button onclick="OrdersComponent.confirmCancelOrder('${order.id}')"
                                class="flex items-center gap-1 px-3 py-1.5 text-red-500 hover:bg-red-50 font-bold rounded-lg text-[12px] border border-red-200 transition-colors">
                                <span class="material-symbols-outlined text-[15px]">cancel</span> Hủy đơn
                            </button>
                        ` : ''}
                    </div>
                    <div class="flex items-center gap-3 text-[12px] text-text-muted">
                        <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">schedule</span>${order.time}</span>
                        ${order.tableId
                ? `<span class="flex items-center gap-1 font-bold text-text-main"><span class="material-symbols-outlined text-[14px]">table_restaurant</span>Bàn ${order.tableId.replace('B', '')}</span>`
                : `<span class="flex items-center gap-1 font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded"><span class="material-symbols-outlined text-[14px]">takeout_dining</span>Mang Đi</span>`
            }
                        ${order.customerName ? `<span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">person</span>${order.customerName}</span>` : ''}
                    </div>
                </div>

                <!-- Items -->
                <div class="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/40" id="order-items-list">
                    ${this.renderOrderItemsDetailList(order.items, order.status === 'completed' || order.status === 'cancelled')}
                    ${order.note ? `
                        <div class="p-2.5 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-[12px] flex gap-2">
                            <span class="material-symbols-outlined text-[16px]">edit_note</span>
                            <span><strong>Ghi chú:</strong> ${order.note}</span>
                        </div>
                    ` : ''}
                    ${(order.status !== 'completed' && order.status !== 'cancelled') ? `
                        <button onclick="OrdersComponent.showAddItemModal('${order.id}')"
                            class="w-full py-2 border-2 border-dashed border-gray-300 hover:border-primary text-text-muted hover:text-primary rounded-xl text-[12px] font-bold transition-colors flex items-center justify-center gap-1">
                            <span class="material-symbols-outlined text-[16px]">add</span> Thêm món
                        </button>
                    ` : ''}
                </div>

                <!-- Summary -->
                <div class="p-4 border-t border-border-main shrink-0 bg-white shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.08)]">
                    <div class="space-y-1 mb-3">
                        <div class="flex justify-between text-[12px] text-text-sub">
                            <span>Tạm tính (${order.items.reduce((s, i) => s + i.quantity, 0)} món)</span>
                            <span>${window.formatPrice(subtotal)}</span>
                        </div>
                        <div class="flex justify-between text-[12px] text-text-sub">
                            <span>Phí dịch vụ (0%)</span>
                            <span>0 ₫</span>
                        </div>
                        <div class="flex justify-between text-[12px] text-text-sub">
                            <span>VAT (8%)</span>
                            <span>${window.formatPrice(vat)}</span>
                        </div>
                        <div class="flex justify-between items-end pt-2 border-t border-dashed border-gray-200 mt-1">
                            <span class="font-bold text-[14px]">TỔNG CỘNG</span>
                            <span class="font-black text-[22px] text-primary leading-none" id="col2-total">${window.formatPrice(total)}</span>
                        </div>
                    </div>

                    <!-- CTA -->
                    ${order.status === 'completed' ? `
                        <div class="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-[13px] font-bold">
                            <span class="material-symbols-outlined text-[20px]">check_circle</span>
                            Đã thanh toán · ${order.paymentMethod === 'cash' ? 'Tiền mặt' : 'QR Code'}
                        </div>
                    ` : order.status === 'cancelled' ? `
                        <div class="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[13px] flex items-center gap-2">
                            <span class="material-symbols-outlined text-[20px]">event_busy</span>
                            <span>Đã hủy · ${order.cancelReason || 'Không có lý do'}</span>
                        </div>
                    ` : `
                        <button onclick="OrdersComponent.openPaymentPanel('${order.id}')"
                            class="w-full py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-[14px] transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined">point_of_sale</span> Thanh toán
                        </button>
                    `}
                </div>
            </div>
        `;
    },

    renderOrderItemsDetailList(items, isReadonly = false) {
        if (!items || items.length === 0) return '<p class="text-center text-text-muted mt-4 text-[13px]">Không có món ăn trong đơn.</p>';

        return items.map((item, index) => {
            let statusBadge = '';
            let canCancel = false;
            if (item.status === 'pending') {
                statusBadge = '<span class="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[9px] font-bold">Chờ bếp</span>';
                canCancel = !isReadonly;
            } else if (item.status === 'ready') {
                statusBadge = '<span class="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[9px] font-bold">Lên món</span>';
            } else if (item.status === 'served') {
                statusBadge = '<span class="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-bold">Đã mang ra</span>';
            }

            return `
            <div class="flex items-start gap-2.5 p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition-colors">
                <div class="size-7 bg-blue-50 border border-blue-100 text-primary font-bold rounded-lg flex items-center justify-center shrink-0 text-[13px]">
                    ${item.quantity}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                        <span class="font-bold text-[13px] text-text-main pr-1">${item.name}</span>
                        <span class="font-bold text-[13px] text-text-main shrink-0">${window.formatPrice(item.price * item.quantity)}</span>
                    </div>
                    <span class="text-[11px] text-text-sub">${window.formatPrice(item.price)} / món</span>
                    ${item.note ? `<p class="mt-1 text-[11px] text-orange-600 bg-orange-50 px-2 py-1 rounded italic"><span class="material-symbols-outlined text-[12px] align-middle mr-0.5">edit_note</span>${item.note}</p>` : ''}
                    <div class="flex justify-between items-center mt-2 pt-1.5 border-t border-dashed border-gray-100">
                        ${statusBadge}
                        ${canCancel ? `<button onclick="OrdersComponent.cancelItem(${index})" class="text-[11px] font-bold text-red-500 hover:text-red-700 flex items-center gap-0.5"><span class="material-symbols-outlined text-[13px]">cancel</span>Hủy món</button>` : '<span></span>'}
                    </div>
                </div>
            </div>`;
        }).join('');
    },

    cancelItem(itemIndex) {
        if (!window.activeOrderViewId) return;
        const order = window.appState.orders.find(o => o.id === window.activeOrderViewId);
        if (!order) return;
        order.items.splice(itemIndex, 1);
        if (order.items.length === 0) {
            this.confirmCancelOrder(order.id, 'Đơn trống do xóa hết món.');
        } else {
            this.viewOrderDetails(window.activeOrderViewId);
            window.showToast('Đã hủy món thành công.');
            this.setFilter(this.activeFilter);
        }
    },

    confirmCancelOrder(orderId, defaultRes = '') {
        const order = window.appState.orders.find(o => o.id === orderId);
        if (!order) return;
        const reason = prompt('Nhập lý do hủy đơn hàng (không bắt buộc):', defaultRes);
        if (reason === null) return;
        order.status = 'cancelled';
        order.cancelReason = reason || defaultRes || 'Khách đổi ý';
        if (order.tableId) {
            const table = window.mockTables.find(t => t.id === order.tableId);
            if (table && table.status === 'occupied') {
                const otherActive = window.appState.orders.find(o => o.tableId === table.id && o.status === 'pending' && o.id !== order.id);
                if (!otherActive) table.status = 'empty';
            }
        }
        window.showToast('Đơn hàng đã bị hủy.', 'error');
        // clear payment panel
        const panel = document.getElementById('payment-panel');
        if (panel) panel.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                <span class="material-symbols-outlined text-[56px] mb-3 text-gray-300">point_of_sale</span>
                <p class="text-[13px] font-medium">Chưa có thanh toán đang xử lý</p>
            </div>`;
        this.setFilter(this.activeFilter);
        this.viewOrderDetails(orderId);
    },

    showAddItemModal(orderId) {
        const order = window.appState.orders.find(o => o.id === orderId);
        if (!order) return;
        const overlay = document.createElement('div');
        overlay.id = 'add-item-modal';
        overlay.className = 'fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm';
        const menuHTML = window.mockMenu.map(m => `
            <div class="flex justify-between items-center p-3 border border-border-main rounded-xl mb-2 hover:bg-blue-50 cursor-pointer transition-colors" onclick="OrdersComponent.executeAddItem('${m.id}')">
                <div>
                    <span class="font-bold text-[14px] block">${m.name}</span>
                    <span class="text-sm font-medium text-primary">${window.formatPrice(m.price)}</span>
                </div>
                <div class="size-8 bg-blue-100 text-primary rounded-full flex items-center justify-center"><span class="material-symbols-outlined">add</span></div>
            </div>`).join('');
        overlay.innerHTML = `
            <div class="bg-white rounded-2xl w-full max-w-[380px] flex flex-col overflow-hidden max-h-[80vh]">
                <div class="px-4 py-3 border-b border-border-main flex justify-between items-center bg-gray-50 shrink-0">
                    <h3 class="font-bold text-[16px]">Thêm món — Đơn #${orderId}</h3>
                    <button onclick="document.getElementById('add-item-modal').remove()"><span class="material-symbols-outlined">close</span></button>
                </div>
                <div class="p-3 overflow-y-auto flex-1">${menuHTML}</div>
            </div>`;
        document.body.appendChild(overlay);
    },

    executeAddItem(menuId) {
        if (!window.activeOrderViewId) return;
        const order = window.appState.orders.find(o => o.id === window.activeOrderViewId);
        const menuItem = window.mockMenu.find(m => m.id === menuId);
        if (!order || !menuItem) return;
        const existing = order.items.find(i => i.id === menuId);
        if (existing && existing.status === 'pending') {
            existing.quantity += 1;
        } else {
            order.items.push({ id: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: 1, note: '', status: 'pending' });
        }
        document.getElementById('add-item-modal')?.remove();
        window.showToast('Đã thêm món vào đơn!');
        this.setFilter(this.activeFilter);
    },

    // ─────────────────────────────────────────────────────────────────────────
    // COLUMN 3 — PAYMENT PANEL
    // ─────────────────────────────────────────────────────────────────────────
    openPaymentPanel(orderId) {
        const order = window.appState.orders.find(o => o.id === orderId);
        if (!order) return;
        selectedPaymentMethod = null;
        if (window.qrTimerInterval) clearInterval(window.qrTimerInterval);

        const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
        const vat = subtotal * 0.08;
        const total = subtotal + vat;
        order.totalAmount = total;

        const panel = document.getElementById('payment-panel');
        if (!panel) return;

        panel.innerHTML = `
            <div class="flex flex-col h-full bg-white border-l border-border-main">
                <!-- Panel Header -->
                <div class="px-5 py-4 border-b border-border-main shrink-0 bg-gray-50/80 flex justify-between items-start">
                    <div>
                        <h2 class="font-bold text-[18px] text-text-main leading-tight">Thanh toán</h2>
                        <p class="text-[12px] text-text-muted mt-0.5">Đơn #${order.id} · ${order.tableId ? 'Bàn ' + order.tableId.replace('B', '') : 'Mang đi'}</p>
                    </div>
                    <button onclick="OrdersComponent.closePaymentPanel()" class="text-text-muted hover:text-text-main p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <!-- Order Summary mini -->
                <div class="px-5 py-3 border-b border-dashed border-gray-200 shrink-0 bg-white">
                    <div class="flex justify-between items-center">
                        <span class="text-[13px] text-text-sub font-medium">${order.items.reduce((s, i) => s + i.quantity, 0)} món · VAT 8% đã tính</span>
                        <span class="font-black text-[24px] text-primary leading-none" id="pay-total">${window.formatPrice(total)}</span>
                    </div>
                </div>

                <!-- Method Selector -->
                <div class="px-5 py-4 shrink-0 border-b border-gray-100">
                    <p class="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Phương thức thanh toán</p>
                    <div class="grid grid-cols-2 gap-2">
                        <button id="btn-method-cash" onclick="OrdersComponent.selectPaymentMethod('cash', ${total})"
                            class="py-3 px-3 rounded-xl border-2 border-gray-200 font-bold text-[13px] text-text-sub hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined text-[20px]">payments</span> Tiền mặt
                        </button>
                        <button id="btn-method-qr" onclick="OrdersComponent.selectPaymentMethod('qr', ${total})"
                            class="py-3 px-3 rounded-xl border-2 border-gray-200 font-bold text-[13px] text-text-sub hover:border-[#1E2659] hover:text-[#1E2659] transition-all flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined text-[20px]">qr_code_2</span> QR Code
                        </button>
                    </div>
                </div>

                <!-- Dynamic payment area -->
                <div class="flex-1 overflow-y-auto p-5" id="pay-method-area">
                    <div class="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                        <span class="material-symbols-outlined text-[40px] text-gray-300 mb-2">touch_app</span>
                        <p class="text-[13px]">Chọn phương thức để tiếp tục</p>
                    </div>
                </div>
            </div>
        `;
    },

    closePaymentPanel() {
        if (window.qrTimerInterval) clearInterval(window.qrTimerInterval);
        const panel = document.getElementById('payment-panel');
        if (panel) panel.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                <span class="material-symbols-outlined text-[56px] mb-3 text-gray-300">point_of_sale</span>
                <p class="text-[13px] font-medium">Chưa có thanh toán đang xử lý</p>
            </div>`;
    },

    selectPaymentMethod(type, totalAmount) {
        selectedPaymentMethod = type;
        if (window.qrTimerInterval) clearInterval(window.qrTimerInterval);

        const btnCash = document.getElementById('btn-method-cash');
        const btnQr = document.getElementById('btn-method-qr');
        const area = document.getElementById('pay-method-area');
        if (!area) return;

        // Reset button styles
        const base = 'py-3 px-3 rounded-xl border-2 font-bold text-[13px] transition-all flex items-center justify-center gap-2';
        if (btnCash) btnCash.className = base + (type === 'cash' ? ' border-primary bg-blue-50 text-primary shadow-sm' : ' border-gray-200 text-text-sub hover:border-primary hover:text-primary');
        if (btnQr) btnQr.className = base + (type === 'qr' ? ' border-[#1E2659] bg-[#1E2659]/5 text-[#1E2659] shadow-sm' : ' border-gray-200 text-text-sub hover:border-[#1E2659] hover:text-[#1E2659]');

        if (type === 'cash') {
            area.innerHTML = `
                <div class="space-y-4">
                    <div>
                        <label class="text-[12px] font-bold text-text-sub block mb-1.5">Tiền khách đưa (₫)</label>
                        <input type="number" id="cash-received"
                            oninput="OrdersComponent.calculateChange(${totalAmount})"
                            placeholder="Nhập số tiền..."
                            class="w-full px-3 py-3 bg-white rounded-xl border-2 border-primary/40 font-bold text-[18px] text-text-main focus:ring-4 focus:ring-primary/15 focus:border-primary outline-none transition-all">
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <button onclick="OrdersComponent.setQuickCash(${totalAmount}, ${totalAmount})" class="px-3 py-1.5 bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:border-primary hover:text-primary rounded-lg text-[12px] font-bold transition-colors">Vừa đủ</button>
                        ${[50000, 100000, 200000, 500000].map(v =>
                `<button onclick="OrdersComponent.addQuickCash(${totalAmount}, ${v})" class="px-3 py-1.5 bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:border-primary hover:text-primary rounded-lg text-[12px] font-bold transition-colors">+${v / 1000}k</button>`
            ).join('')}
                    </div>

                    <div class="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                        <span class="text-[13px] font-medium text-text-sub">Tiền thối lại:</span>
                        <span class="font-bold text-[22px] text-green-600" id="cash-change">— ₫</span>
                    </div>

                    <button id="btn-confirm-payment"
                        onclick="OrdersComponent.processPayment(window.activeOrderViewId)"
                        disabled
                        class="w-full py-4 bg-gray-200 text-gray-400 font-bold rounded-xl text-[15px] cursor-not-allowed flex items-center justify-center gap-2 transition-all">
                        <span class="material-symbols-outlined">payments</span> XÁC NHẬN THU TIỀN
                    </button>
                </div>
            `;
            setTimeout(() => document.getElementById('cash-received')?.focus(), 50);

        } else if (type === 'qr') {
            area.innerHTML = `
                <div class="space-y-4">
                    <div class="bg-[#1E2659] rounded-2xl p-5 flex flex-col items-center text-white">
                        <div class="flex justify-between items-center w-full mb-3">
                            <span class="text-[13px] font-bold opacity-80">Quét mã để thanh toán</span>
                            <span class="text-[18px] font-black">${window.formatPrice(totalAmount)}</span>
                        </div>
                        <div class="bg-white p-3 rounded-xl w-[160px] h-[160px] flex items-center justify-center relative border-4 border-white shadow-xl">
                            <span class="material-symbols-outlined text-[#1E2659] text-[90px]">qr_code_scanner</span>
                            <div class="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" id="qr-timer-badge">
                                <span class="material-symbols-outlined text-[9px]">timer</span>
                                <span id="qr-countdown">05:00</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 mt-3 bg-white/10 rounded-lg px-3 py-2 w-full justify-between border border-white/10">
                            <span class="flex items-center gap-1.5 text-[12px]">
                                <span class="animate-pulse size-2 bg-green-400 rounded-full inline-block"></span> Chờ quét mã...
                            </span>
                            <div class="flex gap-1.5">
                                <button onclick="OrdersComponent.qrFail()" class="text-[11px] bg-red-500/80 text-white font-bold px-2 py-1 rounded hover:bg-red-500">Fail</button>
                                <button onclick="OrdersComponent.qrSuccess()" class="text-[11px] bg-white text-[#1E2659] font-bold px-2 py-1 rounded hover:bg-gray-100">Success</button>
                            </div>
                        </div>
                    </div>

                    <button id="btn-confirm-payment"
                        onclick="OrdersComponent.processPayment(window.activeOrderViewId)"
                        disabled
                        class="w-full py-4 bg-gray-200 text-gray-400 font-bold rounded-xl text-[15px] cursor-not-allowed flex items-center justify-center gap-2 transition-all">
                        <span class="material-symbols-outlined">price_check</span> XÁC NHẬN THANH TOÁN QR
                    </button>
                </div>
            `;

            let timeLeft = 300;
            window.qrTimerInterval = setInterval(() => {
                timeLeft--;
                const cd = document.getElementById('qr-countdown');
                if (!cd) { clearInterval(window.qrTimerInterval); return; }
                if (timeLeft <= 0) {
                    clearInterval(window.qrTimerInterval);
                    cd.textContent = 'Hết hạn';
                    window.showToast('Mã QR đã hết hạn.', 'error');
                    this.qrFail();
                } else {
                    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
                    const s = (timeLeft % 60).toString().padStart(2, '0');
                    cd.textContent = `${m}:${s}`;
                }
            }, 1000);
        }
    },

    qrSuccess() {
        if (window.qrTimerInterval) clearInterval(window.qrTimerInterval);
        const btn = document.getElementById('btn-confirm-payment');
        if (btn) {
            btn.disabled = false;
            btn.className = 'w-full py-4 bg-[#1E2659] hover:bg-[#0d1645] text-white font-bold rounded-xl text-[15px] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer';
            btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> HOÀN TẤT THANH TOÁN';
        }
        const cd = document.getElementById('qr-countdown');
        if (cd) cd.textContent = 'Đã quét';
        window.showToast('Khách đã chuyển khoản thành công!');
    },

    qrFail() {
        if (window.qrTimerInterval) clearInterval(window.qrTimerInterval);
        const area = document.getElementById('pay-method-area');
        if (!area) return;
        area.innerHTML = `
            <div class="bg-red-50 border border-red-200 p-5 rounded-2xl flex flex-col items-center gap-3 text-red-700">
                <span class="material-symbols-outlined text-[48px] text-red-400">warning</span>
                <p class="font-bold text-[15px]">Thanh toán thất bại</p>
                <p class="text-[12px] text-center text-red-500">QR hết hạn hoặc giao dịch bị lỗi từ ngân hàng.</p>
                <div class="flex gap-2 w-full mt-1">
                    <button onclick="OrdersComponent.selectPaymentMethod('qr', ${window.appState.orders.find(o => o.id === window.activeOrderViewId)?.totalAmount || 0})"
                        class="flex-1 py-2 bg-white border border-red-200 rounded-xl text-[13px] font-bold hover:bg-red-50 transition-colors">
                        Tạo lại QR
                    </button>
                    <button onclick="OrdersComponent.selectPaymentMethod('cash', ${window.appState.orders.find(o => o.id === window.activeOrderViewId)?.totalAmount || 0})"
                        class="flex-1 py-2 bg-red-600 text-white rounded-xl text-[13px] font-bold hover:bg-red-700 transition-colors">
                        Đổi tiền mặt
                    </button>
                </div>
            </div>
        `;
    },

    setQuickCash(totalAmount, val) {
        const input = document.getElementById('cash-received');
        if (input) { input.value = val; this.calculateChange(totalAmount); }
    },

    addQuickCash(totalAmount, amount) {
        const input = document.getElementById('cash-received');
        if (input) {
            let cur = parseInt(input.value) || 0;
            if (cur === totalAmount) cur = 0;
            input.value = cur + amount;
            this.calculateChange(totalAmount);
        }
    },

    calculateChange(totalAmount) {
        const input = document.getElementById('cash-received');
        const changeEl = document.getElementById('cash-change');
        const btn = document.getElementById('btn-confirm-payment');
        if (!input || !changeEl || !btn) return;

        const received = parseInt(input.value) || 0;
        const change = received - totalAmount;

        if (change >= 0) {
            changeEl.textContent = window.formatPrice(change);
            changeEl.className = 'font-bold text-[22px] text-green-600';
            btn.disabled = false;
            btn.className = 'w-full py-4 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-[15px] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer';
        } else {
            changeEl.textContent = 'Chưa đủ tiền';
            changeEl.className = 'font-bold text-[14px] text-red-500 italic';
            btn.disabled = true;
            btn.className = 'w-full py-4 bg-gray-200 text-gray-400 font-bold rounded-xl text-[15px] cursor-not-allowed flex items-center justify-center gap-2 transition-all';
        }
    },

    processPayment(orderId) {
        if (!selectedPaymentMethod) return;
        const order = window.appState.orders.find(o => o.id === orderId);
        if (!order) return;

        order.status = 'completed';
        order.paymentMethod = selectedPaymentMethod === 'qr' ? 'payos' : 'cash';

        if (order.tableId) {
            const table = window.mockTables.find(t => t.id === order.tableId);
            if (table) table.status = 'empty';
        }

        window.showToast('Thanh toán thành công!');
        this.setFilter(this.activeFilter);
        this.viewOrderDetails(orderId);
        this.showReceiptInPanel(order);
    },

    showReceiptInPanel(order) {
        const panel = document.getElementById('payment-panel');
        if (!panel) return;

        let changeStr = '';
        if (order.paymentMethod === 'cash') {
            const input = document.getElementById('cash-received');
            const received = input ? (parseInt(input.value) || order.totalAmount) : order.totalAmount;
            const change = received - order.totalAmount;
            changeStr = `
                <div class="flex justify-between text-[13px] text-text-sub mt-1"><span>Khách đưa:</span><span>${window.formatPrice(received)}</span></div>
                <div class="flex justify-between text-[13px] font-bold mt-1"><span>Tiền thối:</span><span class="text-green-600">${window.formatPrice(change)}</span></div>
            `;
        }

        panel.innerHTML = `
            <div class="flex flex-col h-full bg-white border-l border-border-main">
                <div class="flex-1 overflow-y-auto p-5">
                    <div class="bg-white rounded-2xl border border-border-main shadow-sm overflow-hidden">
                        <!-- Receipt Header -->
                        <div class="bg-green-50 border-b border-dashed border-gray-200 p-6 text-center flex flex-col items-center">
                            <span class="material-symbols-outlined text-[52px] text-green-500 mb-2">check_circle</span>
                            <h3 class="font-black text-[20px] text-text-main">Thanh toán thành công</h3>
                            <p class="text-[12px] text-text-muted mt-1">Đơn #${order.id} · ${order.time}</p>
                        </div>

                        <!-- Items -->
                        <div class="p-4 border-b border-dashed border-gray-200 space-y-2 max-h-[220px] overflow-y-auto">
                            ${order.items.map(i => `
                                <div class="flex justify-between text-[13px]">
                                    <span class="font-medium text-text-main">${i.quantity}× ${i.name}</span>
                                    <span class="text-text-sub">${window.formatPrice(i.price * i.quantity)}</span>
                                </div>`).join('')}
                        </div>

                        <!-- Totals -->
                        <div class="p-4 space-y-1.5">
                            <div class="flex justify-between font-black text-[18px]">
                                <span>Tổng cộng</span>
                                <span class="text-primary">${window.formatPrice(order.totalAmount)}</span>
                            </div>
                            <div class="flex justify-between text-[13px] text-text-sub">
                                <span>Phương thức</span>
                                <span class="font-bold bg-gray-100 px-2 py-0.5 rounded text-text-main uppercase text-[11px]">${order.paymentMethod === 'cash' ? 'Tiền mặt' : 'QR Code'}</span>
                            </div>
                            ${changeStr}
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="p-4 border-t border-border-main shrink-0 flex gap-3">
                    <button onclick="OrdersComponent.closePaymentPanel()"
                        class="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-text-main font-bold rounded-xl text-[13px] transition-colors">
                        Đóng
                    </button>
                    <button onclick="window.showToast('Đang in hóa đơn...', 'success')"
                        class="flex-1 py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-[13px] transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20">
                        <span class="material-symbols-outlined text-[17px]">print</span> In hóa đơn
                    </button>
                </div>
            </div>
        `;
    },

    // ─────────────────────────────────────────────────────────────────────────
    // HISTORY TAB
    // ─────────────────────────────────────────────────────────────────────────
    renderHistory() {
        const completedOrders = window.appState.orders
            .filter(o => o.status === 'completed' || o.status === 'cancelled')
            .sort((a, b) => b.time.localeCompare(a.time));

        let filtered = completedOrders;
        if (this.historyFilterStatus && this.historyFilterStatus !== 'all') {
            filtered = completedOrders.filter(o => o.status === this.historyFilterStatus);
        }

        const totalRev = completedOrders.filter(o => o.status === 'completed').reduce((s, o) => s + o.totalAmount, 0);
        const failedTxs = completedOrders.filter(o => o.status === 'cancelled').length;

        setTimeout(() => {
            if (filtered.length > 0 && !window.activeHistoryViewId) {
                this.viewHistoryDetails(filtered[0].id);
            } else if (window.activeHistoryViewId) {
                this.viewHistoryDetails(window.activeHistoryViewId);
            }
        }, 50);

        return `
            <div class="h-full flex relative overflow-hidden bg-[#F3F4F6]">
                <div class="w-[360px] bg-white border-r border-border-main flex flex-col h-full z-10 shrink-0">
                    <div class="px-4 py-4 border-b border-border-main shrink-0">
                        <h2 class="font-bold text-[18px] text-text-main mb-3">Lịch sử giao dịch</h2>
                        <div class="grid grid-cols-2 gap-2 mb-3">
                            <div class="bg-gray-50 p-2 text-center rounded-lg border border-gray-100">
                                <span class="block text-[10px] text-text-muted font-bold tracking-wider uppercase">Tổng thu</span>
                                <span class="font-bold text-[13px] text-green-600">${window.formatPrice(totalRev)}</span>
                            </div>
                            <div class="bg-gray-50 p-2 text-center rounded-lg border border-gray-100">
                                <span class="block text-[10px] text-text-muted font-bold tracking-wider uppercase">Giao dịch</span>
                                <span class="font-bold text-[13px] text-primary">${completedOrders.length} (${failedTxs} hủy)</span>
                            </div>
                        </div>
                        <div class="relative mb-3">
                            <input onkeyup="OrdersComponent.searchHistory(this.value)" type="text"
                                placeholder="Tìm mã giao dịch, bàn..."
                                class="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:ring-1 focus:ring-primary outline-none">
                            <span class="material-symbols-outlined absolute left-2.5 top-2 text-text-muted text-[16px]">search</span>
                        </div>
                        <div class="flex gap-1.5 overflow-x-auto no-scrollbar">
                            ${[{ k: 'all', l: 'Tất cả' }, { k: 'completed', l: 'Thành công' }, { k: 'cancelled', l: 'Đã hủy' }].map(f => `
                                <button onclick="OrdersComponent.setHistoryFilter('${f.k}')"
                                    class="px-2.5 py-1.5 ${this.historyFilterStatus === f.k || (!this.historyFilterStatus && f.k === 'all') ? (f.k === 'cancelled' ? 'bg-red-600 text-white' : f.k === 'completed' ? 'bg-green-600 text-white' : 'bg-text-main text-white') : 'bg-gray-100 text-text-sub hover:bg-gray-200'} rounded-lg text-[11px] font-bold shrink-0 transition-colors">
                                    ${f.l}
                                </button>`).join('')}
                        </div>
                    </div>
                    <div class="flex-1 overflow-y-auto p-3 space-y-1.5 pb-20" id="history-list">
                        ${filtered.map(o => this.renderHistoryCard(o)).join('')}
                        ${filtered.length === 0 ? '<p class="text-center text-text-muted mt-10 text-[13px]">Không có giao dịch.</p>' : ''}
                    </div>
                </div>

                <div class="flex-1 h-full overflow-hidden" id="history-detail-view">
                    <div class="h-full flex flex-col items-center justify-center opacity-50">
                        <span class="material-symbols-outlined text-[56px] mb-3 text-gray-300">history</span>
                        <p class="text-[13px] font-medium text-text-muted">Chọn giao dịch để xem chi tiết</p>
                    </div>
                </div>
            </div>
        `;
    },

    setHistoryFilter(f) {
        this.historyFilterStatus = f;
        window.activeHistoryViewId = null;
        const temp = document.createElement('div');
        temp.innerHTML = this.renderHistory();
        const container = document.getElementById('views-container');
        if (container) container.innerHTML = temp.innerHTML;
    },

    searchHistory(query) {
        query = query.toLowerCase();
        const list = document.getElementById('history-list');
        if (!list) return;
        let txs = window.appState.orders.filter(o => o.status === 'completed' || o.status === 'cancelled');
        if (this.historyFilterStatus && this.historyFilterStatus !== 'all') {
            txs = txs.filter(o => o.status === this.historyFilterStatus);
        }
        txs = txs.filter(o =>
            o.id.toLowerCase().includes(query) ||
            (o.tableId && o.tableId.toLowerCase().includes(query))
        ).sort((a, b) => b.time.localeCompare(a.time));
        list.innerHTML = txs.map(o => this.renderHistoryCard(o)).join('');
        if (txs.length === 0) list.innerHTML = '<p class="text-center text-text-muted mt-10 text-[13px]">Không tìm thấy.</p>';
    },

    renderHistoryCard(order) {
        const isSuccess = order.status === 'completed';
        const isActive = order.id === window.activeHistoryViewId;
        return `
            <div onclick="OrdersComponent.viewHistoryDetails('${order.id}')"
                class="bg-white p-3 rounded-xl border ${isActive ? 'border-primary ring-1 ring-primary' : 'border-gray-200 hover:border-primary/50'} shadow-sm cursor-pointer transition-all group">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="block font-bold text-[13px] text-text-main group-hover:text-primary transition-colors">#${order.id}</span>
                        <span class="text-[11px] text-text-muted">${order.time}</span>
                    </div>
                    ${isSuccess
                ? `<span class="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-bold border border-green-100 flex items-center gap-1"><span class="material-symbols-outlined text-[11px]">check_circle</span>Thành công</span>`
                : `<span class="px-2 py-0.5 bg-red-50 text-red-700 rounded text-[10px] font-bold border border-red-100 flex items-center gap-1"><span class="material-symbols-outlined text-[11px]">cancel</span>Đã hủy</span>`
            }
                </div>
                <div class="flex justify-between items-end border-t border-gray-100 pt-2">
                    ${isSuccess
                ? (order.paymentMethod === 'payos'
                    ? `<span class="px-2 py-0.5 bg-[#1E2659]/10 text-[#1E2659] text-[10px] font-bold rounded">QR Code</span>`
                    : `<span class="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">Tiền mặt</span>`)
                : `<span class="text-[11px] italic text-text-muted truncate max-w-[150px]">${order.cancelReason}</span>`
            }
                    <span class="font-bold text-[14px] ${isSuccess ? 'text-primary' : 'text-gray-400 line-through'}">${window.formatPrice(order.totalAmount)}</span>
                </div>
            </div>`;
    },

    viewHistoryDetails(orderId) {
        window.activeHistoryViewId = orderId;
        const container = document.getElementById('history-detail-view');
        if (!container) return;

        const listCards = document.getElementById('history-list');
        if (listCards) {
            Array.from(listCards.children).forEach(card => {
                const isThis = card.innerText.includes(orderId);
                card.classList.toggle('ring-1', isThis);
                card.classList.toggle('border-primary', isThis);
                card.classList.toggle('border-gray-200', !isThis);
            });
        }

        const order = window.appState.orders.find(o => o.id === orderId);
        if (!order) return;

        container.innerHTML = `
            <div class="w-full h-full flex items-center justify-center p-6 overflow-y-auto">
                <div class="bg-white rounded-2xl w-full max-w-[480px] border border-border-main shadow-sm overflow-hidden">
                    <div class="p-5 border-b border-dashed border-gray-200 text-center flex flex-col items-center ${order.status === 'completed' ? 'bg-green-50' : 'bg-red-50'}">
                        <span class="material-symbols-outlined text-[44px] ${order.status === 'completed' ? 'text-green-500' : 'text-red-400'} mb-2">${order.status === 'completed' ? 'check_circle' : 'event_busy'}</span>
                        <h3 class="font-black text-[18px] text-text-main">${order.status === 'completed' ? 'Giao dịch thành công' : 'Giao dịch đã hủy'}</h3>
                        <div class="mt-1.5 text-[12px] text-text-muted flex gap-4">
                            <span>Mã: <strong>#${order.id}</strong></span>
                            <span>Giờ: <strong>${order.time}</strong></span>
                        </div>
                    </div>
                    <div class="p-5 space-y-3">
                        <div class="border-b border-dashed border-gray-200 pb-3 space-y-2 max-h-[240px] overflow-y-auto">
                            ${order.items.map(i => `
                                <div class="flex justify-between text-[13px]">
                                    <span class="font-medium">${i.quantity}× ${i.name}</span>
                                    <span class="text-text-sub">${window.formatPrice(i.price * i.quantity)}</span>
                                </div>`).join('')}
                        </div>
                        <div class="flex justify-between font-black text-[17px]">
                            <span>Giá trị đơn</span>
                            <span class="${order.status === 'completed' ? 'text-primary' : 'text-text-main'}">${window.formatPrice(order.totalAmount)}</span>
                        </div>
                        ${order.status === 'completed' ? `
                            <div class="flex justify-between text-[13px] text-text-sub">
                                <span>Phương thức</span>
                                <span class="font-bold bg-gray-100 px-2 py-0.5 rounded uppercase text-[11px] text-text-main">${order.paymentMethod === 'cash' ? 'Tiền mặt' : 'QR Code'}</span>
                            </div>
                        ` : `
                            <div class="bg-red-50 text-red-700 p-3 rounded-xl text-[13px] border border-red-100">
                                <strong>Lý do hủy:</strong> ${order.cancelReason}
                            </div>
                        `}
                    </div>
                    ${order.status === 'completed' ? `
                    <div class="px-5 pb-5">
                        <button onclick="window.showToast('Đang in hóa đơn...', 'success')"
                            class="w-full py-3 bg-white border border-gray-200 text-text-main font-bold rounded-xl text-[13px] hover:bg-gray-50 transition-colors flex justify-center gap-2 items-center shadow-sm">
                            <span class="material-symbols-outlined text-[17px]">print</span> In lại hóa đơn
                        </button>
                    </div>` : ''}
                </div>
            </div>
        `;
    }
};

let selectedPaymentMethod = null;