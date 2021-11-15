import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

export interface DataTypeListItem {
    id: any;
    path: string;
    name: string;
}

interface Props {
    items: DataTypeListItem[];
    onClick: (id: string) => void;
}

export default function DataTypeList(props: Props) {


    const renderItem = (item: DataTypeListItem) => {
        return (
            <ListItem key={item.id} disablePadding>
                <ListItemButton sx={{minHeight: 32}} onClick={() => props.onClick(item.id)}>
                    <ListItemText primary={item.name} primaryTypographyProps={{ fontSize: 14, fontWeight: 'medium' }} />
                </ListItemButton>
            </ListItem>
        );
    }

    const renderItems = () => {
        return (<>{props.items.map(item => renderItem(item))}</>);
    }

    return (
        <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <nav aria-label="secondary mailbox folders">
                <List>
                    {renderItems()}
                </List>
            </nav>
        </Box>
    );
}
