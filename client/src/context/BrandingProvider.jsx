import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const BrandingContext = createContext();

export const useBranding = () => useContext(BrandingContext);

const BrandingProvider = ({ children }) => {
    const { user, checkAccess } = useAuth();
    const [branding, setBranding] = useState({
        schoolName: 'Advance SMS',
        logo: null,
        primaryColor: '#16a34a',
        secondaryColor: '#f59e0b'
    });

    useEffect(() => {
        const root = document.documentElement;

        if (user && user.schoolId) {
            // Apply Custom Branding
            const primary = user.schoolId.branding?.primaryColor || '#16a34a';
            const secondary = user.schoolId.branding?.secondaryColor || '#f59e0b';
            const name = user.schoolId.name || 'Advance SMS';
            const logoUrl = user.schoolId.logo || null;

            root.style.setProperty('--color-primary', primary);
            root.style.setProperty('--color-secondary', secondary);
            
            setBranding({
                schoolName: name,
                logo: logoUrl,
                primaryColor: primary,
                secondaryColor: secondary
            });
        } else {
            // Revert to Defaults
            root.style.setProperty('--color-primary', '#16a34a');
            root.style.setProperty('--color-secondary', '#f59e0b');
            
             setBranding({
                schoolName: 'Advance SMS',
                logo: null,
                primaryColor: '#16a34a',
                secondaryColor: '#f59e0b'
            });
        }
    }, [user, checkAccess]);

    return (
        <BrandingContext.Provider value={branding}>
            {children}
        </BrandingContext.Provider>
    );
};

export default BrandingProvider;
