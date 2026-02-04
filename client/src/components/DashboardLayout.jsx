import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';

const DashboardLayout = () => {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* TopBar */}
                <header className="h-16 bg-white border-b border-gray-200 flex justify-between items-center px-8 shadow-sm z-10">
                    <div>
                         {/* Breadcrumbs or Page Title could go here (managed by global state or simple logic) */}
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        {/* Could add Profile Info / Avatar here too if removed from Sidebar bottom */}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};


export default DashboardLayout;
