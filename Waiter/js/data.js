// Shared Data State
let orders = [
    {
        id: "ORD-20240115-042",
        table: "A3",
        status: "pending",
        time: "14:32",
        items: [
            { name: "Phở bò đặc biệt", qty: 1, price: 90000, status: "pending", note: "Nhiều hành" },
            { name: "Cơm chiên dương châu", qty: 2, price: 45000, status: "pending" }
        ],
        customer: "Nguyễn Văn A",
        note: "Vui lòng làm nóng cơm, Phở bỏ riêng nước.",
        timestamp: new Date(Date.now() - 8 * 60000) // 8m ago
    },
    {
        id: "ORD-20240115-039",
        table: "B1",
        status: "preparing",
        time: "14:15",
        items: [
            { name: "Bún chả Hà Nội", qty: 2, price: 65000, status: "preparing" },
            { name: "Nem rán", qty: 1, price: 35000, status: "ready" },
            { name: "Coca Cola", qty: 2, price: 15000, status: "ready" }
        ],
        customer: null,
        note: null,
        timestamp: new Date(Date.now() - 19 * 60000)
    },
    {
        id: "ORD-20240115-035",
        table: "C5",
        status: "ready",
        time: "13:55",
        items: [
            { name: "Cơm gà xối mỡ", qty: 1, price: 85000, status: "ready" },
            { name: "Pepsi", qty: 1, price: 15000, status: "ready" }
        ],
        customer: "Trần Thị B",
        note: null,
        timestamp: new Date(Date.now() - 47 * 60000)
    },
    {
        id: "ORD-20240115-050",
        table: "D2",
        status: "pending",
        time: "14:42",
        items: [
            { name: "Pizza Hải Sản", qty: 1, price: 180000, status: "pending" }
        ],
        customer: null,
        note: "Đơn hàng gấp!",
        timestamp: new Date(Date.now() - 12 * 60000) // 12m ago (URGENT)
    }
];

const tables = [
    { id: "A1", status: "empty", zone: "Tầng 1", seats: 4 },
    { id: "A2", status: "occupied", zone: "Tầng 1", seats: 4, orderId: "ORD-042", startTime: new Date(Date.now() - 42 * 60000) },
    { id: "A3", status: "empty", zone: "Tầng 1", seats: 2 },
    { id: "A4", status: "suspended", zone: "Tầng 1", seats: 4 },
    { id: "B1", status: "occupied", zone: "Tầng 1", seats: 6, orderId: "ORD-039", startTime: new Date(Date.now() - 15 * 60000) },
    { id: "B2", status: "empty", zone: "Tầng 1", seats: 4 },
    { id: "B3", status: "empty", zone: "Tầng 1", seats: 4 },
    { id: "B4", status: "occupied", zone: "Tầng 1", seats: 2, orderId: "ORD-051", startTime: new Date(Date.now() - 5 * 60000) },
    { id: "C1", status: "empty", zone: "VIP", seats: 8 },
    { id: "C2", status: "occupied", zone: "VIP", seats: 8, orderId: "ORD-022", startTime: new Date(Date.now() - 85 * 60000) },
    { id: "C5", status: "occupied", zone: "VIP", seats: 4, orderId: "ORD-035", startTime: new Date(Date.now() - 47 * 60000) },
    { id: "M1", status: "empty", zone: "Mang về", seats: 0 },
    { id: "M2", status: "empty", zone: "Mang về", seats: 0 }
];

const dishes = [
    { id: 101, name: "Phở bò đặc biệt", category: "main", price: 90000, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC00y7xYY_2n5cISAQmAiR-mxtLj3XyzLqUnq_zXbN40yR8ygFLtsCckvhA3sTcV_FACaiVo0_0RvdBrEb7pK5AGQaQ6f2Ainh0TmxgdEBJAzfO-66b0PL3I0cNMjZrKYr7Wn6GNkYo5RajllXEqsIOlBzHAUr1qaPlcR7u2XTWOXcCpcvlzZcx_XlfMRYH6KryoZy7J4IAL4f5a5g9eG-YqQ5lWcDaVs415l_z_965IkHsttQNFJr7ax37iFyQC77Qh0ZX8Gzi6EqW", available: true },
    { id: 102, name: "Gỏi cuốn tôm thịt", category: "starter", price: 45000, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5_DOzJsl9i4C4vGSRjRnDNS9zwx66tkD9yRule5ugq_dQh7y7K_kVdoaHtRsK0iuYT4pEJS7HxB6KPYW8OexuYULCKNpuj0_gkPWnH96ZWcaCFlUOLyriKvPAoZIaA6UZ_y04jmNVBfAvJA-E9b-qX3feu4-aLrp7OqwpJ4fZIFqB8NlocxxFn2pc4FEwrqrG7-Cu9OCyrYZSQSzssgIFDq1jtX-5wXunvmes05e_Vrap8L2eD7ztCXLauwTb2KA2xgkhTUVgZ5e0", available: true },
    { id: 103, name: "Cơm tấm sườn bì", category: "main", price: 75000, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHLPqkjcTZt8E0qk78qq-GzcvU3-dJ4nmbTuWDjpgW_EVjaTDYaJdJ9LiYtU7zaav7Pwm0IGylzpYeKw9y038jW5rNbpcAdlJOMMVrE3o-5A62x7jsY8-XB7vFY0oT6iOyZ6bzX8zTQCYqr8LtGJgamY12i1pBzarSGiDyQuitP9zzH2wa3a6_AYjhtHtDuZS6Vr5wmjTuMv7C7jRowiuSKgqXanOVTO2wfb3lHA9gdyW-8H_KlW2Vt31NiBjZMJxYcGeNSmd9MGWF", available: true },
    { id: 104, name: "Cà phê sữa đá", category: "drink", price: 35000, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGD8ek_tZyJFU5QwMiE_B_jsqHKARqJQslMF1mfWqoYQpY1TJoPldGbtr5UR6n2K2Y1FD8eMX9-pTHrfp4DzGXoZKpuaLt5r3Tl0tmJdFZtN4sCw_9xivFjoxoNWgS_mA8srPG2YQRNgSFbUoBFxlgANL1v1Sbiqc1zxhNOMY1L2wQQmiUTQlU35A55xlVgNC5kk4-IGMkBPb7oVmOnEv6aJ37xOU_d9OWV2qXIiRt57ZcSYpEw7_6SrjgNQKIsE7YrCy7eVR1m5uL", available: true },
    { id: 105, name: "Chè khúc bạch", category: "dessert", price: 40000, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDSP3-zFhD_aLCGc0cnnyG4uRZW8hJbPYQ4ESu-EELwp3omTnp-sWBBJ6FmhKkHcou98KAT5GPwgJJDyijiLZVUjX2LebZXlEUAEVL0MOyIibj2hVwSGIIOi9oAh6xaL-7DPioiqJP3rMOZmXiUvqK4fSnMc2nLqUDUqz_rBJ2pH_GlV7CkvocDPJgbJLYrTKZjTE6BWq2VyCM5c9Kb1Reo6TGSKm9XizpGd1DIntjiUhw1WNXsoZ0QvkXy4yaTr5XAi7JaUj9UZ75q", available: true },
    { id: 106, name: "Hủ tiếu Nam Vang", category: "main", price: 65000, img: "", available: false },
];

console.log("Shared data initialized.");

// Utility functions
function getTimeAgo(date) {
    const diffInMinutes = Math.floor((new Date() - date) / 60000);
    if (diffInMinutes < 1) return "Vừa xong";
    return `${diffInMinutes} phút trước`;
}

function formatCurrency(num) {
    return new Intl.NumberFormat('vi-VN').format(num) + ' ₫';
}

function getStatusBadge(status) {
    switch (status) {
        case 'pending': return `<span class="px-2 py-0.5 bg-status-pending/[0.12] text-status-pending text-[10px] font-bold uppercase rounded tracking-wider">Chờ XN</span>`;
        case 'preparing': return `<span class="px-2 py-0.5 bg-primary-orange/[0.12] text-primary-orange text-[10px] font-bold uppercase rounded tracking-wider">Đang làm</span>`;
        case 'ready': return `<span class="px-2 py-0.5 bg-status-ready/[0.12] text-status-ready text-[10px] font-bold uppercase rounded tracking-wider">Sẵn sàng</span>`;
        case 'completed': return `<span class="px-2 py-0.5 bg-text-sub/[0.12] text-text-sub text-[10px] font-bold uppercase rounded tracking-wider">Đã xong</span>`;
        default: return '';
    }
}

function showNewOrderToast(table, itemsCount) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = "bg-primary text-white rounded-[12px] p-[12px] shadow-float flex flex-col pointer-events-auto transform transition-all duration-500 -translate-y-full opacity-0";
    toast.innerHTML = `
        <div class="flex justify-between items-start">
            <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[20px]">notifications_active</span>
                <span class="font-body font-bold text-[14px]">🔔 Đơn mới — Bàn ${table} · ${itemsCount} món</span>
            </div>
            <span class="text-[10px] opacity-70">Vừa xong</span>
        </div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('-translate-y-full', 'opacity-0');
    }, 100);

    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}
