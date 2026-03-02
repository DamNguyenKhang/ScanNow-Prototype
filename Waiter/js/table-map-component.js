const TableMapComponent = {
    render: function (container, params) {
        container.innerHTML = `
            <div class="flex flex-col h-full">
                <!-- LEGEND -->
                <div class="px-4 py-3 flex gap-4 bg-white border-b border-border-main shrink-0">
                    <div class="flex items-center gap-1.5"><span class="size-2.5 bg-status-empty rounded-full"></span><span class="text-[11px] font-medium text-text-sub">Trống</span></div>
                    <div class="flex items-center gap-1.5"><span class="size-2.5 bg-status-occupied rounded-full"></span><span class="text-[11px] font-medium text-text-sub">Có khách</span></div>
                    <div class="flex items-center gap-1.5"><span class="size-2.5 bg-status-suspended rounded-full"></span><span class="text-[11px] font-medium text-text-sub">Ngưng dùng</span></div>
                </div>

                <!-- TABLE GRID -->
                <main class="flex-1 overflow-y-auto no-scrollbar p-4">
                    <div class="grid grid-cols-3 gap-4 pb-28" id="table-grid"></div>
                </main>
            </div>

            <!-- TABLE DETAIL SHEET -->
            <div id="sheet-overlay-tables" class="fixed inset-0 bg-black/40 z-[60] opacity-0 pointer-events-none transition-opacity duration-300" onclick="TableMapComponent.closeTableDetail()"></div>
            <div id="table-detail-sheet" class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] bg-white bottom-sheet hidden z-[70] rounded-t-[20px] shadow-sheet p-6 flex flex-col gap-6 transition-transform">
                <div class="w-full flex justify-center -mt-3 mb-2 shrink-0"><div class="w-[36px] h-1 bg-border-main rounded-full"></div></div>
                <div id="table-detail-content" class="space-y-4"></div>
                <div class="pb-safe"></div>
            </div>
        `;

        this.init(container);
    },

    init: function (container) {
        const gridEl = container.querySelector('#table-grid');
        this.renderTables(gridEl);
        setInterval(() => this.renderTables(gridEl), 60000);
    },

    renderTables: function (gridEl) {
        if (!gridEl) return;
        gridEl.innerHTML = tables.map(t => {
            let statusClass = "bg-white border-border-main text-text-main";
            if (t.status === 'occupied') statusClass = "bg-status-occupied text-white border-transparent shadow-lg shadow-status-occupied/30";
            if (t.status === 'suspended') statusClass = "bg-slate-100 text-text-muted border-transparent grayscale";

            const dur = t.status === 'occupied' ? Math.floor((new Date() - t.startTime) / 60000) : 0;

            return `
                <div onclick="TableMapComponent.openTableDetail('${t.id}')" class="aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer ${statusClass}">
                    <span class="font-display font-black text-[20px]">${t.id}</span>
                    ${t.status === 'occupied' ? `<div class="flex items-center gap-1 bg-black/10 px-1.5 py-0.5 rounded-full"><span class="material-symbols-outlined text-[12px]">schedule</span><span class="text-[10px] font-bold">${dur}'</span></div>` : `<span class="text-[10px] font-bold opacity-60 uppercase tracking-tighter">${t.zone}</span>`}
                </div>
            `;
        }).join('');
    },

    openTableDetail: function (id) {
        const t = tables.find(table => table.id === id);
        if (!t) return;

        const content = document.getElementById('table-detail-content');
        const overlay = document.getElementById('sheet-overlay-tables');
        const sheet = document.getElementById('table-detail-sheet');

        let statusBadge = t.status === 'occupied' ? `<span class="px-3 py-1 bg-status-occupied/10 text-status-occupied text-[12px] font-bold rounded-full">Đang dùng</span>` : t.status === 'empty' ? `<span class="px-3 py-1 bg-status-empty/10 text-status-empty text-[12px] font-bold rounded-full">Sẵn sàng</span>` : `<span class="px-3 py-1 bg-slate-100 text-text-muted text-[12px] font-bold rounded-full">Ngưng dùng</span>`;

        content.innerHTML = `
            <div class="flex justify-between items-start">
                <div><h3 class="font-display font-extrabold text-[24px] text-text-main">Bàn ${t.id}</h3><p class="text-[14px] text-text-muted">${t.zone} · ${t.seats > 0 ? t.seats + ' chỗ ngồi' : 'Món mang về'}</p></div>
                ${statusBadge}
            </div>
            ${t.status === 'occupied' ? `
                <div class="bg-primary/5 rounded-xl p-4 border border-primary/10 space-y-2">
                    <div class="flex justify-between items-center"><span class="text-[12px] font-bold text-primary uppercase">Đang phục vụ</span><span class="font-mono text-[12px] text-primary">#ORD-042</span></div>
                    <div class="flex justify-between text-[13px]"><span class="text-text-sub">Thời gian ngồi:</span><span class="font-bold text-text-main">${Math.floor((new Date() - t.startTime) / 60000)} phút</span></div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <button onclick="router.navigate('create-order', {table: '${t.id}', mode: 'add'})" class="h-12 bg-primary text-white font-display font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined text-[20px]">add_circle</span> Thêm món
                    </button>
                    <button onclick="router.navigate('orders', {table: '${t.id}', quickview: true})" class="h-12 border border-primary text-primary font-display font-bold rounded-xl active:bg-primary/5 shadow-sm">Xem đơn hàng</button>
                </div>
                <button onclick="TableMapComponent.completeTable('${t.id}')" class="w-full h-12 bg-slate-50 text-text-sub font-bold rounded-[14px] active:bg-slate-100 transition-colors mt-2">Dọn dẹp bàn & Đóng đơn</button>
            ` : t.status === 'empty' ? `
                <button onclick="router.navigate('create-order', {table: '${t.id}'})" class="w-full h-12 bg-status-ready text-white font-display font-bold rounded-xl flex items-center justify-center gap-2"><span class="material-symbols-outlined text-[20px]">add</span> Mở bàn / Tạo đơn mới</button>
            ` : ''}
        `;

        sheet.classList.remove('hidden');
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
    },

    closeTableDetail: function () {
        const sheet = document.getElementById('table-detail-sheet');
        const overlay = document.getElementById('sheet-overlay-tables');
        if (sheet) sheet.classList.add('hidden');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
        }
    },

    completeTable: function (id) {
        if (confirm("Xác nhận bàn này đã thanh toán và dọn dẹp xong?")) {
            const t = tables.find(table => table.id === id);
            if (t) {
                t.status = 'empty';
                t.orderId = null;
                t.startTime = null;
                showToast(`Đã dọn dẹp xong bàn ${id}!`);
                this.renderTables(document.getElementById('table-grid'));
                this.closeTableDetail();
            }
        }
    }
};
