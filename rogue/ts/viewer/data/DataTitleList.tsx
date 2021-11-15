import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { Paper } from '@mui/material';

export interface DataTitleListItem {
    id: any;
    name: string;
}

interface Props {
    items: DataTitleListItem[];
    onClick: (id: any) => void;
}

export default function DataTitleList(props: Props) {


    const renderItem = (item: DataTitleListItem) => {
        return (
            <ListItem disablePadding>
                <ListItemButton sx={{py: 0, minHeight: 32}} onClick={() => props.onClick(item.id)}>
                    <ListItemText primary={item.name} primaryTypographyProps={{ fontSize: 14, fontWeight: 'medium' }} />
                </ListItemButton>
            </ListItem>
        );
    }

    const renderItems = () => {
        return (<>{props.items.map(item => renderItem(item))}</>);
    }

    return (
        <Paper style={{maxHeight: "100%", overflow: 'auto'}}>
            <nav aria-label="secondary mailbox folders">
                <List>
                    {renderItems()}
                </List>
            </nav>
        </Paper>
    );
}
