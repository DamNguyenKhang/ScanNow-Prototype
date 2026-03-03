// Mock Data for Cashier App

window.mockTables = Array.from({ length: 15 }, (_, i) => ({
    id: `B${i + 1}`,
    name: `Bàn ${i + 1}`,
    status: i < 5 ? 'occupied' : (i < 7 ? 'suspended' : 'empty'), // 5 occupied, 2 suspended, 8 empty
    capacity: 4
}));

window.mockMenu = [
    { id: 'm1', name: 'Phở Bò Kobe', price: 95000, category: 'main', outOfStock: false },
    { id: 'm2', name: 'Bún Chả Hà Nội', price: 55000, category: 'main', outOfStock: false },
    { id: 'm3', name: 'Cơm Tấm Sườn Bì Trứng', price: 65000, category: 'main', outOfStock: false },
    { id: 'm4', name: 'Gỏi Cuốn', price: 30000, category: 'side', outOfStock: false },
    { id: 'm5', name: 'Chả Giò Hải Sản', price: 45000, category: 'side', outOfStock: false },
    { id: 'm6', name: 'Trà Đá', price: 5000, category: 'drink', outOfStock: false },
    { id: 'm7', name: 'Cà Phê Sữa Đá', price: 25000, category: 'drink', outOfStock: false },
    { id: 'm8', name: 'Nước Ép Cam', price: 40000, category: 'drink', outOfStock: false },
    { id: 'm9', name: 'Bánh Flan', price: 20000, category: 'dessert', outOfStock: false },
    { id: 'm10', name: 'Chè Khúc Bạch', price: 35000, category: 'dessert', outOfStock: false },
];

window.mockOrders = [
    {
        id: 'ORD-001',
        tableId: 'B1',
        type: 'dine-in', // dine-in or takeaway
        time: '10:15',
        status: 'pending', // pending, completed, cancelled
        paymentMethod: null,
        totalAmount: 170000,
        items: [
            { id: 'm1', name: 'Phở Bò Kobe', quantity: 1, price: 95000, note: 'Ít bánh', status: 'pending' },
            { id: 'm2', name: 'Bún Chả Hà Nội', quantity: 1, price: 55000, note: '', status: 'ready' },
            { id: 'm9', name: 'Bánh Flan', quantity: 1, price: 20000, note: '', status: 'served' },
        ]
    },
    {
        id: 'ORD-002',
        tableId: 'B2',
        type: 'dine-in',
        time: '10:20',
        status: 'pending',
        paymentMethod: null,
        totalAmount: 130000,
        items: [
            { id: 'm3', name: 'Cơm Tấm Sườn Bì Trứng', quantity: 2, price: 65000, note: '', status: 'pending' }
        ]
    },
    {
        id: 'ORD-003',
        tableId: null,
        type: 'takeaway',
        time: '10:25',
        status: 'completed',
        paymentMethod: 'cash',
        totalAmount: 40000,
        items: [
            { id: 'm8', name: 'Nước Ép Cam', quantity: 1, price: 40000, note: 'Khách mang đi', status: 'served' }
        ]
    },
    {
        id: 'ORD-004',
        tableId: 'B3',
        type: 'dine-in',
        time: '09:45',
        status: 'completed',
        paymentMethod: 'payos',
        totalAmount: 220000,
        items: [
            { id: 'm1', name: 'Phở Bò Kobe', quantity: 2, price: 95000, note: '', status: 'served' },
            { id: 'm4', name: 'Gỏi Cuốn', quantity: 1, price: 30000, note: '', status: 'served' }
        ]
    },
    {
        id: 'ORD-005',
        tableId: null,
        type: 'takeaway',
        time: '09:10',
        status: 'completed',
        paymentMethod: 'payos',
        totalAmount: 90000,
        items: [
            { id: 'm5', name: 'Chả Giò Hải Sản', quantity: 2, price: 45000, note: '', status: 'served' }
        ]
    },
    {
        id: 'ORD-006',
        tableId: 'B4',
        type: 'dine-in',
        time: '08:30',
        status: 'completed',
        paymentMethod: 'cash',
        totalAmount: 185000,
        items: [
            { id: 'm3', name: 'Cơm Tấm Sườn Bì Trứng', quantity: 2, price: 65000, note: '', status: 'served' },
            { id: 'm2', name: 'Bún Chả Hà Nội', quantity: 1, price: 55000, note: '', status: 'served' }
        ]
    },
    {
        id: 'ORD-007',
        tableId: 'B5',
        type: 'dine-in',
        time: '11:00',
        status: 'pending',
        paymentMethod: null,
        totalAmount: 60000,
        items: [
            { id: 'm7', name: 'Cà Phê Sữa Đá', quantity: 2, price: 25000, note: '', status: 'pending' },
            { id: 'm6', name: 'Trà Đá', quantity: 2, price: 5000, note: '', status: 'served' }
        ]
    },
    {
        id: 'ORD-008',
        tableId: null,
        type: 'takeaway',
        time: '11:15',
        status: 'completed',
        paymentMethod: 'payos',
        totalAmount: 130000,
        items: [
            { id: 'm1', name: 'Phở Bò Kobe', quantity: 1, price: 95000, note: '', status: 'served' },
            { id: 'm10', name: 'Chè Khúc Bạch', quantity: 1, price: 35000, note: '', status: 'served' }
        ]
    },
    {
        id: 'ORD-009',
        tableId: 'B6',
        type: 'dine-in',
        time: '11:20',
        status: 'pending',
        paymentMethod: null,
        totalAmount: 155000,
        items: [
            { id: 'm2', name: 'Bún Chả Hà Nội', quantity: 1, price: 55000, note: '', status: 'pending' },
            { id: 'm3', name: 'Cơm Tấm Sườn Bì Trứng', quantity: 1, price: 65000, note: '', status: 'pending' },
            { id: 'm10', name: 'Chè Khúc Bạch', quantity: 1, price: 35000, note: '', status: 'pending' }
        ]
    },
    {
        id: 'ORD-010',
        tableId: null,
        type: 'takeaway',
        time: '11:30',
        status: 'pending',
        paymentMethod: null,
        totalAmount: 110000,
        items: [
            { id: 'm2', name: 'Bún Chả Hà Nội', quantity: 2, price: 55000, note: '', status: 'pending' }
        ]
    },
];

window.formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

window.showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transform transition-all duration-300 translate-y-[-20px] opacity-0 text-white ${type === 'success' ? 'bg-status-ready' :
            type === 'error' ? 'bg-red-500' : 'bg-status-pending'
        }`;

    toast.innerHTML = `
        <span class="material-symbols-outlined text-[20px]">
            ${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
        </span>
        <span class="font-medium text-[14px]">${message}</span>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-[-20px]', 'opacity-0');
    });

    // Remove after 3s
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-[-20px]');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Application State
window.appState = {
    orders: [...window.mockOrders],
    currentOrder: null // For Order detail modal or current active order
};
