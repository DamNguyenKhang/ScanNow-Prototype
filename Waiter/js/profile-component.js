const ProfileComponent = {
    render: function (container) {
        container.innerHTML = `
            <div class="p-6 space-y-8 flex flex-col h-full overflow-y-auto no-scrollbar">
                <!-- User Header -->
                <div class="flex items-center gap-4 bg-white p-4 rounded-3xl border border-border-main shadow-card p-6">
                    <div class="size-20 bg-primary/10 rounded-full flex items-center justify-center border-4 border-primary/5">
                        <span class="material-symbols-outlined text-[40px] text-primary">account_circle</span>
                    </div>
                    <div>
                        <h3 class="font-display font-bold text-[22px] text-text-main">Nguyễn Văn Khương</h3>
                        <p class="text-[13px] text-text-muted font-medium bg-primary/5 px-2 py-0.5 rounded-full inline-block">Mã NV: NW2015</p>
                    </div>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-white p-4 rounded-3xl border border-border-main shadow-card flex flex-col items-center justify-center">
                        <span class="text-[11px] font-bold text-text-muted uppercase">Đã phục vụ</span>
                        <span class="font-display font-extrabold text-[24px] text-primary">12</span>
                    </div>
                    <div class="bg-white p-4 rounded-3xl border border-border-main shadow-card flex flex-col items-center justify-center">
                        <span class="text-[11px] font-bold text-text-muted uppercase">Doanh thu</span>
                        <span class="font-display font-extrabold text-[24px] text-primary-orange">4.2M</span>
                    </div>
                </div>

                <!-- Menu Settings -->
                <div class="space-y-3">
                    <h4 class="font-display font-bold text-[16px] text-text-main px-2">Cài đặt cá nhân</h4>
                    <div class="bg-white rounded-3xl border border-border-main shadow-card overflow-hidden">
                        <div class="p-4 flex items-center justify-between border-b border-border-main active:bg-slate-50 transition-colors">
                            <div class="flex items-center gap-3"><span class="material-symbols-outlined text-text-sub">edit</span><span class="text-[15px] font-medium">Chỉnh sửa thông tin</span></div>
                            <span class="material-symbols-outlined text-text-muted">chevron_right</span>
                        </div>
                        <div class="p-4 flex items-center justify-between border-b border-border-main active:bg-slate-50 transition-colors">
                            <div class="flex items-center gap-3"><span class="material-symbols-outlined text-text-sub">notifications</span><span class="text-[15px] font-medium">Thông báo đẩy</span></div>
                            <div class="w-10 h-5 bg-status-ready rounded-full relative"><div class="size-3.5 bg-white rounded-full absolute top-0.5 right-0.5"></div></div>
                        </div>
                         <div class="p-4 flex items-center justify-between border-b border-border-main active:bg-slate-50 transition-colors">
                            <div class="flex items-center gap-3"><span class="material-symbols-outlined text-text-sub">security</span><span class="text-[15px] font-medium">Bảo mật & mật khẩu</span></div>
                            <span class="material-symbols-outlined text-text-muted">chevron_right</span>
                        </div>
                    </div>
                </div>

                 <!-- Logout -->
                <button class="w-full h-14 bg-white text-red-500 font-display font-bold text-[16px] rounded-3xl border border-red-100 shadow-card active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-auto">
                    <span class="material-symbols-outlined">logout</span>
                    Đăng xuất
                </button>
            </div>
        `;
    }
};
