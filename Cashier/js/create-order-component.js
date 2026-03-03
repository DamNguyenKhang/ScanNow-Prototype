const CreateOrderComponent = {
    render() {
        // Initialize State Local for New Order
        window.newOrderState = {
            type: 'dine-in', // dine-in, takeaway
            tableId: null,
            items: []
        };

        return `
            <div class="h-full flex flex-col md:flex-row bg-[#F3F4F6]">
                <!-- Menu Selection Area -->
                <div class="flex-1 p-4 md:p-6 pb-[200px] md:pb-6 overflow-y-auto w-full md:w-2/3 h-full">
                    <div class="flex justify-between items-end mb-6">
                        <div>
                            <h2 class="font-display font-bold text-[24px] text-text-main">Thực đơn</h2>
                            <p class="text-text-sub mt-1">Chọn món ăn, thức uống để thêm vào đơn hàng mới.</p>
                        </div>
                        <div class="relative w-[300px] hidden lg:block">
                            <input type="text" placeholder="Tìm tên món ăn..." class="pl-10 pr-4 py-2 bg-white rounded-xl border border-border-main text-[14px] w-full shadow-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all">
                            <span class="material-symbols-outlined absolute left-3 top-2 text-text-muted">search</span>
                        </div>
                    </div>

                    <!-- Categories -->
                    <div class="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
                        <button class="px-4 py-2 bg-primary text-white rounded-full font-bold text-[14px] shadow-sm shadow-primary/30 shrink-0">Tất cả</button>
                        <button class="px-4 py-2 bg-white text-text-sub border border-border-main hover:border-primary hover:text-primary transition-colors rounded-full font-medium text-[14px] shrink-0">Món chính</button>
                        <button class="px-4 py-2 bg-white text-text-sub border border-border-main hover:border-primary hover:text-primary transition-colors rounded-full font-medium text-[14px] shrink-0">Món phụ</button>
                        <button class="px-4 py-2 bg-white text-text-sub border border-border-main hover:border-primary hover:text-primary transition-colors rounded-full font-medium text-[14px] shrink-0">Đồ uống</button>
                        <button class="px-4 py-2 bg-white text-text-sub border border-border-main hover:border-primary hover:text-primary transition-colors rounded-full font-medium text-[14px] shrink-0">Tráng miệng</button>
                    </div>

                    <!-- Menu Grid -->
                    <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id="menu-grid">
                        ${this.renderMenuGrid()}
                    </div>
                </div>

                <!-- Order Cart (Sticky on mobile bottom, right sidebar on desktop) -->
                <div class="w-full md:w-[380px] lg:w-[420px] bg-white border-t md:border-t-0 md:border-l border-border-main shadow-xl flex flex-col fixed md:relative bottom-0 left-0 h-[80vh] md:h-full z-40 transform translate-y-full transition-transform md:translate-y-0" id="cart-sidebar">
                    <!-- Mobile Toggle Handle (Hidden on Desktop) -->
                    <div class="w-full h-8 flex items-center justify-center md:hidden bg-gray-50 border-b border-gray-200 cursor-pointer rounded-t-2xl hover:bg-gray-100" onclick="document.getElementById('cart-sidebar').classList.toggle('translate-y-full')">
                        <div class="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                        <span class="absolute right-4 font-bold text-primary flex items-center gap-1"><span class="material-symbols-outlined text-[18px]">shopping_cart</span><span id="mobile-cart-badge">0</span></span>
                    </div>

                    <div class="p-4 md:p-6 border-b border-border-main bg-white">
                        <h3 class="font-display font-bold text-[20px] text-text-main mb-4">Chi tiết đơn hàng mới</h3>

                        <!-- Order Type Selection -->
                        <div class="flex gap-3 mb-4">
                            <button id="type-dine-in" onclick="CreateOrderComponent.selectType('dine-in')" class="flex-1 py-2 px-3 bg-blue-50 border-2 border-primary text-primary font-bold rounded-xl flex justify-center items-center gap-2 transition-colors">
                                <span class="material-symbols-outlined">table_restaurant</span> Tại bàn
                            </button>
                            <button id="type-takeaway" onclick="CreateOrderComponent.selectType('takeaway')" class="flex-1 py-2 px-3 bg-white border-2 border-border-main text-text-sub hover:border-gray-500 font-bold rounded-xl flex justify-center items-center gap-2 transition-colors">
                                <span class="material-symbols-outlined">takeout_dining</span> Mang đi
                            </button>
                        </div>

                        <!-- Table Selection (Only visible for dine-in) -->
                        <div id="table-selection-area" class="mb-2">
                            <label class="block text-[13px] font-bold text-text-sub mb-2">Chọn Bàn</label>
                            <select id="table-select" onchange="window.newOrderState.tableId = this.value" class="w-full border border-border-main rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary text-[15px] outline-none">
                                <option value="">-- Bấm để chọn bàn --</option>
                                ${window.mockTables.filter(t => t.status === 'empty').map(t => `<option value="${t.id}">${t.name} (Tối đa ${t.capacity} khách)</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- Cart Items -->
                    <div class="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50" id="cart-items-container">
                        ${this.renderCartItems()}
                    </div>

                    <!-- Checkout Box -->
                    <div class="p-4 md:p-6 border-t border-border-main bg-white">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-[14px] text-text-sub font-medium">Tạm tính</span>
                            <span class="font-bold text-[16px]" id="cart-subtotal">0 ₫</span>
                        </div>
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-[14px] text-text-sub font-medium">Khuyến mãi / Giảm giá</span>
                            <span class="font-bold text-[16px] text-red-500">0 ₫</span>
                        </div>
                        <div class="flex justify-between items-center py-3 border-t border-dashed border-gray-300">
                            <span class="text-[16px] font-bold text-text-main">TỔNG CỘNG</span>
                            <span class="font-display text-[28px] font-extrabold text-primary" id="cart-total">0 ₫</span>
                        </div>
                        <button onclick="CreateOrderComponent.submitOrder()" id="btn-submit-order" class="w-full py-4 bg-gray-300 text-white font-bold rounded-xl text-[16px] transition-all flex items-center justify-center gap-2 shadow-lg mt-2 cursor-not-allowed">
                            <span class="material-symbols-outlined">send</span> TẠO ĐƠN HÀNG
                        </button>
                    </div>
                </div>

                <!-- Show Cart Button for Mobile -->
                <button onclick="document.getElementById('cart-sidebar').classList.remove('translate-y-full')" class="md:hidden fixed bottom-[90px] right-6 size-14 bg-primary text-white rounded-full shadow-xl shadow-primary/30 flex items-center justify-center z-30 ring-4 ring-white">
                     <span class="material-symbols-outlined text-[28px]">shopping_cart</span>
                     <span id="mobile-cart-badge-float" class="absolute -top-1 -right-1 size-6 bg-red-500 rounded-full text-[11px] font-bold flex items-center justify-center border-2 border-white">0</span>
                </button>
            </div>
        `;
    },

    renderMenuGrid() {
        return window.mockMenu.map(m => `
            <div class="bg-white rounded-2xl border border-border-main p-3 hover:border-primary hover:shadow-card transition-all cursor-pointer flex flex-col group overflow-hidden relative" onclick="CreateOrderComponent.addToCart('${m.id}')">
                <div class="aspect-square bg-gray-100 rounded-xl mb-3 flex items-center justify-center group-hover:scale-[1.02] transition-transform overflow-hidden">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=random&color=fff&size=150" class="w-full h-full object-cover opacity-50 blur-sm" />
                    <span class="absolute font-bold text-gray-500 z-10 p-2 text-center text-[18px] bg-white/70 backdrop-blur rounded w-full line-clamp-2">${m.name}</span>
                </div>
                <div class="flex-1 flex flex-col justify-end">
                     <h3 class="font-bold text-[15px] text-text-main leading-tight mb-2 line-clamp-2">${m.name}</h3>
                     <div class="flex justify-between items-center mt-auto">
                        <span class="font-display font-bold text-[16px] text-primary">${window.formatPrice(m.price)}</span>
                        <button class="size-8 bg-blue-50 text-primary rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                            <span class="material-symbols-outlined text-[20px]">add</span>
                        </button>
                     </div>
                </div>
            </div>
        `).join('');
    },

    selectType(type) {
        window.newOrderState.type = type;
        const btnDineIn = document.getElementById('type-dine-in');
        const btnTakeaway = document.getElementById('type-takeaway');
        const tableArea = document.getElementById('table-selection-area');

        btnDineIn.className = "flex-1 py-2 px-3 bg-white border-2 border-border-main text-text-sub hover:border-gray-500 font-bold rounded-xl flex justify-center items-center gap-2 transition-colors";
        btnTakeaway.className = "flex-1 py-2 px-3 bg-white border-2 border-border-main text-text-sub hover:border-gray-500 font-bold rounded-xl flex justify-center items-center gap-2 transition-colors";

        if (type === 'dine-in') {
            btnDineIn.className = "flex-1 py-2 px-3 bg-blue-50 border-2 border-primary text-primary font-bold rounded-xl flex justify-center items-center gap-2 transition-colors ring-2 ring-primary/20";
            tableArea.style.display = 'block';
        } else {
            btnTakeaway.className = "flex-1 py-2 px-3 bg-orange-50 border-2 border-primary-orange text-primary-orange font-bold rounded-xl flex justify-center items-center gap-2 transition-colors ring-2 ring-orange-500/20";
            tableArea.style.display = 'none';
            // Also reset table selection if toggle back and forth
            window.newOrderState.tableId = null;
            document.getElementById('table-select').value = "";
        }

        this.updateCheckoutButtonState();
    },

    addToCart(menuId) {
        const item = window.mockMenu.find(m => m.id === menuId);
        if (!item) return;

        const cart = window.newOrderState.items;
        const existing = cart.find(cartItem => cartItem.id === item.id);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
                note: ''
            });
        }

        this.updateCartUI();

        // Minor animation feedback
        const el = document.getElementById('btn-submit-order');
        if (el) { el.classList.remove('scale-105'); void el.offsetWidth; el.classList.add('scale-105'); }
    },

    updateQuantity(itemId, change) {
        const cart = window.newOrderState.items;
        const index = cart.findIndex(i => i.id === itemId);
        if (index > -1) {
            cart[index].quantity += change;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
            this.updateCartUI();
        }
    },

    updateCartUI() {
        const cartContainer = document.getElementById('cart-items-container');
        if (cartContainer) {
            cartContainer.innerHTML = this.renderCartItems();
        }

        const totalAmount = window.newOrderState.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const qtyCount = window.newOrderState.items.reduce((sum, item) => sum + item.quantity, 0);

        const subtotalEl = document.getElementById('cart-subtotal');
        const totalEl = document.getElementById('cart-total');
        if (subtotalEl) subtotalEl.textContent = window.formatPrice(totalAmount);
        if (totalEl) totalEl.textContent = window.formatPrice(totalAmount);

        const mBadges = document.querySelectorAll('#mobile-cart-badge, #mobile-cart-badge-float');
        mBadges.forEach(b => b.textContent = qtyCount);

        this.updateCheckoutButtonState();
    },

    updateCheckoutButtonState() {
        const btn = document.getElementById('btn-submit-order');
        if (!btn) return;

        const hasItems = window.newOrderState.items.length > 0;
        const isValidTable = window.newOrderState.type === 'takeaway' || (window.newOrderState.type === 'dine-in' && window.newOrderState.tableId);

        if (hasItems && isValidTable) {
            btn.disabled = false;
            btn.className = "w-full py-4 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-[16px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30 mt-2 cursor-pointer";
        } else {
            btn.disabled = true;
            btn.className = "w-full py-4 bg-gray-300 text-white font-bold rounded-xl text-[16px] transition-all flex items-center justify-center gap-2 shadow-sm mt-2 cursor-not-allowed";
        }
    },

    renderCartItems() {
        if (!window.newOrderState.items || window.newOrderState.items.length === 0) {
            return `
                <div class="h-full flex flex-col items-center justify-center text-text-muted opacity-60">
                    <span class="material-symbols-outlined text-[64px] mb-4 text-gray-300">shopping_basket</span>
                    <p class="font-medium text-[15px]">Giỏ hàng đang trống.</p>
                    <p class="text-[13px] mt-1 text-center max-w-[200px]">Hãy chọn món từ thực đơn bên trái để thêm vào hóa đơn.</p>
                </div>
            `;
        }

        return window.newOrderState.items.map(item => `
            <div class="bg-white p-3 rounded-xl border border-border-main mb-3 shadow-sm flex flex-col relative group">
                <!-- Delete Button -->
                <button onclick="CreateOrderComponent.updateQuantity('${item.id}', -999)" class="absolute top-2 right-2 size-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                </button>
                
                <div class="flex justify-between items-start mb-2 pr-6">
                    <div class="flex flex-col">
                        <span class="font-bold text-[15px] truncate max-w-[180px]">${item.name}</span>
                        <span class="font-medium text-text-sub text-[13px]">${window.formatPrice(item.price)}</span>
                    </div>
                </div>

                <div class="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-gray-100">
                    <!-- Qty Control -->
                    <div class="flex items-center bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <button onclick="CreateOrderComponent.updateQuantity('${item.id}', -1)" class="w-8 h-8 flex items-center justify-center text-primary font-bold hover:bg-gray-200 transition-colors"><span class="material-symbols-outlined text-[18px]">remove</span></button>
                        <span class="w-8 h-8 flex items-center justify-center font-bold text-[14px] bg-white">${item.quantity}</span>
                        <button onclick="CreateOrderComponent.updateQuantity('${item.id}', 1)" class="w-8 h-8 flex items-center justify-center text-primary font-bold hover:bg-gray-200 transition-colors"><span class="material-symbols-outlined text-[18px]">add</span></button>
                    </div>
                    <span class="font-bold text-[16px] text-text-main">${window.formatPrice(item.price * item.quantity)}</span>
                </div>
            </div>
        `).join('');
    },

    submitOrder() {
        const state = window.newOrderState;
        if (state.items.length === 0) return;
        if (state.type === 'dine-in' && !state.tableId) return;

        // Construct mock order
        const newOrderId = `ORD-0${window.mockOrders.length + 1}`;
        const totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const newOrder = {
            id: newOrderId,
            tableId: state.type === 'dine-in' ? state.tableId : null,
            type: state.type,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            status: 'pending',
            paymentMethod: null,
            totalAmount: totalAmount,
            // deep copy items and add status 'pending'
            items: state.items.map(i => ({ ...i, status: 'pending' }))
        };

        // If table, change status to occupied
        if (state.tableId) {
            const table = window.mockTables.find(t => t.id === state.tableId);
            if (table) table.status = 'occupied';
        }

        // Add to global state
        window.appState.orders.unshift(newOrder);

        // Feedback
        window.showToast('Lên đơn hàng thành công!', 'success');

        // Clear cart
        document.getElementById('cart-sidebar').classList.add('translate-y-full'); // hide mobile cart

        setTimeout(() => {
            // Redirect to orders and view the newly created order
            window.activeOrderViewId = newOrder.id;
            router.navigate('orders');
        }, 300);
    }
};
