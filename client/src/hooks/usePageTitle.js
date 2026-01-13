import { useEffect } from 'react';

const usePageTitle = (title) => {
    useEffect(() => {
        document.title = `${title} | EduSaaS`;
    }, [title]);
};

export default usePageTitle;
