import * as React from 'react';
import { useHistory } from 'react-router-dom';

export interface DataTypeListItem {
    id: any;
    name: string;
}

interface Props {
    items: DataTypeListItem[];
    onClick: (id: string) => void;
}

export function ErrorPage() {
    const history = useHistory();

    return (
        <p>
            Page not found. {history.location.pathname}
        </p>
    );
}
