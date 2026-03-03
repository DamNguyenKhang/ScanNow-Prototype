class Router {
    constructor() {
        this.routes = {
            'orders': { title: 'Quản lý Đơn hàng', render: () => OrdersComponent.render() },
            'tables': { title: 'Sơ đồ bàn', render: () => TableMapComponent.render() },
            'create': { title: 'Tạo đơn mới', render: () => CreateOrderComponent.render() },
            'history': { title: 'Lịch sử giao dịch', render: () => OrdersComponent.renderHistory() },
            'report': { title: 'Báo cáo ca', render: () => ReportsComponent.render() }
        };
        this.currentView = null;
    }

    navigate(path, pushState = true) {
        if (!this.routes[path]) path = 'orders';

        const route = this.routes[path];

        // Update URL
        if (pushState) {
            const url = new URL(window.location);
            url.searchParams.set('view', path);
            window.history.pushState({ path }, '', url);
        }

        // Update Header Title
        const headerTitle = document.getElementById('header-title');
        if (headerTitle) {
            headerTitle.textContent = route.title;
        }

        // Update Navigation UI
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            item.classList.remove('bg-gray-50');
            item.style.backgroundColor = '';
            item.style.color = '';
            item.style.fontWeight = '';
        });
        const activeNav = document.getElementById(`nav-${path}`);
        if (activeNav) {
            activeNav.classList.add('active');
            activeNav.style.backgroundColor = '#EFF6FF';
            activeNav.style.color = '#2563EB';
            activeNav.style.fontWeight = '600';
        }

        // Render View View
        const appView = document.getElementById('views-container');
        if (!appView) return;

        // Apply exit transition if view exists
        if (appView.firstElementChild) {
            appView.firstElementChild.style.opacity = '0';
            setTimeout(() => {
                this._renderNewView(appView, route.render());
            }, 100);
        } else {
            this._renderNewView(appView, route.render());
        }

        this.currentView = path;
    }

    _renderNewView(container, content) {
        container.innerHTML = '';
        if (typeof content === 'string') {
            container.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            container.appendChild(content);
        }

        // Apply enter transition
        if (container.firstElementChild) {
            container.firstElementChild.classList.add('view-transition');
        }
    }
}

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.path) {
        router.navigate(e.state.path, false);
    }
});

// Initialize router globally
window.router = new Router();
