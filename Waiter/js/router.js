// Simple Router for Waiter SPA
const router = {
    currentView: null,

    navigate: function (viewId, params = {}) {
        if (this.currentView === viewId && Object.keys(params).length === 0) return;

        console.log(`Navigating to view: ${viewId}`, params);

        const appView = document.getElementById('app-view');
        appView.classList.remove('view-transition');
        void appView.offsetWidth; // Trigger reflow
        appView.classList.add('view-transition');

        // Clear children
        appView.innerHTML = '';

        // Update Nav UI
        document.querySelectorAll('.nav-item').forEach(el => {
            if (el.dataset.view === viewId) {
                el.classList.add('text-primary');
                el.classList.remove('text-text-muted');
                const span = el.querySelector('span:last-child');
                if (span) span.classList.add('font-bold');
            } else {
                el.classList.remove('text-primary');
                el.classList.add('text-text-muted');
                const span = el.querySelector('span:last-child');
                if (span) span.classList.remove('font-bold');
            }
        });

        const headerTitle = document.getElementById('header-title');
        const headerActions = document.getElementById('header-actions');
        headerActions.style.display = 'flex'; // Default

        switch (viewId) {
            case 'orders':
                headerTitle.innerText = "Đơn hàng";
                OrdersComponent.render(appView, params);
                break;
            case 'table-map':
                headerTitle.innerText = "Sơ đồ bàn";
                TableMapComponent.render(appView, params);
                break;
            case 'create-order':
                headerTitle.innerText = params.edit ? "Sửa đơn hàng" : "Tạo đơn mới";
                CreateOrderComponent.render(appView, params);
                break;
            case 'menu':
                headerTitle.innerText = "Thực đơn";
                MenuComponent.render(appView, params);
                break;
            case 'profile':
                headerTitle.innerText = "Tôi";
                ProfileComponent.render(appView, params);
                break;
            default:
                console.error("View not found:", viewId);
                router.navigate('orders');
        }

        this.currentView = viewId;

        // Update URL without reload (optional)
        const url = new URL(window.location);
        url.searchParams.set('view', viewId);
        window.history.pushState({}, '', url);
    }
};

window.addEventListener('popstate', () => {
    const view = new URLSearchParams(window.location.search).get('view') || 'orders';
    router.navigate(view, {});
});
