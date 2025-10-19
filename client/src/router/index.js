import { createRouter, createWebHistory } from 'vue-router';
import Temp from '@/components/layouts/pages/Temp';
import Shop from '@/components/layouts/pages/Shop';
import Contact from '@/components/layouts/pages/Contact';
import Home from '@/components/layouts/pages/Home'
import Projects from '@/components/layouts/pages/Projects'
import Dashboard from '@/components/layouts/pages/Dashboard';
import DashboardLogin from '@/components/layouts/pages/DashboardLogin';
import Unsubscribe from '@/components/layouts/pages/Unsubscribe';
import NotFound from '@/components/layouts/pages/NotFound';
import Verify from '@/components/layouts/pages/Verify';
import PaymentSuccess from '@/components/layouts/pages/PaymentSuccess';

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: Home
		},
		{
			path: '/temp',
			name: 'temp',
			component: Temp
		},
		{
			path: '/contact',
			name: 'contact',
			component: Contact
		},
		{
			path: '/shop',
			name: 'shop',
			component: Shop
		},
		{
			path: '/us/shop',
			name: 'us/shop',
			component: Shop
		},
		{
			path: '/projects',
			name: 'projects',
			component: Projects
		},
		{
			path: '/dashboard',
			name: 'dashboard',
			component: Dashboard
		},
		{
			path: '/login',
			name: 'login',
			component: DashboardLogin
		},
		{
			path: '/unsubscribe',
			name: 'unsubscribe',
			component: Unsubscribe
		},
		{
			path: '/verify',
			name: 'verify',
			component: Verify
		},
		{
			path: '/payment_success',
			name: 'paymentSuccess',
			component: PaymentSuccess
		},
		{
			path: '/:pathMatch(.*)*',
			name: 'notFound',
			component: NotFound
		}
	]
});

export default router;
