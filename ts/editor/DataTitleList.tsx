import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';

export interface DataTitleListItem {
    id: string;
    name: string;
}

interface Props {
    items: DataTitleListItem[];
    onClick: (id: string) => void;
}

export default function DataTitleList(props: Props) {


    const renderItem = (item: DataTitleListItem) => {
        return (
            <ListItem disablePadding>
                <ListItemButton sx={{py: 0, minHeight: 32}}>
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
