import { useEffect } from 'react';

const usePageTitle = (title) => {
    useEffect(() => {
        document.title = `${title} | GT-SchoolHub`;
    }, [title]);
};

export default usePageTitle;
