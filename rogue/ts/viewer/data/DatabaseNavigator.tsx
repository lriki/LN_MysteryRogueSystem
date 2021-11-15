


import { Box, List, ListItem, ListItemButton, ListItemText, Tab, Tabs, Typography } from '@mui/material';
import * as React from 'react';
import { BrowserRouter, Route, useHistory } from 'react-router-dom';
import { tr2 } from 'ts/re/Common';
import { AppNavigator } from '../AppNavigator';
import { DataTypeListItem } from '../DataTypeList';

const dataTypeListItems: DataTypeListItem[] = [
    { id: "entities", name: "エンティティ" },
    { id: "skills", name: "スキル" },
    { id: "states", name: "ステート" },
];

interface Props {
	children?: React.ReactNode;
}

export function DatabaseNavigator(props: Props) {
    const history = useHistory();

    function selected(): number | undefined {
        if (history.location.pathname.includes("/database")) return 0;
        if (history.location.pathname.includes("/entities")) return 1;
        return undefined;
    }

    const handleChange = (item: DataTypeListItem) => {
        console.log("push!!");
        history.push("/database/states");
    };

    const handleItemClick = (item: DataTypeListItem) => {
        handleChange(item);
    }

    const renderItem = (item: DataTypeListItem) => {
        return (
            <ListItem key={item.id} disablePadding>
                <ListItemButton sx={{minHeight: 32}} onClick={() => handleItemClick(item)}>
                    <ListItemText primary={item.name} primaryTypographyProps={{ fontSize: 14, fontWeight: 'medium' }} />
                </ListItemButton>
            </ListItem>
        );
    }

    const renderItems = () => {
        return (<>{dataTypeListItems.map(item => renderItem(item))}</>);
    }

    return (
        <AppNavigator>
            <Box sx={{ width: '100%', maxWidth: 360, display: 'flex'  }}>
                <nav aria-label="secondary mailbox folders">
                    <List>
                        {renderItems()}
                    </List>
                </nav>
                <Box>
                    {props.children}
                </Box>
            </Box>
        </AppNavigator>
    );
}
