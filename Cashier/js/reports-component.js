const ReportsComponent = {
    render() {
        // Calculate mock stats from orders
        const completedOrders = window.appState.orders.filter(o => o.status === 'completed');
        const cancelledOrders = window.appState.orders.filter(o => o.status === 'cancelled');
        const refundedCount = 0; // Mock refund

        const revenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const cashRev = completedOrders.filter(o => o.paymentMethod === 'cash').reduce((sum, o) => sum + o.totalAmount, 0);
        const qrRev = completedOrders.filter(o => o.paymentMethod === 'payos' || o.paymentMethod === 'momo' || o.paymentMethod === 'qrcode').reduce((sum, o) => sum + o.totalAmount, 0);

        const cashPct = revenue > 0 ? Math.round((cashRev / revenue) * 100) : 0;
        const qrPct = revenue > 0 ? 100 - cashPct : 0;

        // Item stats
        const itemStats = {};
        completedOrders.forEach(o => {
            o.items.forEach(item => {
                if (!itemStats[item.id]) {
                    itemStats[item.id] = { name: item.name, quantity: 0, revenue: 0 };
                }
                itemStats[item.id].quantity += item.quantity;
                itemStats[item.id].revenue += item.quantity * item.price;
            });
        });

        const sortedItems = Object.values(itemStats).sort((a, b) => b.quantity - a.quantity);

        // 10 Giao dịch gần nhất
        const recentTxs = window.appState.orders
            .filter(o => o.status === 'completed' || o.status === 'cancelled')
            .sort((a, b) => b.time.localeCompare(a.time))
            .slice(0, 10);

        // Timeout to render charts after DOM is loaded
        setTimeout(() => this.initCharts(), 100);

        return `
            <div class="h-full bg-background-light p-4 md:p-6 overflow-y-auto custom-scrollbar">
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <h2 class="font-display font-bold text-[24px] text-text-main">Báo cáo ca làm việc</h2>
                        <p class="text-text-sub mt-1 text-sm">Tổng quan doanh thu, số liệu bán hàng & giao dịch hôm nay.</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="window.print()" class="px-4 py-2 bg-white border border-border-main text-text-main font-bold rounded-xl shadow-sm hover:!border-primary hover:text-primary transition-colors flex items-center gap-2">
                            <span class="material-symbols-outlined text-[20px]">ios_share</span>
                            <span class="hidden md:inline">Xuất Báo Cáo</span>
                        </button>
                        <button onclick="window.showToast('Kết thúc ca thành công!', 'success')" class="px-4 py-2 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <span class="material-symbols-outlined text-[20px]">logout</span>
                            <span class="hidden md:inline">Kết Thúc Ca</span>
                        </button>
                    </div>
                </div>

                <!-- Snapshot Widgets -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-white p-5 rounded-2xl border border-border-main shadow-sm flex flex-col justify-center gap-1">
                        <span class="text-[13px] font-bold text-text-muted uppercase tracking-wider">DOANH THU CA</span>
                        <div class="flex items-center justify-between">
                            <span class="font-display font-extrabold text-[28px] text-primary leading-none mt-1">${window.formatPrice(revenue)}</span>
                            <div class="size-10 bg-blue-50 text-primary rounded-xl flex items-center justify-center"><span class="material-symbols-outlined">monetization_on</span></div>
                        </div>
                    </div>
                    
                    <div class="bg-white p-5 rounded-2xl border border-border-main shadow-sm flex flex-col justify-center gap-1">
                        <span class="text-[13px] font-bold text-text-muted uppercase tracking-wider">TÌNH TRẠNG ĐƠN</span>
                        <div class="flex items-center gap-3 mt-1 text-sm">
                             <div class="flex flex-col"><span class="font-bold text-[20px] text-green-600 leading-none">${completedOrders.length}</span><span class="text-text-sub text-[11px]">Thành công</span></div>
                             <div class="w-px h-8 bg-gray-200"></div>
                             <div class="flex flex-col"><span class="font-bold text-[20px] text-red-500 leading-none">${cancelledOrders.length}</span><span class="text-text-sub text-[11px]">Đã hủy</span></div>
                             <div class="w-px h-8 bg-gray-200"></div>
                             <div class="flex flex-col"><span class="font-bold text-[20px] text-orange-500 leading-none">${refundedCount}</span><span class="text-text-sub text-[11px]">Hoàn tiền</span></div>
                        </div>
                    </div>

                    <div class="bg-white p-5 rounded-2xl border border-border-main shadow-sm flex flex-col justify-center gap-1">
                        <span class="text-[13px] font-bold text-text-muted uppercase tracking-wider">TRUNG BÌNH/ĐƠN</span>
                        <div class="flex items-center justify-between mt-1">
                            <span class="font-display font-extrabold text-[28px] text-text-main leading-none">${window.formatPrice(completedOrders.length > 0 ? revenue / completedOrders.length : 0)}</span>
                            <div class="size-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><span class="material-symbols-outlined">analytics</span></div>
                        </div>
                    </div>
                    
                    <div class="bg-white p-5 rounded-box border border-border-main shadow-sm flex flex-col justify-center gap-2">
                        <span class="text-[13px] font-bold text-text-muted uppercase tracking-wider">PHƯƠNG THỨC THANH TOÁN</span>
                        <div class="w-full h-3 bg-gray-100 flex overflow-hidden rounded-full mb-1">
                            <div class="bg-blue-600 h-full transition-all" style="width: ${cashPct}%"></div>
                            <div class="bg-[#1E2659] h-full transition-all" style="width: ${qrPct}%"></div>
                        </div>
                        <div class="flex justify-between text-[11px] font-bold uppercase text-text-muted">
                            <span class="text-blue-600 flex items-center gap-1"><span class="size-2 rounded-full bg-blue-600 inline-block"></span>Tiền mặt (${cashPct}%)</span>
                            <span class="text-[#1E2659] flex items-center gap-1"><span class="size-2 rounded-full bg-[#1E2659] inline-block"></span>QR Code (${qrPct}%)</span>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <!-- Timeline Chart -->
                    <div class="bg-white p-6 rounded-2xl border border-border-main shadow-sm flex flex-col lg:col-span-2">
                        <h3 class="font-bold text-[16px] mb-4">Biểu đồ doanh thu theo giờ</h3>
                        <div class="flex-1 min-h-[250px] relative w-full">
                            <canvas id="revenueTimelineChart"></canvas>
                        </div>
                    </div>
                    
                    <!-- 10 Recent Transactions -->
                    <div class="bg-white rounded-2xl border border-border-main shadow-sm flex flex-col overflow-hidden max-h-[350px]">
                        <div class="px-5 py-4 border-b border-border-main bg-gray-50 flex justify-between items-center shrink-0">
                            <h3 class="font-bold text-[15px]">10 Giao dịch gần nhất</h3>
                        </div>
                        <div class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                            ${recentTxs.map(tx => `
                                <div class="p-3 border ${tx.status === 'completed' ? 'border-gray-200' : 'border-red-100 bg-red-50/30'} rounded-lg flex justify-between items-center">
                                    <div class="flex flex-col">
                                        <span class="font-bold text-[13px] text-text-main">#${tx.id}</span>
                                        <span class="text-[11px] text-text-sub flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">schedule</span>${tx.time}</span>
                                    </div>
                                    <div class="flex flex-col items-end">
                                        <span class="font-bold text-[14px] ${tx.status === 'completed' ? 'text-green-600' : 'text-text-muted line-through'}">${window.formatPrice(tx.totalAmount)}</span>
                                        <span class="text-[10px] uppercase font-bold text-text-muted">${tx.status === 'completed' ? (tx.paymentMethod === 'cash' ? 'Tiền mặt' : 'QR Code') : 'Đã hủy'}</span>
                                    </div>
                                </div>
                            `).join('')}
                            ${recentTxs.length === 0 ? '<div class="text-center py-6 text-text-muted text-sm">Chưa có giao dịch.</div>' : ''}
                        </div>
                    </div>
                </div>

                <!-- Best Sellers List -->
                 <div class="bg-white rounded-2xl border border-border-main shadow-sm overflow-hidden w-full lg:w-2/3">
                    <div class="px-6 py-4 border-b border-border-main bg-gray-50 flex justify-between items-center">
                        <h3 class="font-bold text-[16px]">Sản phẩm bán chạy</h3>
                    </div>
                    <div class="divide-y divide-gray-100 max-h-[300px] overflow-y-auto custom-scrollbar">
                        <div class="flex items-center px-6 py-3 bg-white text-xs text-text-muted font-bold tracking-wider sticky top-0 z-10">
                            <div class="w-10">#</div>
                            <div class="flex-1">TÊN MÓN</div>
                            <div class="w-24 text-center">SỐ LƯỢNG</div>
                            <div class="w-32 text-right">DOANH THU</div>
                        </div>
                        ${sortedItems.map((item, index) => `
                        <div class="flex items-center px-6 py-3 hover:bg-gray-50 transition-colors bg-white group">
                            <div class="w-10 text-sm font-bold text-gray-400">${index + 1}</div>
                            <div class="flex-1 font-bold text-[14px] truncate pr-2 group-hover:text-primary transition-colors">${item.name}</div>
                            <div class="w-24 text-center">
                                <span class="bg-blue-50 text-primary font-bold px-2 py-0.5 rounded text-[13px]">${item.quantity}</span>
                            </div>
                            <div class="w-32 text-right font-bold text-text-sub">${window.formatPrice(item.revenue)}</div>
                        </div>
                        `).join('')}
                        ${sortedItems.length === 0 ? '<div class="p-6 text-center text-text-muted">Chưa có dữ liệu bán hàng.</div>' : ''}
                    </div>
                </div>
            </div>
        `;
    },

    initCharts() {
        const completedOrders = window.appState.orders.filter(o => o.status === 'completed');

        // Revenue Timeline Chart (Line)
        const ctxTimeline = document.getElementById('revenueTimelineChart');
        if (ctxTimeline) {
            // Group by hour
            const hourlyData = {};
            completedOrders.forEach(o => {
                const hourStr = o.time.split(':')[0] + ':00';
                if (!hourlyData[hourStr]) hourlyData[hourStr] = 0;
                hourlyData[hourStr] += o.totalAmount;
            });

            let labels = Object.keys(hourlyData).sort();
            let data = labels.map(l => hourlyData[l]);

            if (labels.length === 0) {
                labels = ['08:00', '09:00', '10:00', '11:00'];
                data = [0, 0, 0, 0];
            }

            new Chart(ctxTimeline, {
                type: 'bar', // Using bar for hour-by-hour is sometimes nicer, but let's use Line with smooth curve
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Doanh thu',
                        data: data,
                        borderColor: '#2563EB',
                        backgroundColor: 'rgba(37, 99, 235, 0.2)',
                        borderWidth: 2,
                        borderRadius: 4,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return window.formatPrice(context.raw);
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function (value) {
                                    return value >= 1000 ? (value / 1000) + 'k' : value;
                                }
                            },
                            grid: { color: '#F3F4F6' }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            });
        }
    }
};
