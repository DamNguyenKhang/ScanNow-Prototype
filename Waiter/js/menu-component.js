const MenuComponent = {
    activeCategory: "all",
    searchQuery: "",

    render: function (container, params) {
        container.innerHTML = `
            <div class="flex flex-col h-full">
                <div class="px-4 mt-3 shrink-0">
                    <div class="relative group">
                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
                        <input class="w-full h-[40px] pl-10 pr-4 bg-[#F8F7F4] border-1.5 border-border-main rounded-[10px] outline-none placeholder:text-text-muted text-[14px] font-body" placeholder="Tìm món ăn, đồ uống..." type="text" id="menu-search" value="${this.searchQuery}" />
                    </div>
                </div>

                <div class="flex overflow-x-auto no-scrollbar px-4 gap-2 my-4 shrink-0">
                    <button class="cat-tab ${this.activeCategory === 'all' ? 'bg-primary text-white' : 'bg-[#F1EFE9] text-text-sub'} flex-none px-4 py-1.5 rounded-full text-[13px] font-body font-medium transition-all" data-category="all">Tất cả</button>
                    ${["starter", "main", "drink", "dessert"].map(cat => `
                        <button class="cat-tab ${this.activeCategory === cat ? 'bg-primary text-white' : 'bg-[#F1EFE9] text-text-sub'} flex-none px-4 py-1.5 rounded-full text-[13px] font-body font-medium transition-all" data-category="${cat}">${cat === 'starter' ? 'Khai vị' : cat === 'main' ? 'Món chính' : cat === 'drink' ? 'Đồ uống' : 'Tráng miệng'}</button>
                    `).join('')}
                </div>

                <main class="flex-1 overflow-y-auto no-scrollbar p-4">
                    <div id="menu-list" class="space-y-4 pb-28"></div>
                </main>
            </div>
        `;

        this.init(container);
    },

    init: function (container) {
        this.renderMenu();
        container.querySelector('#menu-search').oninput = (e) => {
            this.searchQuery = e.target.value;
            this.renderMenu();
        };

        container.querySelectorAll('.cat-tab').forEach(tab => {
            tab.onclick = () => {
                container.querySelectorAll('.cat-tab').forEach(t => t.classList.replace('bg-primary', 'bg-[#F1EFE9]'));
                container.querySelectorAll('.cat-tab').forEach(t => t.classList.replace('text-white', 'text-text-sub'));
                tab.classList.replace('bg-[#F1EFE9]', 'bg-primary');
                tab.classList.replace('text-text-sub', 'text-white');
                this.activeCategory = tab.dataset.category;
                this.renderMenu();
            };
        });
    },

    renderMenu: function () {
        const listEl = document.getElementById('menu-list');
        if (!listEl) return;

        let filtered = dishes.filter(d => {
            const matchesCat = this.activeCategory === 'all' || d.category === this.activeCategory;
            const matchesSearch = d.name.toLowerCase().includes(this.searchQuery.toLowerCase());
            return matchesCat && matchesSearch;
        });

        listEl.innerHTML = filtered.map(d => `
            <div class="bg-white border border-border-main rounded-[16px] p-4 shadow-card flex items-center gap-4 active:scale-[0.98] transition-all">
                <div class="size-[80px] rounded-[12px] overflow-hidden bg-slate-100 shrink-0">
                    ${d.img ? `<img src="${d.img}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center bg-slate-200"><span class="material-symbols-outlined text-text-muted">restaurant</span></div>`}
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-start mb-1">
                        <h4 class="font-display font-bold text-[15px] text-text-main">${d.name}</h4>
                        <span class="text-[14px] font-price font-bold text-primary-orange">${formatCurrency(d.price)}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-[11px] text-text-muted uppercase tracking-wider">${d.category}</span>
                        <div class="flex items-center gap-2">
                            <span class="text-[11px] ${d.available ? 'text-status-ready' : 'text-text-muted'} font-bold">${d.available ? 'Còn hàng' : 'Hết hàng'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    toggleAvailable: function (id) {
        const d = dishes.find(x => x.id === id);
        if (d) {
            d.available = !d.available;
            this.renderMenu();
        }
    }
};
