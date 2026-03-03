const TableMapComponent = {
    render() {
        // Need to group tables by zone if we had them, but mock data only has flat list right now, so we group them as "Tầng 1", "Tầng 2" based on id
        return `
            <div class="h-full flex flex-col bg-background-light overflow-hidden">
                <div class="p-6 pb-2 shrink-0">
                    <div class="flex justify-between items-end mb-4">
                        <div>
                            <h2 class="font-display font-bold text-[24px] text-text-main">Sơ đồ bàn</h2>
                            <p class="text-text-sub mt-1">Trạng thái thời gian thực các bàn theo khu vực.</p>
                        </div>
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto p-6 pt-0 custom-scrollbar">
                     <!-- LEGEND -->
                    <div class="mb-6 flex gap-6 bg-white p-4 rounded-xl border border-border-main shadow-sm w-max mx-auto">
                        <div class="flex items-center gap-2"><span class="size-3 lg:size-4 bg-status-empty rounded-full shadow border-2 border-white"></span><span class="text-[13px] font-bold text-text-sub uppercase tracking-wider">Trống</span></div>
                        <div class="flex items-center gap-2"><span class="size-3 lg:size-4 bg-status-occupied rounded-full shadow shadow-status-occupied/50 border-2 border-white"></span><span class="text-[13px] font-bold text-text-sub uppercase tracking-wider">Có khách</span></div>
                        <div class="flex items-center gap-2"><span class="size-3 lg:size-4 bg-status-suspended rounded-full shadow border-2 border-white grayscale"></span><span class="text-[13px] font-bold text-text-sub uppercase tracking-wider">Bảo trì</span></div>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" id="table-grid">
                        ${this.renderTables()}
                    </div>
                </div>
            </div>
            
            <!-- Context Modal for Table -->
            <div id="table-context-modal" class="fixed inset-0 bg-black/50 z-[200] hidden items-center justify-center p-4 backdrop-blur-sm shadow-xl">
                 <div class="bg-white rounded-2xl w-full max-w-[400px] flex flex-col overflow-hidden transform scale-95 opacity-0 transition-all duration-300" id="table-context-content">
                     <!-- Content injected here -->
                 </div>
            </div>
        `;
    },

    renderTables() {
        return window.mockTables.map(t => {
            let statusClass = "bg-white border-border-main text-text-main hover:border-gray-300";
            if (t.status === 'occupied') statusClass = "bg-status-occupied text-white border-transparent shadow-lg shadow-status-occupied/30 hover:bg-orange-600";
            if (t.status === 'suspended') statusClass = "bg-slate-100 text-text-muted border-transparent grayscale cursor-not-allowed opacity-70";

            // Find if there's an active order for this table
            const activeOrder = window.appState.orders.find(o => o.tableId === t.id && o.status === 'pending');
            const totalStr = activeOrder ? window.formatPrice(activeOrder.totalAmount) : '';

            return `
                <div onclick="TableMapComponent.handleTableClick('${t.id}')" class="aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden group ${statusClass}">
                    ${t.status === 'occupied' && activeOrder ? `<div class="absolute top-2 right-2 flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded text-white"><span class="material-symbols-outlined text-[12px]">receipt</span><span class="text-[10px] font-bold">#${activeOrder.id.replace('ORD-', '')}</span></div>` : ''}
                    
                    <span class="font-display font-black text-[28px] lg:text-[32px]">${t.name.replace('Bàn ', '')}</span>
                    
                    ${t.status === 'occupied'
                    ? `<span class="text-[13px] font-bold opacity-90">${totalStr}</span>`
                    : `<span class="text-[11px] font-bold opacity-60 uppercase tracking-wider">${t.capacity} chỗ</span>`}
                </div>
            `;
        }).join('');
    },

    handleTableClick(tableId) {
        const table = window.mockTables.find(t => t.id === tableId);
        if (!table || table.status === 'suspended') return;

        const modal = document.getElementById('table-context-modal');
        const content = document.getElementById('table-context-content');

        let statusBadge = table.status === 'occupied' ? `<span class="px-3 py-1 bg-status-occupied/10 text-status-occupied border border-status-occupied/20 text-[12px] font-bold rounded-lg uppercase tracking-wider">Có khách</span>` : `<span class="px-3 py-1 bg-status-empty/10 text-status-empty border border-status-empty/20 text-[12px] font-bold rounded-lg uppercase tracking-wider">Bàn Trống</span>`;

        const activeOrder = window.appState.orders.find(o => o.tableId === table.id && o.status === 'pending');

        content.innerHTML = `
            <div class="px-5 py-4 border-b border-border-main flex justify-between items-center bg-gray-50/80 shrink-0">
                <div class="flex items-center gap-3">
                    <div class="size-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center font-display font-black text-xl text-primary">${table.name.replace('Bàn ', '')}</div>
                    <div class="flex flex-col">
                        <h3 class="font-bold text-[16px]">${table.name}</h3>
                        <span class="text-xs text-text-sub">${statusBadge}</span>
                    </div>
                </div>
                <button onclick="TableMapComponent.closeModal()" class="text-text-muted hover:text-text-main bg-white p-1 rounded hover:bg-gray-200 transition-colors"><span class="material-symbols-outlined">close</span></button>
            </div>
            
            <div class="p-6 bg-white space-y-3">
                ${activeOrder ? `
                    <div class="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-4 flex flex-col items-center text-center">
                        <span class="text-sm font-bold text-orange-800 mb-1">Đơn hàng đang phục vụ</span>
                        <span class="font-display font-bold text-2xl text-primary-orange">${window.formatPrice(activeOrder.totalAmount)}</span>
                        <span class="text-xs text-orange-600 mt-1">${activeOrder.items.reduce((s, i) => s + i.quantity, 0)} món ăn/thức uống</span>
                    </div>
                    
                    <button onclick="TableMapComponent.navigateToOrder('${activeOrder.id}')" class="w-full py-3 bg-white border-2 border-primary text-primary hover:bg-blue-50 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                        <span class="material-symbols-outlined">receipt_long</span> Xem & Thanh toán
                    </button>
                    <button onclick="TableMapComponent.navigateToAddItem('${activeOrder.id}')" class="w-full py-3 bg-primary text-white hover:bg-blue-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/20">
                        <span class="material-symbols-outlined">add_circle</span> Gọi thêm món
                    </button>
                ` : `
                    <div class="py-8 text-center text-text-muted flex flex-col items-center">
                        <span class="material-symbols-outlined text-[48px] text-gray-200 mb-2">table_restaurant</span>
                        <p class="font-medium">Bàn này đang trống.</p>
                    </div>
                    <button onclick="TableMapComponent.navigateToCreate('${table.id}')" class="w-full py-4 bg-primary text-white hover:bg-blue-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/30 text-[16px]">
                        <span class="material-symbols-outlined">post_add</span> TẠO ĐƠN MỚI
                    </button>
                `}
            </div>
        `;

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        // Animate in
        requestAnimationFrame(() => {
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        });
    },

    closeModal() {
        const modal = document.getElementById('table-context-modal');
        const content = document.getElementById('table-context-content');

        if (content) {
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
        }

        setTimeout(() => {
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        }, 200); // Wait for transition
    },

    navigateToOrder(orderId) {
        this.closeModal();
        window.activeOrderViewId = orderId;
        router.navigate('orders');
        setTimeout(() => {
            if (window.OrdersComponent) {
                OrdersComponent.viewOrderDetails(orderId);
            }
        }, 100);
    },

    navigateToAddItem(orderId) {
        this.closeModal();
        window.activeOrderViewId = orderId;
        router.navigate('orders');
        setTimeout(() => {
            if (window.OrdersComponent) {
                OrdersComponent.viewOrderDetails(orderId);
                OrdersComponent.showAddItemModal(orderId);
            }
        }, 150);
    },

    navigateToCreate(tableId) {
        this.closeModal();
        // Set state for creation before navigating
        window.newOrderState = {
            type: 'dine-in',
            tableId: tableId,
            items: []
        };
        router.navigate('create');
        // Set the select box value after render
        setTimeout(() => {
            const select = document.getElementById('table-select');
            if (select) { select.value = tableId; }
            CreateOrderComponent.selectType('dine-in'); // ensures UI is synced
            // Re-eval button state manually if needed
            CreateOrderComponent.updateCheckoutButtonState();
        }, 100);
    }
};
