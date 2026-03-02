const CreateOrderComponent = {
    cart: [],
    selectedTableId: null,
    activeCategory: "all",
    searchQuery: "",
    isEditMode: false,
    editOrderId: null,
    isAddMode: false, // Added isAddMode property

    render: function (container, params) {
        this.selectedTableId = params.table || null;
        this.isEditMode = !!params.edit;
        this.isAddMode = params.mode === 'add';
        this.editOrderId = params.edit || null;
        this.cart = [];

        if (this.isEditMode) {
            const order = orders.find(o => o.id === params.edit);
            if (order) {
                this.cart = order.items.map(i => {
                    const dish = dishes.find(d => d.name === i.name);
                    return { dishId: dish ? dish.id : null, qty: i.qty };
                }).filter(x => x.dishId !== null);
                this.selectedTableId = order.table;
            }
        } else if (this.isAddMode && this.selectedTableId) {
            const existingOrder = orders.find(o => o.table === this.selectedTableId && o.status !== 'completed');
            if (existingOrder) {
                this.cart = existingOrder.items.map(i => {
                    const dish = dishes.find(d => d.name === i.name);
                    return { dishId: dish ? dish.id : null, qty: i.qty };
                }).filter(x => x.dishId !== null);
            }
        }

        const title = this.isEditMode ? "Sửa đơn hàng" : (this.isAddMode ? `Thêm món - Bàn ${this.selectedTableId}` : "Tạo đơn mới");

        container.innerHTML = `
            <div class="flex-1 overflow-y-auto no-scrollbar pb-32 h-full">
                <!-- SELECT TABLE CARD (Only show if not locked by params) -->
                ${!params.table ? `
                <div id="table-select-trigger" class="m-4 bg-white border border-border-main rounded-2xl p-4 shadow-card flex justify-between items-center active:scale-[0.98] transition-all cursor-pointer">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-[20px] text-primary">pin_drop</span>
                        <div>
                            <span class="font-display font-bold text-[14px]" id="selected-table-label">${this.selectedTableId ? `Bàn ${this.selectedTableId}` : "Chọn bàn phục vụ"}</span>
                        </div>
                    </div>
                    <span class="material-symbols-outlined text-text-muted text-[18px]">expand_more</span>
                </div>` : `
                <div class="m-4 bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-primary">analytics</span>
                        <span class="font-display font-bold text-[15px] text-primary">${title}</span>
                    </div>
                </div>`}

                <!-- SEARCH DISH BAR -->
                <div class="mx-4 mb-4">
                    <div class="relative group">
                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
                        <input class="w-full h-[48px] pl-10 pr-4 bg-white border-1.5 border-border-main rounded-2xl outline-none focus:border-primary placeholder:text-text-muted text-[14px] font-body" placeholder="Tìm tên món, đồ uống..." type="text" id="dish-search" value="${this.searchQuery}" />
                    </div>
                </div>

                <!-- CATEGORY TABS -->
                <div class="flex overflow-x-auto no-scrollbar px-4 gap-2 mb-4 shrink-0">
                    <button class="cat-tab ${this.activeCategory === 'all' ? 'bg-primary text-white shadow-md' : 'bg-white text-text-sub border border-border-main'} flex-none px-5 py-2 rounded-full text-[13px] font-bold transition-all" data-category="all">Tất cả</button>
                    ${["starter", "main", "drink", "dessert"].map(cat => `
                        <button class="cat-tab ${this.activeCategory === cat ? 'bg-primary text-white shadow-md' : 'bg-white text-text-sub border border-border-main'} flex-none px-5 py-2 rounded-full text-[13px] font-bold transition-all" data-category="${cat}">${cat === 'starter' ? 'Khai vị' : cat === 'main' ? 'Món chính' : cat === 'drink' ? 'Đồ uống' : 'Tráng miệng'}</button>
                    `).join('')}
                </div>

                <!-- DISH LIST -->
                <div class="px-4 space-y-3 pb-10" id="dish-list-container"></div>
            </div>

            <!-- FLOATING CART BAR -->
            <div id="floating-cart-container" class="absolute bottom-[88px] left-4 right-4 z-40">
                <button id="floating-cart" class="w-full h-[60px] rounded-2xl bg-primary shadow-float flex items-center justify-between px-6 active:scale-[0.98] transition-all hidden">
                    <div class="flex items-center gap-3 text-white">
                        <div class="size-7 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center font-display font-bold text-[14px]" id="cart-item-count">0</div>
                        <span class="font-display font-bold text-[16px]">Xem giỏ hàng</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="font-mono font-bold text-[16px] text-white" id="cart-total-price">0 ₫</span>
                        <span class="material-symbols-outlined text-white/50">arrow_forward_ios</span>
                    </div>
                </button>
            </div>

            <!-- Overlays/Sheets -->
            <div id="cart-overlay-orders" class="fixed inset-0 bg-black/60 z-[60] bottom-sheet-overlay hidden" onclick="CreateOrderComponent.closeCartSheet()"></div>
            <div id="cart-sheet" class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] h-[85%] bg-white bottom-sheet hidden z-[70] rounded-t-3xl shadow-float flex flex-col overflow-hidden transition-transform">
                <div class="w-full flex justify-center pt-3 pb-2 shrink-0"><div class="w-[40px] h-1.5 bg-slate-200 rounded-full"></div></div>
                <div class="px-6 pb-4 border-b border-border-main flex justify-between items-center shrink-0">
                    <div class="flex flex-col">
                        <h3 class="font-display font-bold text-[20px] text-text-main">Giỏ hàng</h3>
                        <p class="text-[12px] text-text-sub">Bàn ${this.selectedTableId ? this.selectedTableId : '---'}</p>
                    </div>
                    <button class="size-10 flex items-center justify-center text-text-muted hover:bg-slate-100 rounded-full transition-colors" onclick="CreateOrderComponent.closeCartSheet()"><span class="material-symbols-outlined">close</span></button>
                </div>
                <div id="cart-sheet-content" class="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col"></div>
                <div class="p-6 border-t border-border-main bg-white shrink-0 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
                    <div class="grid grid-cols-2 gap-3">
                        <button onclick="CreateOrderComponent.closeCartSheet()" class="h-14 border border-slate-200 text-text-sub font-display font-bold text-[16px] rounded-2xl active:bg-slate-50 transition-all">Quay lại</button>
                        <button id="submit-order-btn" class="h-14 bg-primary text-white font-display font-bold text-[16px] rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">🍽 Xác nhận</button>
                    </div>
                </div>
            </div>

            <div id="table-overlay-orders" class="fixed inset-0 bg-black/60 z-[60] bottom-sheet-overlay hidden" onclick="CreateOrderComponent.closeTablePicker()"></div>
            <div id="table-sheet" class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] h-[60%] bg-white bottom-sheet hidden z-[70] rounded-t-3xl shadow-sheet p-6 flex flex-col gap-6 transition-transform">
                <div class="w-full flex justify-center -mt-2 mb-2 shrink-0"><div class="w-[40px] h-1.5 bg-slate-200 rounded-full"></div></div>
                <h3 class="font-display font-bold text-[18px]">Chọn bàn phục vụ</h3>
                <div id="table-grid-container" class="grid grid-cols-4 gap-3 overflow-y-auto no-scrollbar"></div>
            </div>
        `;

        this.init(container);
    },

    init: function (container) {
        this.renderDishes();
        this.updateCartDisplay();

        const searchInp = container.querySelector('#dish-search');
        if (searchInp) {
            searchInp.oninput = (e) => {
                this.searchQuery = e.target.value;
                this.renderDishes();
            };
        }

        container.querySelectorAll('.cat-tab').forEach(tab => {
            tab.onclick = () => {
                this.activeCategory = tab.dataset.category;
                // Re-render the component to update category tabs and dish list
                this.render(container, { table: this.selectedTableId, edit: this.editOrderId, mode: this.isAddMode ? 'add' : null });
            };
        });

        const trigger = container.querySelector('#table-select-trigger');
        if (trigger) trigger.onclick = () => this.openTablePicker();

        container.querySelector('#floating-cart').onclick = () => this.openCartSheet();
        container.querySelector('#submit-order-btn').onclick = () => this.submitOrder();
    },

    renderDishes: function () {
        const listEl = document.getElementById('dish-list-container');
        if (!listEl) return;

        let filtered = dishes.filter(d => {
            const matchesCat = this.activeCategory === 'all' || d.category === this.activeCategory;
            const matchesSearch = d.name.toLowerCase().includes(this.searchQuery.toLowerCase());
            return matchesCat && matchesSearch;
        });

        listEl.innerHTML = filtered.map(d => {
            const cartItem = this.cart.find(c => c.dishId === d.id);
            const qty = cartItem ? cartItem.qty : 0;
            return `
                <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex gap-4 relative transition-all active:scale-[0.99] border-l-4 ${qty > 0 ? 'border-l-primary' : 'border-l-transparent'}">
                    <div class="size-[72px] rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                        ${d.img ? `<img src="${d.img}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center text-slate-300"><span class="material-symbols-outlined text-[32px]">restaurant</span></div>`}
                    </div>
                    <div class="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
                        <div><h4 class="font-display font-bold text-[15px] text-text-main truncate">${d.name}</h4><span class="text-[10px] font-bold text-text-muted uppercase tracking-wider">${d.category}</span></div>
                        <span class="font-mono font-bold text-[15px] text-primary-orange">${formatCurrency(d.price)}</span>
                    </div>
                    <div class="flex items-center self-center shrink-0">
                        ${!d.available ? `<span class="bg-slate-100 text-text-muted px-2 py-1 rounded-lg text-[10px] font-bold">Hết</span>` : (
                    qty > 0 ? `<div class="flex items-center bg-primary/5 rounded-xl p-0.5 border border-primary/10">
                                <button onclick="CreateOrderComponent.updateCart(${d.id}, -1)" class="size-9 flex items-center justify-center text-primary"><span class="material-symbols-outlined">remove</span></button>
                                <span class="w-6 text-center font-bold text-primary">${qty}</span>
                                <button onclick="CreateOrderComponent.updateCart(${d.id}, 1)" class="size-9 flex items-center justify-center text-primary"><span class="material-symbols-outlined">add</span></button>
                            </div>` : `<button onclick="CreateOrderComponent.updateCart(${d.id}, 1)" class="size-10 bg-white border-2 border-primary text-primary rounded-full flex items-center justify-center shadow-sm active:bg-primary active:text-white transition-colors"><span class="material-symbols-outlined">add</span></button>`
                )}
                    </div>
                </div>
            `;
        }).join('');
    },

    updateCart: function (dishId, delta) {
        const index = this.cart.findIndex(c => c.dishId === dishId);
        if (index > -1) {
            this.cart[index].qty += delta;
            if (this.cart[index].qty <= 0) this.cart.splice(index, 1);
        } else if (delta > 0) {
            this.cart.push({ dishId, qty: 1 });
        }
        this.renderDishes();
        this.updateCartDisplay();
    },

    updateCartDisplay: function () {
        const totalQty = this.cart.reduce((acc, curr) => acc + curr.qty, 0);
        const totalPrice = this.cart.reduce((acc, curr) => acc + (dishes.find(d => d.id === curr.dishId).price * curr.qty), 0);

        const floatEl = document.getElementById('floating-cart');
        if (floatEl) {
            if (totalQty > 0) floatEl.classList.remove('hidden');
            else floatEl.classList.add('hidden');
            document.getElementById('cart-item-count').innerText = totalQty;
            document.getElementById('cart-total-price').innerText = formatCurrency(totalPrice);
        }
    },

    openTablePicker: function () {
        const grid = document.getElementById('table-grid-container');
        grid.innerHTML = tables.map(t => `
            <button onclick="CreateOrderComponent.selectTable('${t.id}')" class="h-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${t.id === this.selectedTableId ? 'bg-primary border-primary text-white font-bold shadow-md' : (t.status === 'occupied' && !this.isAddMode ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed' : 'bg-white border-border-main text-text-main')}">
                <span class="text-[14px] font-bold">${t.id}</span>
                <span class="text-[9px] uppercase">${t.status === 'occupied' ? 'Bận' : 'Sẵn sàng'}</span>
            </button>
        `).join('');
        document.getElementById('table-sheet').classList.remove('hidden');
        document.getElementById('table-overlay-orders').classList.remove('hidden');
    },

    selectTable: function (id) {
        const table = tables.find(t => t.id === id);
        // Allow selecting occupied tables if in add mode
        if (table && table.status === 'occupied' && !this.isAddMode) return;
        this.selectedTableId = id;
        const label = document.getElementById('selected-table-label');
        if (label) label.innerText = `Bàn ${id}`;
        this.closeTablePicker();
    },

    closeTablePicker: function () {
        document.getElementById('table-sheet').classList.add('hidden');
        document.getElementById('table-overlay-orders').classList.add('hidden');
    },

    openCartSheet: function () {
        const content = document.getElementById('cart-sheet-content');
        const totalPrice = this.cart.reduce((acc, curr) => acc + (dishes.find(d => d.id === curr.dishId).price * curr.qty), 0);

        content.innerHTML = `
            <div class="space-y-4">
                ${this.cart.map(item => {
            const dish = dishes.find(d => d.id === item.dishId);
            return `
                        <div class="flex items-center gap-4 py-4 border-b border-slate-50">
                            <div class="flex-1"><h4 class="font-display font-medium text-[15px] text-text-main">${dish.name}</h4><span class="font-mono text-primary-orange font-bold">${formatCurrency(dish.price)}</span></div>
                            <div class="flex items-center gap-2 bg-slate-50 rounded-xl p-1">
                                <button onclick="CreateOrderComponent.updateCart(${dish.id}, -1); CreateOrderComponent.openCartSheet();" class="size-8 flex items-center justify-center text-text-sub"><span class="material-symbols-outlined">remove</span></button>
                                <span class="w-6 text-center font-bold text-text-main">${item.qty}</span>
                                <button onclick="CreateOrderComponent.updateCart(${dish.id}, 1); CreateOrderComponent.openCartSheet();" class="size-8 flex items-center justify-center text-text-sub"><span class="material-symbols-outlined">add</span></button>
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>
            <div class="mt-8 flex justify-between items-end border-t border-border-main pt-6">
                <span class="font-bold text-text-sub">Tổng cộng ${this.isAddMode ? 'thêm' : ''}</span>
                <span class="font-mono font-bold text-[24px] text-primary">${formatCurrency(totalPrice)}</span>
            </div>
        `;
        document.getElementById('cart-sheet').classList.remove('hidden');
        document.getElementById('cart-overlay-orders').classList.remove('hidden');
    },

    closeCartSheet: function () {
        document.getElementById('cart-sheet').classList.add('hidden');
        document.getElementById('cart-overlay-orders').classList.add('hidden');
    },

    submitOrder: function () {
        if (!this.selectedTableId) return alert("Vui lòng chọn bàn!");
        if (this.cart.length === 0) return alert("Giỏ hàng đang trống!");

        const orderId = this.isEditMode ? this.editOrderId : (this.isAddMode ? null : `ORD-${Date.now().toString().slice(-6)}`);

        if (this.isAddMode || this.isEditMode) {
            // Find existing order for this table/id and update items
            const orderToUpdate = this.isEditMode ? orders.find(o => o.id === this.editOrderId) : orders.find(o => o.table === this.selectedTableId && o.status !== 'completed');

            if (orderToUpdate) {
                orderToUpdate.items = this.cart.map(item => {
                    const dish = dishes.find(d => d.id === item.dishId);
                    return { name: dish.name, qty: item.qty, price: dish.price, status: 'pending' };
                });
                alert(`Đã cập nhật đơn hàng bàn ${this.selectedTableId} thành công!`);
            }
        } else {
            // Create new order
            const newOrder = {
                id: orderId,
                table: this.selectedTableId,
                status: "pending",
                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                items: this.cart.map(item => {
                    const dish = dishes.find(d => d.id === item.dishId);
                    return { name: dish.name, qty: item.qty, price: dish.price, status: "pending" };
                }),
                timestamp: new Date()
            };
            orders.unshift(newOrder);

            // Mark table as occupied
            const table = tables.find(t => t.id === this.selectedTableId);
            if (table) {
                table.status = 'occupied';
                table.startTime = new Date();
                table.orderId = orderId;
            }
            alert(`Đã tạo đơn mới cho bàn ${this.selectedTableId} thành công!`);
        }

        this.cart = [];
        router.navigate('orders');
    }
};
