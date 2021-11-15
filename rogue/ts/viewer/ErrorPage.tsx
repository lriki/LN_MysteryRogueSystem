import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
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
