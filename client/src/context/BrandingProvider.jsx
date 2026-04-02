import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const BrandingContext = createContext();

export const useBranding = () => useContext(BrandingContext);

const BrandingProvider = ({ children }) => {
    const { user, checkAccess } = useAuth();
    const [branding, setBranding] = useState({
        schoolName: 'GT-SchoolHub',
        logo: null,
        primaryColor: '#16a34a',
        secondaryColor: '#f59e0b'
    });

    useEffect(() => {
        const root = document.documentElement;

        const school = user?.schoolId;
        if (school && typeof school === 'object') {
            const isPremium = school.subscription?.plan === 'Premium';

            // Base branding attributes
            const name = school.name || 'GT-SchoolHub';
            const logoUrl = school.logoUrl || null;
            
            // Default colors
            let primary = '#16a34a';
            let secondary = '#f59e0b';

            if (isPremium) {
                // Apply Custom Branding Colors
                primary = school.branding?.primaryColor || primary;
                secondary = school.branding?.secondaryColor || secondary;
            }

            // Inject CSS variables into :root
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
                schoolName: 'GT-SchoolHub',
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
